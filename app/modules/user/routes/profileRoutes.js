const express = require("express");
const bcrypt = require("bcrypt");
const multer = require("multer");
const auth = require("../../../middlewares/authMiddleware");
const User = require("../models/userModel");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Get User Profile
router.get("/user", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ status: "success", data: user });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
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
    const user = await User.findById(req.user.id);
    if (!(await bcrypt.compare(oldPassword, user.password))) {
      return res
        .status(400)
        .json({ status: "fail", data: { error: "Incorrect password" } });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ status: "success", data: { message: "Password updated" } });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Upload Profile Picture
router.post(
  "/uploadPicture",
  auth,
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      await User.findByIdAndUpdate(req.user.id, {
        profilePicture: req.file.path,
      });
      res.json({
        status: "success",
        data: { message: "Profile picture updated" },
      });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }
);

// Delete Account
router.delete("/deleteAccount", auth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ status: "success", data: { message: "Account deleted" } });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

module.exports = router;
