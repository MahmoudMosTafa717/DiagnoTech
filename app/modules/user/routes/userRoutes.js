const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const userController = require("../controllers/userController");
const router = express.Router();
const authMiddleware = require("../../../middlewares/authMiddleware");
const upload = require("../../../middlewares/multer");
router.get("/", userController.getAllusers);

// Register a user
router.post("/register", async (req, res) => {
  const { fullName, email, gender, age, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    user = new User({ fullName, email, gender, age, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login a user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    //   expiresIn: "1h",
    // });
    // res.status(200).json({ token, user });

    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put(
  "/profile",
  authMiddleware,
  upload.single("profilePic"),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { fullName, gender, age } = req.body;
      const profilePic = req.file ? `/uploads/${req.file.filename}` : undefined;

      const updatedData = { fullName, gender, age };
      if (profilePic) updatedData.profilePic = profilePic;

      const user = await User.findByIdAndUpdate(userId, updatedData, {
        new: true,
      });

      if (!user) return res.status(404).json({ message: "User not found" });

      res.status(200).json({ message: "Profile updated successfully", user });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

router.post("/logout", (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
});

module.exports = router;
