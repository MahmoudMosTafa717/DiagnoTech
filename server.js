const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const status = require("./app/modules/utils/httpStatus");
// console.log(process.env.PORT);
// console.log(__dirname);

const path = require("path");
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// const bodyParser = require("body-parser");
app.use(express.json());
app.use(cors());

const userRouter = require("./app/modules/user/routes/userRoutes");
const profileRoutes = require("./app/modules/user/routes/profileRoutes");
const diagnosisRoutes = require("./app/modules/diagnosis/routes/diagnosisRoutes");
const doctorRoutes = require("./app/modules/user/routes/doctorsRoutes");
const symptomsRoutes = require("./app/modules/diagnosis/routes/symptomsRoutes");
const DashboardRoutes = require("./app/modules/user/routes/DashboardRoutes");
const userbook = require("./app/modules/user/routes/userToDoctor");
const doctorProfileRoutes = require("./app/modules/user/routes/doctorProfileRoutes");
const chatbotRoutes = require("./app/modules/diagnosis/routes/chatbotRoutes");

app.use("/api/users", userRouter);
app.use("/api/profile", profileRoutes);
app.use("/api/diagnosis", diagnosisRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/symptoms", symptomsRoutes);
app.use("/api/Dashboard", DashboardRoutes);
app.use("/api/chatBot", chatbotRoutes);
app.use("/api/doctorProfile", doctorProfileRoutes);
app.use("/api/userbook", userbook);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger-output.json");

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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
