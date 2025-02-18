const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const status = require("./app/modules/utils/httpStatus");
// console.log(process.env.PORT);

const path = require("path");
// const bodyParser = require("body-parser");
app.use(express.json());
app.use(cors());

const userRouter = require("./app/modules/user/routes/userRoutes");

app.use("/api/users", userRouter);
app.use("/uploads", express.static("uploads"));

app.all("*", (req, res) => {
  return res
    .status(404)
    .json({ status: status.FAIL, message: "Page not found" });
});

const connectDB = require("./app/config/db");

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
