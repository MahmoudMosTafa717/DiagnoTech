const mongoose = require("mongoose");

const diagnosisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    symptoms: [{ type: String, required: true }],
    diagnosisResult: [
      {
        disease: String,
        probability: Number, // Store confidence scores if available
        description: String,
        precautions: [String],
      },
    ],
  },
  { timestamps: true } // Automatically adds createdAt & updatedAt fields
);

module.exports = mongoose.model("Diagnosis", diagnosisSchema);
