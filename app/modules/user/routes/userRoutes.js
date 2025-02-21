const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/userModel");
const userController = require("../controllers/userController");
const router = express.Router();
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

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
    if (!email)
      return res
        .status(400)
        .json({ status: "fail", data: { error: "Email is required" } });

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ status: "fail", data: { error: "Email not found" } });

    const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });
    const resetLink = `http://localhost:3000/resetPassword/${resetToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset",
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
    });

    res.json({
      status: "success",
      data: { message: "Password reset link sent" },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Reset Password
router.post("/resetPassword", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword)
      return res.status(400).json({
        status: "fail",
        data: { error: "Token and new password are required" },
      });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(decoded.id, { password: hashedPassword });

    res.json({
      status: "success",
      data: { message: "Password updated successfully" },
    });
  } catch (err) {
    res
      .status(400)
      .json({ status: "error", message: "Invalid or expired token" });
  }
});

router.post("/logout", (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
});

module.exports = router;
