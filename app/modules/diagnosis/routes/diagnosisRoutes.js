const express = require("express");
const router = express.Router();
const axios = require("axios");
const Diagnosis = require("../models/diagnosisModel");
const User = require("../../user/models/userModel");
const auth = require("../../../middlewares/authMiddleware");

// Predict Disease & Save Diagnosis
router.post("/predict", auth, async (req, res) => {
  const { symptoms } = req.body;

  if (!symptoms || symptoms.length < 3) {
    return res.status(400).json({ error: "Symptoms are required" });
  }

  try {
    // Call Flask API for prediction
    const response = await axios.post("http://127.0.0.1:4000/predict", {
      symptoms,
    });
    const topDiseases = response.data.top5_diseases; // Extract the predictions

    if (!topDiseases || topDiseases.length === 0) {
      return res
        .status(500)
        .json({ error: "No predictions received from model" });
    }

    // Take only the first disease from the array
    const bestMatch = topDiseases[0];

    // Store the diagnosis in MongoDB
    const newDiagnosis = await Diagnosis.create({
      userId: req.user.id,
      symptoms,
      diagnosisResult: {
        disease: bestMatch.Disease,
        probability: bestMatch["Probability (%)"],
        description: bestMatch.Description,
        precautions: bestMatch.Precautions,
      },
    });

    // Append diagnosis to user's medical history
    await User.findByIdAndUpdate(req.user.id, {
      $push: { medicalHistory: newDiagnosis._id },
    });

    res.status(201).json({
      message: "Diagnosis saved successfully",
      diagnosis: newDiagnosis,
    });
  } catch (error) {
    console.error("Error calling Flask API:", error.message);
    res.status(500).json({ error: "Prediction failed" });
  }
});

// Get User's Diagnosis History
router.get("/history", auth, async (req, res) => {
  try {
    const history = await Diagnosis.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .select("-__v");

    res.status(200).json(history);
  } catch (error) {
    console.error("Error fetching history:", error.message);
    res.status(500).json({ error: "Failed to retrieve history" });
  }
});

// Get a Specific Diagnosis by ID
router.get("/history/:id", auth, async (req, res) => {
  try {
    const diagnosis = await Diagnosis.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!diagnosis) {
      return res.status(404).json({ error: "Diagnosis not found" });
    }

    res.status(200).json(diagnosis);
  } catch (err) {
    // console.error("Error fetching diagnosis:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
