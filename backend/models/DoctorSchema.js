import mongoose from "mongoose";

const DoctorSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
  },
  photo: {
    type: String,
  },
  ticketPrice: {
    type: Number,
  },
  role: {
    type: String,
  },

  // Unique fields for doctors only
  specialization: { type: String },
  qualifications: {
    type: Array,
  },

  experiences: {
    type: Array,
  },

  bio: { type: String, maxLength: 500 },
  about: { type: String },
  timeSlots: { type: Array },
  reviews: [{ type: mongoose.Types.ObjectId, ref: "Review" }],
  averageRating: {
    type: Number,
    default: 0,
  },
  totalRating: {
    type: Number,
    default: 0,
  },
  isApproved: {
    type: String,
    enum: ["pending", "approved", "cancelled"],
    default: "pending",
  },
  appointments: [
    {
      userName: { type: String },
      isPaid: { type: Boolean },
      ticketPrice: { type: Number },
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

// ✅ This prevents OverwriteModelError on hot-reload
export default mongoose.models.Doctor || mongoose.model("Doctor", DoctorSchema);
