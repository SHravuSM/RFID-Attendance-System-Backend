const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const Scan = require("./routes/Scan.js");
const APPU = require("./routes/adminRegister.js");
const RequestsFI = require("./routes/requestsFI.js");
const authRoutes = require("./routes/auth.js");
const ADMIN = require("./routes/ADMIN.js");
const INSTITUTION = require("./routes/INSTITUTION.js");
const TEACHER = require("./routes/TEACHER.js");

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Routes
app.use("/", APPU);
app.use("/", RequestsFI);
app.use("/", authRoutes);
app.use("/rfid", Scan);
app.use("/admin", ADMIN);
app.use("/institution", INSTITUTION);
app.use("/teacher", TEACHER);

app.get("/", (req, res) => {
  res.send("Attendance Backend Running...");
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
