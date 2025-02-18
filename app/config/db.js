const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  const url =
    process.env.MONGO_URL || "mongodb+srv://mm:123@cluster0.diazl.mongodb.net/";
  await mongoose
    .connect(url)
    .then(() => {
      console.log("MongoDB connected");
    })
    .catch((err) => {
      console.log(err);
    });
};
module.exports = connectDB;
