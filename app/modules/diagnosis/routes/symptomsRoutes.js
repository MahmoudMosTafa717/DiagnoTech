const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const Symptom = require("../models/symptomsModel");

router.post("/newsymptom", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name)
      return res.status(400).json({ error: "Symptom name is required" });

    const newSymptom = new Symptom({ name });
    await newSymptom.save();
    res
      .status(201)
      .json({ message: "Symptom added successfully", symptom: newSymptom });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error adding symptom", details: error.message });
  }
});

router.get("/allsymptoms", async (req, res) => {
  try {
    const symptoms = await Symptom.find();
    res.json(symptoms);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching symptoms", details: error.message });
  }
});

router.get("/symptom/:id", async (req, res) => {
  try {
    const symptom = await Symptom.findById(req.params.id);
    if (!symptom) return res.status(404).json({ error: "Symptom not found" });

    res.json(symptom);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching symptom", details: error.message });
  }
});

router.put("/symptom/:id", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name)
      return res.status(400).json({ error: "Symptom name is required" });

    const updatedSymptom = await Symptom.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );

    if (!updatedSymptom)
      return res.status(404).json({ error: "Symptom not found" });

    res.json({
      message: "Symptom updated successfully",
      symptom: updatedSymptom,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error updating symptom", details: error.message });
  }
});

router.delete("/symptom/:id", async (req, res) => {
  try {
    const deletedSymptom = await Symptom.findByIdAndDelete(req.params.id);
    if (!deletedSymptom)
      return res.status(404).json({ error: "Symptom not found" });

    res.json({ message: "Symptom deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error deleting symptom", details: error.message });
  }
});

module.exports = router;
