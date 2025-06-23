import bcrypt from "bcryptjs";
import Booking from "../models/BookingSchema.js";
import Doctor from "../models/DoctorSchema.js";

// Update Doctor (with password hashing if needed)
export const updateDoctor = async (req, res) => {
  const id = req.params.id;

  try {
    // If password is included in request, hash it
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Doctor updated successfully",
      data: updatedDoctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update doctor",
      data: error.message,
    });
  }
};

// Delete Doctor
export const deleteDoctor = async (req, res) => {
  const id = req.params.id;

  try {
    await Doctor.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Doctor deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete doctor",
      data: error.message,
    });
  }
};

// Get Single Doctor
export const getSingleDoctor = async (req, res) => {
  const id = req.params.id;

  try {
    const doctor = await Doctor.findById(id)
      .populate("reviews")
      .select("-password");

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Doctor retrieved successfully",
      data: doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve doctor",
      data: error.message,
    });
  }
};

// Get All Approved Doctors (with optional search)
export const getAllDoctor = async (req, res) => {
  try {
    const { query } = req.query;
    let doctors;

    if (query) {
      doctors = await Doctor.find({
        isApproved: "approved",
        $or: [
          { name: { $regex: query, $options: "i" } },
          { specialization: { $regex: query, $options: "i" } },
        ],
      }).select("-password");
    } else {
      doctors = await Doctor.find({ isApproved: "approved" }).select("-password");
    }

    res.status(200).json({
      success: true,
      message: "Doctors retrieved successfully",
      data: doctors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve doctors",
      data: error.message,
    });
  }
};

// Get Doctor Profile (and appointments)
export const getDoctorProfile = async (req, res) => {
  const doctorId = req.userId;

  try {
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const { password, ...rest } = doctor._doc;
    const appointments = await Booking.find({ doctor: doctorId });

    res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      data: { ...rest, appointments },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to get profile",
    });
  }
};
