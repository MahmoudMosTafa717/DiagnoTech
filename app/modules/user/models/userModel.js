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
    validate: [validator.isEmail, "email is not valid"],
  },
  gender: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  token: {
    type: String,
  },
  profilePicture: {
    type: String,
    default: "../../../../uploads/defaultProfilePic.jpg",
  },
});

module.exports = mongoose.model("User", userSchema);
