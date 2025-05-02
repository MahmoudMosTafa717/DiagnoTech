const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const Admin = require("../models/adminModel");
const Doctor = require("../models/doctorModel");
const User = require("../models/userModel");
const Diagnosis = require("../../diagnosis/models/diagnosisModel");

// Middlewares
const authMiddleware = require("../../../middlewares/authMiddleware");
const roleMiddleware = require("../../../middlewares/roleMiddleware");

// _____________________________________________________________________
// Website Statisitics
// -----------------------------
router.get(
  "/stats",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const totalUsers = await User.countDocuments({ role: "user" });
      const totalDoctors = await User.countDocuments({ role: "doctor" });
      const totalAdmins = await User.countDocuments({ role: "admin" });
      // const totalAppointments = await Appointment.countDocuments();
      const totalSpecialties = await Doctor.distinct("specialty");
      const totalDiagnoses = await Diagnosis.countDocuments();
      const totalMales = await User.countDocuments({ gender: "male" });
      const totalFemales = await User.countDocuments({ gender: "female" });
      const ageUnderOrEqual35 = await User.countDocuments({
        age: { $lte: 35 },
      });
      const ageAbove35 = await User.countDocuments({ age: { $gt: 35 } });

      res.status(200).json({
        status: "success",
        data: {
          totalUsers,
          totalDoctors,
          totalAdmins,
          // totalAppointments,
          totalSpecialties: totalSpecialties.length,
          totalDiagnoses,
          totalMales,
          totalFemales,
          ageUnderOrEqual35,
          ageAbove35,
        },
      });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }
);

// _____________________________________________________________________
// Users CRUD
// -----------------------------

// GET /users/all
router.get(
  "/users/allUsers",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const users = await User.find({ role: "user" });
      res.status(200).json({ status: "success", data: users });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }
);

// GET /users/search?query=text
router.get(
  "/users/search",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const { query } = req.query;

      if (!query) {
        return res
          .status(400)
          .json({ status: "fail", message: "Search query is required" });
      }

      const users = await User.find({
        role: "user",
        $or: [
          { fullName: { $regex: query, $options: "i" } },
          { email: { $regex: query, $options: "i" } },
        ],
      });

      res.status(200).json({ status: "success", data: users });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }
);

// DELETE /users/delete/:userId
router.delete(
  "/users/deleteUser/:userId",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await User.findByIdAndDelete(userId);
      if (!user) {
        return res
          .status(404)
          .json({ status: "fail", message: "User not found" });
      }

      res
        .status(200)
        .json({ status: "success", message: "User deleted successfully" });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }
);

// _____________________________________________________________________
// Doctors CRUD
// -----------------------------

// Add Doctor
router.post(
  "/doctors/addDoctor",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const {
        fullName,
        email,
        password,
        gender,
        age,
        experience,
        specialty,
        clinicAddress,
        contact,
        googleMapsLink,
        availableAppointments,
        whatsappLink,
      } = req.body;

      // Validation
      if (
        !fullName ||
        !email ||
        !password ||
        !specialty ||
        !clinicAddress ||
        !contact ||
        !age ||
        !gender ||
        !experience
      ) {
        return res.status(400).json({
          status: "fail",
          data: { error: "All required fields must be provided" },
        });
      }

      // Check if user already exists
      let existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          status: "fail",
          data: { error: "User already exists" },
        });
      }

      const passwordRegex =
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&]).{8,}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          status: "fail",
          data: {
            error:
              "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
          },
        });
      }

      // Create user
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({
        fullName,
        email,
        password: hashedPassword,
        gender,
        age,
        experience,
        role: "doctor",
      });
      await user.save();

      // Create doctor profile
      const doctor = new Doctor({
        userId: user._id,
        fullName,
        email,
        gender,
        age,
        experience,
        specialty,
        clinicAddress,
        contact,
        googleMapsLink,
        availableAppointments,
        whatsappLink,
      });

      await doctor.save();

      res.status(201).json({
        status: "success",
        data: { message: "Doctor added successfully" },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        status: "error",
        error: "Error adding doctor",
        details: err.message,
      });
    }
  }
);

// Get all doctors
router.get(
  "/doctors/alldoctors",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const doctors = await Doctor.find().select("-Disease");
      res.json(doctors);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Error fetching doctors", details: error.message });
    }
  }
);

