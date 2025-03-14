const mongoose = require("mongoose");

const DoctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  Disease: [{ type: String, required: true }],
  clinicAddress: { type: String, required: true },
  contact: { type: String, required: true },
  googleMapsLink: { type: String },
  availableAppointments: { type: String },
  whatsappLink: { type: String },
});

const Doctor = mongoose.model("Doctor", DoctorSchema);

module.exports = Doctor;
