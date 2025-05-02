const mongoose = require("mongoose");

const DoctorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  specialty: { type: String, required: true },
  gender: { type: String },
  age: { type: Number },
  experience: { type: String },
  Disease: [{ type: String }],
  clinicAddress: { type: String, required: true },
  contact: { type: String, required: true },
  googleMapsLink: { type: String },
  whatsappLink: { type: String },

  availableAppointments: [
    {
      appointmentSlot: { type: String },
      isBooked: { type: Boolean, default: false },
    },
  ],

  appointments: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      appointmentSlot: { type: String },
      disease: { type: String },
      status: {
        type: String,
        enum: ["pending", "confirmed", "completed", "cancelled"],
        default: "pending",
      },
      bookedAt: { type: Date, default: Date.now },
    },
  ],

  createdAt: { type: Date, default: Date.now },
});

const Doctor = mongoose.model("Doctor", DoctorSchema);

module.exports = Doctor;
