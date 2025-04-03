const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");
const schools = require("../routes/schools.js");
const serviceRequestRoutes = require("../routes/serviceRequestRoutes");
const Attendances = require("../routes/AttendanceOfStudent.js");
const servicerequests = require("../routes/servicerequests");
const Students = require("../routes/students");
const Teachers = require("../routes/Teachers.js");

dotenv.config();
const app = express();

// Middlewares
app.use(cors());
// Middleware to parse JSON request bodies
app.use(bodyParser.json());
app.use(express.json());

// Routes
app.use("/api", serviceRequestRoutes);
app.use("/api/servicerequests", servicerequests);
app.use("/api/schools", schools);
app.use("/api/rfid", Attendances);
app.use("/api/students", Students);
app.use("/api/teachers", Teachers);

app.get("/", (req, res) => {
  res.send("Attendance Backend Running...");
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));