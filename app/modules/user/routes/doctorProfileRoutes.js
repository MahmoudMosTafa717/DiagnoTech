// doctorProfileRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/authMiddleware");
const roleMiddleware = require("../../../middlewares/roleMiddleware");
const Doctor = require("../models/doctorModel");
const User = require("../models/userModel");
const Review = require("../models/reviewModel");
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

// Get doctor info
router.get("/myprofile", auth, roleMiddleware("doctor"), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });
    res.json({ status: "success", data: doctor });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

//  Update Doctor Profile
router.put(
  "/myprofile/update",
  auth,
  roleMiddleware("doctor"),
  async (req, res) => {
    try {
      const {
        fullName,
        age,
        experience,
        specialty,
        clinicAddress,
        contact,
        googleMapsLink,
        whatsappLink,
      } = req.body;

      const doctor = await Doctor.findOne({ userId: req.user.id });

      if (!doctor) {
        return res.status(404).json({ error: "Doctor profile not found" });
      }

      // Update only provided fields
      if (fullName) doctor.fullName = fullName;
      if (age) doctor.age = age;
      if (specialty) doctor.specialty = specialty;
      if (experience) doctor.experience = experience;
      if (clinicAddress) doctor.clinicAddress = clinicAddress;
      if (contact) doctor.contact = contact;
      if (whatsappLink) doctor.whatsappLink = whatsappLink;
      if (googleMapsLink) doctor.googleMapsLink = googleMapsLink;

      await doctor.save();

      res.json({
        status: "success",
        message: "Doctor profile updated successfully",
        data: doctor,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Post available appointment slots
router.post(
  "/appointments/add",
  auth,
  roleMiddleware("doctor"),
  async (req, res) => {
    try {
      const { slots } = req.body; // slots: ["Monday 10AM", "Tuesday 5PM"]
      const doctor = await Doctor.findOne({ userId: req.user.id });
      if (!doctor)
        return res.status(404).json({ error: "Doctor profile not found" });

      if (!slots || !Array.isArray(slots) || slots.length === 0) {
        return res
          .status(400)
          .json({ error: "Slots array is required and cannot be empty" });
      }
      // Array to store new slots that will be added
      const newSlots = [];

      // Check for duplicate slots
      for (const slot of slots) {
        const slotExists = doctor.availableAppointments.some(
          (existingSlot) => existingSlot.appointmentSlot === slot
        );

        if (slotExists) {
          return res.status(400).json({
            status: "fail",
            message: `Slot "${slot}" is already added`,
          });
        }

        // If slot doesn't exist, add it to newSlots
        newSlots.push({
          appointmentSlot: slot,
          isBooked: false,
        });
      }

      // Add all new slots to availableAppointments
      doctor.availableAppointments.push(...newSlots);

      await doctor.save();
      res.json({
        status: "success",
        message: "Slots added successfully",
        data: doctor.availableAppointments,
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to add slots" });
    }
  }
);

// Get booked appointments with user details
router.get(
  "/appointments/all",
  auth,
  roleMiddleware("doctor"),
  async (req, res) => {
    try {
      const doctor = await Doctor.findOne({ userId: req.user.id }).populate(
        "appointments.userId",
        "fullName email contact"
      );

      if (!doctor) return res.status(404).json({ error: "Doctor not found" });

      const bookedAppointments = doctor.appointments;
      const bookedSlots = bookedAppointments.map(
        (appt) => appt.appointmentSlot
      );

      const unbookedSlots = doctor.availableAppointments
        .filter((slot) => !bookedSlots.includes(slot.appointmentSlot))
        .map((slot) => slot.appointmentSlot);

      res.json({
        status: "success",
        data: {
          bookedAppointments,
          unbookedSlots,
        },
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch appointments" });
    }
  }
);

// Delete available appointment slot
router.delete(
  "/appointments/delete",
  auth,
  roleMiddleware("doctor"),
  async (req, res) => {
    try {
      const { appointmentSlot } = req.body;

      // Validate input
      if (!appointmentSlot) {
        return res.status(400).json({
          status: "fail",
          message: "Appointment slot is required",
        });
      }

      const doctor = await Doctor.findOne({ userId: req.user.id });
      if (!doctor) {
        return res.status(404).json({ error: "Doctor profile not found" });
      }

      // Find the appointment slot
      const slotIndex = doctor.availableAppointments.findIndex(
        (slot) => slot.appointmentSlot === appointmentSlot
      );

      if (slotIndex === -1) {
        return res.status(404).json({
          status: "fail",
          message: "Appointment slot not found",
        });
      }

      // Check if the slot is booked
      if (doctor.availableAppointments[slotIndex].isBooked) {
        return res.status(400).json({
          status: "fail",
          message: "Cannot delete a booked appointment slot",
        });
      }

      // Remove the appointment slot
      doctor.availableAppointments.splice(slotIndex, 1);

      await doctor.save();

      res.json({
        status: "success",
        message: "Appointment slot deleted successfully",
        data: doctor.availableAppointments,
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: "Failed to delete appointment slot",
      });
    }
  }
);

// Get booked and unbooked appointments with user details
router.get(
  "/appointments/bookedappointments",
  auth,
  roleMiddleware("doctor"),
  async (req, res) => {
    try {
      const doctor = await Doctor.findOne({ userId: req.user.id }).populate(
        "appointments.userId",
        "fullName contact"
      );

      if (!doctor) return res.status(404).json({ error: "Doctor not found" });

      const bookedAppointments = doctor.appointments;
      const bookedSlots = bookedAppointments.map(
        (appt) => appt.appointmentSlot
      );

      const unbookedSlots = doctor.availableAppointments
        .filter((slot) => !bookedSlots.includes(slot.appointmentSlot))
        .map((slot) => slot.appointmentSlot);

      res.json({
        status: "success",
        data: {
          bookedAppointments,
          unbookedSlots,
        },
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch appointments" });
    }
  }
);

// Doctor responds to appointment (confirm, cancel, pending , completed)
router.put(
  "/appointments/status",
  auth,
  roleMiddleware("doctor"),
  async (req, res) => {
    try {
      const { appointmentSlot, status } = req.body;
      const doctor = await Doctor.findOne({ userId: req.user.id });

      const appointment = doctor.appointments.find(
        (appt) => appt.appointmentSlot === appointmentSlot
      );
      if (!appointment)
        return res.status(404).json({ error: "Appointment not found" });

      appointment.status = status;
      await doctor.save();

      res.json({
        status: "success",
        message: "Appointment status updated",
        data: appointment,
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to update appointment" });
    }
  }
);

// Get user reviews for the doctor
router.get("/reviews", auth, roleMiddleware("doctor"), async (req, res) => {
  try {
    // Find the doctor's profile using userId from UserModel
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({ error: "Doctor profile not found" });
    }

    // Find reviews using Doctor._id
    const reviews = await Review.find({ doctorId: doctor._id }).populate(
      "userId",
      "fullName"
    );

    res.json({ status: "success", data: reviews });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// Change Password
router.put("/profilesettings/changePassword", auth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // Ensure both old and new passwords are provided
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        status: "fail",
        data: { error: "Both old and new passwords are required" },
      });
    }

    // Find user and check old password
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        data: { error: "User not found" },
      });
    }

    if (!(await bcrypt.compare(oldPassword, user.password))) {
      return res.status(400).json({
        status: "fail",
        data: { error: "Incorrect password" },
      });
    }

    // Validate new password
    const passwordRegex =
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        status: "fail",
        data: {
          error:
            "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.",
        },
      });
    }
    // Hash and update new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({
      status: "success",
      data: { message: "Password updated successfully" },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Delete Account with password confirmation
router.delete("/myprofile/deleteAccount", auth, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        status: "fail",
        data: { error: "Password is required to delete account" },
      });
    }

    // Find user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        data: { error: "User not found" },
      });
    }

    // Check if the password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        status: "fail",
        data: { error: "Incorrect password" },
      });
    }

    // Delete user account
    await User.findByIdAndDelete(req.user.id);

    res.json({
      status: "success",
      data: { message: "Account deleted successfully" },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

module.exports = router;
