const mongoose = require("mongoose");

const DoctorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  specialty: { type: String, required: true },
  // gender: { type: String },
  // age: { type: Number },
  // experience: { type: String },
  Disease: [{ type: String }],
  clinicAddress: { type: String, required: true },
  contact: { type: String, required: true },
  googleMapsLink: { type: String },
  availableAppointments: [{ type: String }],
  whatsappLink: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Doctor = mongoose.model("Doctor", DoctorSchema);

module.exports = Doctor;
