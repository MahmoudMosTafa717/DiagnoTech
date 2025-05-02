const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var validator = require("validator");

const userSchema = new Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [validator.isEmail, "Email is not valid"],
  },
  gender: {
    type: String,
  },
  age: {
    type: Number,
  },
  contact: {
    type: String,
  },
  password: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&]).{8,}$/.test(
          value
        );
      },
      message:
        "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.",
    },
  },
  role: {
    type: String,
    enum: ["user", "doctor", "admin"],
    default: "user",
  },
  resetPasswordCode: { type: String },
  resetPasswordExpires: { type: Date },
  resetCodeVerified: { type: Boolean, default: false },
  token: {
    type: String,
  },
  profilePicture: {
    type: String,
    default: "/uploads/defaultProfilePic.png",
  },
});

module.exports = mongoose.model("User", userSchema);
