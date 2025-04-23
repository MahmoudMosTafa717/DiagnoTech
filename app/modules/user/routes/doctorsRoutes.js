const express = require("express");
const mongoose = require("mongoose");
const roleMiddleware = require("../../../middlewares/roleMiddleware");
const router = express.Router();

const Doctor = require("../models/doctorModel");
// Add a new doctor
router.post("/newdoctor", async (req, res) => {
  try {
    const {
      name,
      specialty,
      Disease,
      clinicAddress,
      contact,
      googleMapsLink,
      availableAppointments,
      whatsappLink,
    } = req.body;

    if (!name || !specialty || !Disease || !clinicAddress || !contact) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newDoctor = new Doctor({
      name,
      specialty,
      Disease,
      clinicAddress,
      contact,
      googleMapsLink,
      availableAppointments,
      whatsappLink,
    });
    await newDoctor.save();

    res
      .status(201)
      .json({ message: "Doctor added successfully", doctor: newDoctor });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error adding doctor", details: error.message });
  }
});

// Get all doctors
router.get("/doctorsinfo", async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching doctors", details: error.message });
  }
});

// Search for a doctor by disease or specialty
router.get("/doctors/search", async (req, res) => {
  try {
    const { disease, specialty } = req.query;
    let query = {};

    if (disease) query.Disease = disease;
    if (specialty) query.specialty = specialty;

    const doctors = await Doctor.find(query);
    res.json(doctors);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error searching for doctors", details: error.message });
  }
});

// Get a specific doctor by ID
router.get("/doctors/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    res.json(doctor);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching doctor", details: error.message });
  }
});

// Update a doctor's information
router.put("/doctors/:id", async (req, res) => {
  try {
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedDoctor)
      return res.status(404).json({ error: "Doctor not found" });

    res.json({ message: "Doctor updated successfully", doctor: updatedDoctor });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error updating doctor", details: error.message });
  }
});

// Delete a doctor
router.delete("/doctors/:id", async (req, res) => {
  try {
    const deletedDoctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!deletedDoctor)
      return res.status(404).json({ error: "Doctor not found" });

    res.json({ message: "Doctor deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error deleting doctor", details: error.message });
  }
});

module.exports = router;
