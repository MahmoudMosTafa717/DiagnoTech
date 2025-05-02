const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Doctor = require("../models/doctorModel");
const User = require("../models/userModel");
const Review = require("../models/reviewModel");

// Get all doctors
// router.get("/allDoctors", async (req, res) => {
//   try {
//     const doctors = await Doctor.find();
//     res.json({ status: "success", data: doctors });
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch doctors" });
//   }
// });
router.get("/allDoctors", async (req, res) => {
  try {
    const doctors = await Doctor.find();

    const enrichedDoctors = await Promise.all(
      doctors.map(async (doc) => {
        const reviews = await Review.find({ doctorId: doc._id });
        const avg =
          reviews.length > 0
            ? (
                reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
              ).toFixed(1)
            : null;

        return {
          ...doc._doc,
          averageRating: avg,
        };
      })
    );

    res.json({ status: "success", data: enrichedDoctors });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch doctors" });
  }
});

// Get single doctor by ID
router.get("/doctor/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    res.json({ status: "success", data: doctor });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch doctor" });
  }
});

// Get unique specialities
router.get("/specialities", async (req, res) => {
  try {
    const specialities = await Doctor.distinct("specialty");
    res.status(200).json({ specialities });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
