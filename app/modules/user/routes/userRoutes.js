const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/userModel");
const userController = require("../controllers/userController");
const router = express.Router();
const { sendPasswordResetCode } = require("../services/emailService");
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
// });

//Get All users
router.get("/", userController.getAllusers);

// Register
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, gender, age, password } = req.body;
    if (!fullName || !email || !gender || !age || !password) {
      return res
        .status(400)
        .json({ status: "fail", data: { error: "All fields are required" } });
    }

    let user = await User.findOne({ email });
    if (user)
      return res
        .status(400)
        .json({ status: "fail", data: { error: "User already exists" } });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ fullName, email, gender, age, password: hashedPassword });
    await user.save();

    res.status(201).json({
      status: "success",
      data: { message: "User registered successfully" },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    if (!email || !password)
      return res.status(400).json({
        status: "fail",
        data: { error: "Email and password are required" },
      });

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(400)
        .json({ status: "fail", data: { error: "Invalid credentials" } });
    }

    const expiresIn = rememberMe ? "7d" : "1h";
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn,
    });

    res.json({ status: "success", data: { token, user } });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Forgot Password
router.post("/forgotPassword", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ status: "fail", data: { error: "Email is required" } });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ status: "fail", data: { error: "Email not found" } });
    }

    const hashedCode = await sendPasswordResetCode(email);

    user.resetPasswordCode = hashedCode;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    res.json({
      status: "success",
      data: {
        message: `Password reset code sent to ${user.email}`,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Failed to send email" });
  }
});

// Reset Password
router.post("/verifyResetCode", async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res
        .status(400)
        .json({ status: "fail", data: { error: "Code is required" } });
    }

    const user = await User.findOne({ resetPasswordCode: { $exists: true } });
    if (
      !user ||
      !user.resetPasswordExpires ||
      Date.now() > user.resetPasswordExpires
    ) {
      return res
        .status(400)
        .json({ status: "fail", data: { error: "Invalid or expired code" } });
    }

    const isMatch = await bcrypt.compare(code, user.resetPasswordCode);
    if (!isMatch) {
      return res
        .status(400)
        .json({ status: "fail", data: { error: "Invalid code" } });
    }

    user.resetCodeVerified = true;
    await user.save();

    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    res.json({
      status: "success",
      data: { resetToken },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Failed to verify code" });
  }
});

router.put("/resetPassword", async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword) {
      return res
        .status(400)
        .json({ status: "fail", data: { error: "New password is required" } });
    }

    const user = await User.findOne({ resetCodeVerified: true });
    if (!user) {
      return res
        .status(400)
        .json({ status: "fail", data: { error: "Reset code not verified" } });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    user.resetCodeVerified = false;

    await user.save();

    res.json({
      status: "success",
      data: { message: "Password updated successfully" },
    });
  } catch (err) {
    res
      .status(500)
      .json({ status: "error", message: "Failed to reset password" });
  }
});

router.post("/logout", (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
});

module.exports = router;
