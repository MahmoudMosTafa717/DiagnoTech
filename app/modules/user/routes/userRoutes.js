const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/userModel");
const userController = require("../controllers/userController");
const router = express.Router();
const { sendPasswordResetCode } = require("../services/emailService");
const auth = require("../../../middlewares/authMiddleware");

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
// });

//Get All users
router.get("/", userController.getAllusers);

router.post("/register", async (req, res) => {
  try {
    const { fullName, email, gender, age, password, contact } = req.body;

    if (!fullName || !email || !gender || !age || !password || !contact) {
      return res.status(400).json({
        status: "fail",
        data: { error: "All fields are required" },
      });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        status: "fail",
        data: { error: "User already exists" },
      });
    }

    // Check password before hashing
    const passwordRegex =
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        status: "fail",
        data: {
          error:
            "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.",
        },
      });
    }

    // Hash password AFTER validation
    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({
      fullName,
      email,
      gender,
      age,
      contact,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({
      status: "success",
      data: { message: "User registered successfully" },
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({
        status: "fail",
        data: { error: err.message },
      });
    }

    res.status(500).json({
      status: "error",
      message: err.message,
    });
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
        .json({ status: "fail", data: { error: "Invalid email or password" } });
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
      return res.status(400).json({
        status: "fail",
        data: { error: "Email is required" },
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        status: "fail",
        data: { error: "Email not found" },
      });
    }

    const hashedCode = await sendPasswordResetCode(email);

    user.resetPasswordCode = hashedCode;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // Expires in 15 mins
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

// Verify Reset Code
router.post("/verifyResetCode", async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        status: "fail",
        data: { error: "Code is required" },
      });
    }

    const users = await User.find({ resetPasswordCode: { $exists: true } });

    let matchedUser = null;

    for (const user of users) {
      const isMatch = await bcrypt.compare(code, user.resetPasswordCode);
      const notExpired =
        user.resetPasswordExpires && Date.now() <= user.resetPasswordExpires;

      if (isMatch && notExpired) {
        matchedUser = user;
        break;
      }
    }

    if (!matchedUser) {
      return res.status(400).json({
        status: "fail",
        data: { error: "Invalid or expired code" },
      });
    }

    matchedUser.resetCodeVerified = true;
    await matchedUser.save();

    const resetToken = jwt.sign(
      { userId: matchedUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.status(200).json({
      status: "success",
      data: { resetToken },
    });
  } catch (err) {
    console.error("Error verifying code:", err);
    res.status(500).json({
      status: "error",
      message: "Failed to verify code",
    });
  }
});

router.put("/resetPassword", async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        status: "fail",
        data: { error: "New password is required" },
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

    //  Find user who verified reset code
    const user = await User.findOne({ resetCodeVerified: true });
    if (!user) {
      return res.status(400).json({
        status: "fail",
        data: { error: "Reset code not verified" },
      });
    }

    //  Hash the new password before saving
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    //  Clear reset password fields
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    user.resetCodeVerified = false;

    await user.save();

    res.json({
      status: "success",
      data: { message: "Password updated successfully" },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to reset password",
    });
  }
});

router.post("/logout", (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
});

module.exports = router;
