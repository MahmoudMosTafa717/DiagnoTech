const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/authMiddleware");
const roleMiddleware = require("../../../middlewares/roleMiddleware");

const Doctor = require("../models/doctorModel");
const Appointment = require("../../appointment/models/appointmentModel");

// ✅ Get doctor profile
router.get("/", auth, roleMiddleware("doctor"), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id }).populate(
      "userId",
      "fullName email"
    );
    if (!doctor)
      return res.status(404).json({ error: "Doctor profile not found" });

    res.json({ status: "success", data: doctor });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch doctor profile" });
  }
});

// ✅ Update profile info
router.put("/update", auth, roleMiddleware("doctor"), async (req, res) => {
  try {
    const {
      specialty,
      Disease,
      clinicAddress,
      contact,
      googleMapsLink,
      whatsappLink,
    } = req.body;

    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor)
      return res.status(404).json({ error: "Doctor profile not found" });

    doctor.specialty = specialty || doctor.specialty;
    doctor.Disease = Disease || doctor.Disease;
    doctor.clinicAddress = clinicAddress || doctor.clinicAddress;
    doctor.contact = contact || doctor.contact;
    doctor.googleMapsLink = googleMapsLink || doctor.googleMapsLink;
    doctor.whatsappLink = whatsappLink || doctor.whatsappLink;

    await doctor.save();

    res.json({ status: "success", message: "Profile updated", data: doctor });
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// ✅ Update available appointment slots
router.put(
  "/appointments/update",
  auth,
  roleMiddleware("doctor"),
  async (req, res) => {
    try {
      const { availableAppointments } = req.body;
      const doctor = await Doctor.findOne({ userId: req.user.id });
      if (!doctor)
        return res.status(404).json({ error: "Doctor profile not found" });

      doctor.availableAppointments = availableAppointments;
      await doctor.save();

      res.json({
        status: "success",
        message: "Available appointments updated",
        data: doctor.availableAppointments,
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to update appointments" });
    }
  }
);

// ✅ Get booked and unbooked appointments
router.get(
  "/appointments",
  auth,
  roleMiddleware("doctor"),
  async (req, res) => {
    try {
      const doctor = await Doctor.findOne({ userId: req.user.id });
      if (!doctor) return res.status(404).json({ error: "Doctor not found" });

      // Get booked appointments
      const bookedAppointments = await Appointment.find({
        doctorId: req.user.id,
      }).populate("userId", "fullName email");

      // Extract booked times
      const bookedSlots = bookedAppointments.map(
        (appt) => appt.appointmentSlot
      );

      // Get unbooked slots from doctor model
      const unbookedSlots = doctor.availableAppointments.filter(
        (slot) => !bookedSlots.includes(slot)
      );

      res.json({
        status: "success",
        data: {
          booked: bookedAppointments,
          unbooked: unbookedSlots,
        },
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch appointments" });
    }
  }
);

module.exports = router;
