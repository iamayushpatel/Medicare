import bcrypt from "bcryptjs";
import User from "../models/UserSchema.js";
import Booking from "../models/BookingSchema.js";
import Doctor from "../models/DoctorSchema.js";

// Update user (with password hashing)
export const updateUser = async (req, res) => {
  const id = req.params.id;

  try {
    // If password is included in request, hash it
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Successfully updated",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update!",
      data: error.message,
    });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  const id = req.params.id;

  try {
    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Successfully deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete!",
      data: error.message,
    });
  }
};

// Get single user
export const getSingleUser = async (req, res) => {
  const id = req.params.id;

  try {
    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No User Found!",
      });
    }

    res.status(200).json({
      success: true,
      message: "User Found",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve user!",
      data: error.message,
    });
  }
};

// Get all users
export const getAllUser = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json({
      success: true,
      message: "Users Found",
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve users!",
      data: error.message,
    });
  }
};

// Get user profile
export const getUserProfile = async (req, res) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { password, ...rest } = user._doc;

    res.status(200).json({
      success: true,
      message: "Profile info is getting",
      data: rest,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong, cannot get profile",
    });
  }
};

// Get my appointments
export const getMyAppointments = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.userId });

    const doctorIds = bookings.map((el) => el.doctor.id);

    const doctors = await Doctor.find({ _id: { $in: doctorIds } }).select(
      "-password"
    );

    res.status(200).json({
      success: true,
      message: "Appointments are getting",
      data: doctors,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong, cannot get appointments",
    });
  }
};
