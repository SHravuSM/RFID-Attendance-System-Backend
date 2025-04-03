// // const express = require("express");
// // const mongoose = require("mongoose");
// // const app = express();

// // app.use(express.json());

// // // MongoDB Connection
// // mongoose.connect("mongodb://localhost:27017/attendance", {
// //   useNewUrlParser: true,
// //   useUnifiedTopology: true,
// // });

// // // Schema
// // const attendanceSchema = new mongoose.Schema({
// //   uid: String,
// //   device: String,
// //   timestamp: { type: Date, default: Date.now },
// // });

// // const Attendance = mongoose.model("Attendance", attendanceSchema);

// // // Endpoint
// // app.post("/markattendance", async (req, res) => {
// //   try {
// //     const { uid, device } = req.body;
// //     if (!uid) return res.status(400).json({ error: "UID Missing" });

// //     const record = new Attendance({ uid, device });
// //     await record.save();
// //     // const { uid } = record ;
// //     // console.log(AID)
// //     res.json({ message: "Attendance marked!", data: uid });
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ error: "Server Error" });
// //   }
// // });

// // // Start server
// // app.listen(5000, () => console.log("Backend running on port 5000"));

// const express = require("express");
// const mongoose = require("mongoose");
// const schoolRequestRoutes = require("../routes/serviceRequestRoutes");
// const schoolRoutes = require("../routes/schools");

// const app = express();
// app.use(express.json());

// // MongoDB Connection
// mongoose.connect("mongodb://localhost:27017/attendance");

// // Routes
// app.use("/api/school-requests", schoolRequestRoutes);
// app.use("/api/schools", schoolRoutes);

// // Test Route
// app.get("/", (req, res) => {
//   res.send("Attendance Backend Running...");
// });

// // Start Server
// app.listen(5000, () => console.log("Server running on port 5000"));
