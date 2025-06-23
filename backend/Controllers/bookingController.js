import User from "../models/UserSchema.js";
import Doctor from "../models/DoctorSchema.js";
import Booking from "../models/BookingSchema.js";
import Stripe from "stripe";

export const getCheckoutSession = async (req, res) => {
  try {
    const { timeSlot } = req.body;

    console.log("Request body:", req.body);

    if (
      !timeSlot ||
      !timeSlot.day ||
      !timeSlot.startingTime ||
      !timeSlot.endingTime
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid timeSlot data" });
    }

    const doctor = await Doctor.findById(req.params.doctorId);
    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${process.env.CLIENT_SITE_URL}/checkout-success`,
      cancel_url: `${req.protocol}://${req.get("host")}/doctors/${doctor._id}`,
      customer_email: user.email,
      client_reference_id: req.params.doctorId,
      line_items: [
        {
          price_data: {
            currency: "inr", // ✅ Correct currency
            unit_amount: doctor.ticketPrice * 100, // ✅ Convert rupees to paise
            product_data: {
              name: `Appointment with Dr. ${doctor.name}`,
              description: doctor.bio || "No description available",
              images: doctor.photo ? [doctor.photo] : [],
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        doctorId: doctor._id.toString(),
        userId: user._id.toString(),
        timeSlot: JSON.stringify(timeSlot),
      },
    });

    const booking = new Booking({
      doctor: doctor._id,
      user: user._id,
      ticketPrice: doctor.ticketPrice,
      appointmentDate: new Date(), // You can adjust if needed
      isPaid: true,
      status: "pending",
    });

    await booking.save();

    const slotIndex = doctor.timeSlots.findIndex(
      (slot) =>
        slot.day === timeSlot.day &&
        slot.startingTime === timeSlot.startingTime &&
        slot.endingTime === timeSlot.endingTime
    );

    if (slotIndex !== -1) {
      doctor.timeSlots[slotIndex].isBooked = true;
    }

    doctor.appointments.push({
      userName: user.name,
      isPaid: true,
      ticketPrice: doctor.ticketPrice,
      createdAt: new Date(),
    });

    await doctor.save();

    return res
      .status(200)
      .json({ success: true, message: "Successfully paid", session });
  } catch (error) {
    console.error("Stripe session error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Error creating checkout session" });
  }
};