//Search for doctor
router.get(
  "/doctors/search",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const { query } = req.query;

      if (!query) {
        return res.status(400).json({
          status: "fail",
          message: "Query parameter is required",
        });
      }

      const search = query.toLowerCase();

      // Populate userId to access fullName and email
      const doctors = await Doctor.find().populate("userId").select("-Disease");

      const filteredDoctors = doctors.filter((doc) => {
        const name = doc.userId?.fullName?.toLowerCase() || "";
        const email = doc.userId?.email?.toLowerCase() || "";
        const specialty = doc.specialty?.toLowerCase() || "";

        return (
          name.includes(search) ||
          email.includes(search) ||
          specialty.includes(search)
        );
      });

      res.status(200).json({
        status: "success",
        data: filteredDoctors,
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: "Error searching for doctors",
        details: err.message,
      });
    }
  }
);
// Delete Doctor by id params
router.delete(
  "/doctors/deleteDoctor/:id",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Check if doctor exists
      const doctor = await Doctor.findById(id);
      if (!doctor) {
        return res.status(404).json({
          status: "fail",
          message: "Doctor not found",
        });
      }

      // Delete the doctor document
      await Doctor.findByIdAndDelete(id);

      // Delete the associated user account
      await User.findByIdAndDelete(doctor.userId);

      res.status(200).json({
        status: "success",
        message: "Doctor and associated user account deleted successfully",
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: "Server error",
        error: err.message,
      });
    }
  }
);

// _____________________________________________________________________
// Admins CRUD
// -----------------------------

// Add Admin
router.post(
  "/admins/addAdmin",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const { fullName, email, password, role } = req.body;

      if (!fullName || !email || !password || !role) {
        return res
          .status(400)
          .json({ status: "fail", data: { error: "All fields are required" } });
      }

      if (role !== "admin") {
        return res
          .status(403)
          .json({ status: "fail", data: { error: "Role must be 'admin'" } });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res
          .status(400)
          .json({ status: "fail", data: { error: "Email already in use" } });
      }

      const passwordRegex =
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&]).{8,}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          status: "fail",
          data: {
            error:
              "Password must be at least 8 characters and contain uppercase, lowercase, number, and special character.",
          },
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newAdmin = new User({
        fullName,
        email,
        password: hashedPassword,
        role,
      });

      await newAdmin.save();

      res.status(201).json({
        status: "success",
        data: { message: "Admin created successfully" },
      });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }
);

// Get All Admins
router.get(
  "/admins/allAdmins",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const admins = await User.find({ role: "admin" }).select("-password");
      res.status(200).json({ status: "success", data: admins });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }
);

// Search for admins
router.get(
  "/admins/search",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const { query } = req.query;

      if (!query) {
        return res.status(400).json({
          status: "fail",
          message: "Query parameter is required",
        });
      }

      // Normalize the query string
      const search = query.toLowerCase();

      // Get all admins
      const admins = await User.find({ role: "admin" });

      // Filter by partial name or email match
      const filteredAdmins = admins.filter((admin) => {
        const fullName = admin.fullName?.toLowerCase() || "";
        const email = admin.email?.toLowerCase() || "";

        return fullName.includes(search) || email.includes(search);
      });

      res.status(200).json({
        status: "success",
        data: filteredAdmins,
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: "Error searching for admins",
        details: err.message,
      });
    }
  }
);

router.delete(
  "/admins/deleteAdmin/:id",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Check if the user exists and is an admin
      const user = await User.findById(id);
      if (!user || user.role !== "admin") {
        return res.status(404).json({
          status: "fail",
          message: "Admin not found",
        });
      }

      await User.findByIdAndDelete(id);

      res.status(200).json({
        status: "success",
        message: "Admin deleted successfully",
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: "Server Error",
        error: err.message,
      });
    }
  }
);

// _____________________________________________________________________
// Website Info
// -----------------------------

// _____________________________________________________________________
// Admin Profile Settings
// -----------------------------
// Get User Profile
router.get("/profilesettings/myinfo", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ status: "success", data: user });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Update User Profile
router.put("/profilesettings/updateinfo", authMiddleware, async (req, res) => {
  try {
    const { fullName } = req.body;
    await User.findByIdAndUpdate(req.user.id, { fullName });
    res.json({ status: "success", data: { message: "Profile updated" } });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Change Password
router.put(
  "/profilesettings/changePassword",
  authMiddleware,
  async (req, res) => {
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
  }
);

// Delete Account with password confirmation
router.delete(
  "/profilesettings/deleteAccount",
  authMiddleware,
  async (req, res) => {
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
  }
);

module.exports = router;
