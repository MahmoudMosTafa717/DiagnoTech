const mongoose = require("mongoose");

const SymptomSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});

const Symptom = mongoose.model("Symptom", SymptomSchema);

module.exports = Symptom;
