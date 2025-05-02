const express = require("express");
const router = express.Router();
const Doctor = require("../models/doctorModel");
const User = require("../models/userModel");
const Review = require("../models/reviewModel");
const auth = require("../../../middlewares/authMiddleware");
const roleMiddleware = require("../../../middlewares/roleMiddleware");
const bcrypt = require("bcrypt");

// Helper function to parse and compare appointment slots
const compareAppointmentSlots = (slotA, slotB) => {
  const dateA = new Date(slotA);
  const dateB = new Date(slotB);
  return dateA - dateB;
};

// Helper function to check if an appointment slot is in the future
const isSlotInFuture = (slot) => {
  const slotDate = new Date(slot);
  const now = new Date();
  return slotDate > now;
};

// Get doctor appointments' slots
router.get("/appointments/:doctorId", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.doctorId);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    res.json({ status: "success", data: doctor.availableAppointments });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch available appointments" });
  }
});

// User chooses an appointment
// router.post("/appointments/book", auth, async (req, res) => {
//   try {
//     const { doctorId, appointmentSlot, disease } = req.body;

//     const doctor = await Doctor.findById(doctorId);
//     if (!doctor) return res.status(404).json({ error: "Doctor not found" });

//     // Check and remove slot from available
//     doctor.availableAppointments = doctor.availableAppointments.filter(
//       (slot) => slot !== appointmentSlot
//     );

//     // Save the booked appointment inside doctor's appointments
//     doctor.appointments.push({
//       userId: req.user.id,
//       appointmentSlot,
//       disease,
//       status: "pending",
//     });

//     await doctor.save();

//     res.json({ status: "success", message: "Appointment booked" });
//   } catch (err) {
//     res.status(500).json({ error: "Failed to book appointment" });
//   }
// });

// User chooses an appointment
router.post("/appointments/book", auth, async (req, res) => {
  try {
    const { doctorId, appointmentSlot, disease } = req.body;

    // Validate input
    if (!doctorId || !appointmentSlot) {
      return res.status(400).json({
        status: "fail",
        message: "Doctor ID and appointment slot are required",
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    // Check if the slot exists and is available
    const slotExists = doctor.availableAppointments.some(
      (slot) => slot.appointmentSlot === appointmentSlot
    );
    if (!slotExists) {
      return res.status(400).json({
        status: "fail",
        message: "Appointment slot is not available",
      });
    }

    // Check if slot is in the future
    if (!isSlotInFuture(appointmentSlot)) {
      return res.status(400).json({
        status: "fail",
        message: "Cannot book a slot in the past",
      });
    }

    // Remove the slot from availableAppointments
    doctor.availableAppointments = doctor.availableAppointments.filter(
      (slot) => slot.appointmentSlot !== appointmentSlot
    );

    // Save the booked appointment inside doctor's appointments
    doctor.appointments.push({
      userId: req.user.id,
      appointmentSlot,
      disease,
      status: "pending",
    });

    await doctor.save();

    res.json({ status: "success", message: "Appointment booked successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to book appointment" });
  }
});

// Post rate and comment (User rates doctor)
router.post("/reviews/add", auth, roleMiddleware("user"), async (req, res) => {
  try {
    const { doctorId, rating, comment } = req.body;

    const newReview = await Review.create({
      doctorId,
      userId: req.user.id,
      rating,
      comment,
    });

    const user = await User.findById(req.user.id).select(
      "fullName email contact"
    );

    res.json({
      status: "success",
      data: {
        review: newReview,
        user: user,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all reviews and average rating for doctor
router.get("/reviews/:doctorId", async (req, res) => {
  try {
    const reviews = await Review.find({ doctorId: req.params.doctorId });
    console.log(req.params.doctorId);

    const averageRating = reviews.length
      ? (
          reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
        ).toFixed(2)
      : 0;

    res.json({
      status: "success",
      data: {
        reviews,
        averageRating,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch doctor reviews" });
  }
});

module.exports = router;
