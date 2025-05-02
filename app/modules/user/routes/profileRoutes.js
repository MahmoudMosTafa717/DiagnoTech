const express = require("express");
const bcrypt = require("bcrypt");
const multer = require("multer");
const auth = require("../../../middlewares/authMiddleware");
const User = require("../models/userModel");
const Doctor = require("../models/doctorModel");
const upload = require("../../../middlewares/multer");
const router = express.Router();

// Get User Profile
router.get("/user", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ status: "success", data: user });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

router.get("/myappointments", auth, async (req, res) => {
  try {
    const doctors = await Doctor.find();

    const myAppointments = [];

    doctors.forEach((doctor) => {
      doctor.appointments.forEach((appointment) => {
        if (
          appointment.userId &&
          appointment.userId.toString() === req.user.id
        ) {
          myAppointments.push({
            doctorId: doctor._id,
            doctorName: doctor.fullName,
            status: appointment.status,
            appointmentSlot: appointment.appointmentSlot,
            appointmentDate: appointment.date,
          });
        }
      });
    });

    res.status(200).json(myAppointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update User Profile
router.put("/update", auth, async (req, res) => {
  try {
    const { fullName, gender, age } = req.body;
    await User.findByIdAndUpdate(req.user.id, { fullName, gender, age });
    res.json({ status: "success", data: { message: "Profile updated" } });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Change Password
router.put("/changePassword", auth, async (req, res) => {
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

// Upload Profile Picture
router.post(
  "/uploadProfilePicture",
  auth,
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ status: "fail", data: { error: "No file uploaded" } });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return res
          .status(404)
          .json({ status: "fail", data: { error: "User not found" } });
      }

      user.profilePicture = `/uploads/${req.file.filename}`;
      await user.save();

      res.json({
        status: "success",
        data: {
          message: "Profile picture uploaded successfully",
          profilePicture: user.profilePicture,
        },
      });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }
);

// Delete Account with password confirmation
router.delete("/deleteAccount", auth, async (req, res) => {
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
