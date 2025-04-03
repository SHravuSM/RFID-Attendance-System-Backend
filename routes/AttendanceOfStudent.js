const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Student = require("../models/Student");
const School = require("../models/School");
const Attendance = require("../models/Attendance");

// Pending Student Schema (for unregistered RFIDs)
const pendingStudentSchema = new mongoose.Schema({
  rfid: { type: String, unique: true }, // Ensure RFID is unique
  detectedAt: { type: Date, default: Date.now },
});

const PendingStudent =
  mongoose.models.PendingStudent ||
  mongoose.model("PendingStudent", pendingStudentSchema);

router.post("/scan", async (req, res) => {
  try {
    const rfid = req.body.uid;
    if (!rfid) return res.status(400).json({ error: "RFID is required" });

    // Find the student by RFID
    const student = await Student.findOne({ rfid });

    if (student) {
      const currentDate = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
      const currentTime = new Date();
      const hour = currentTime.getHours();

      // Find attendance record using rfid instead of studentId
      let attendanceRecord = await Attendance.findOne({ rfid });
      console.log(attendanceRecord, "attendancerecord");

      if (!attendanceRecord) {
        // If no attendance record exists for the student, create a new one
        attendanceRecord = new Attendance({
          schoolCode: student.schoolCode, // ✅ Ensure schoolCode is stored
          name: student.name,
          role: student.role, // Assuming role is a field in the Student model
          rfid: student.rfid,
          attendance: [],
        });
      }

      // Find today's attendance entry
      let todayEntryIndex = attendanceRecord.attendance.findIndex(
        (entry) => entry.date === currentDate
      );

      if (todayEntryIndex === -1) {
        // If today's entry doesn't exist, create a new one
        attendanceRecord.attendance.push({
          date: currentDate,
          morningEntry: null,
          eveningEntry: null,
        });
        todayEntryIndex = attendanceRecord.attendance.length - 1;
      }

      // Reference the correct entry
      let todayEntry = attendanceRecord.attendance[todayEntryIndex];

      // Check and update morning or evening entry
      if (hour < 12 && !todayEntry.morningEntry) {
        todayEntry.morningEntry = currentTime;
      } else if (hour >= 12 && !todayEntry.eveningEntry) {
        todayEntry.eveningEntry = currentTime;
      } else {
        return res
          .status(400)
          .json({ error: "Entry already exists for this session" });
      }

      // ✅ Save updated attendance array
      attendanceRecord.attendance[todayEntryIndex] = todayEntry;
      await attendanceRecord.save();

      return res.json({
        name: student.name,
        uid: student.rfid,
        status: "Present",
        time: currentTime,
      });
    } else {
      // If student is not found, add to pending list
      const existingPending = await PendingStudent.findOne({ rfid });

      if (!existingPending) {
        await PendingStudent.create({ rfid });
      }

      return res.json({
        uid: rfid,
        status: "Pending",
      });
    }
  } catch (err) {
    console.error("Error processing RFID scan:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get Pending Students for React Frontend
router.get("/unregistered", async (req, res) => {
  try {
    const pendingStudent = await PendingStudent.findOne()
      .sort({ detectedAt: -1 })
      .limit(1);

    return res.json({ rfid: pendingStudent ? pendingStudent.rfid : null });
  } catch (err) {
    console.error("Error fetching pending students:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Register Pending Student
router.post("/register", async (req, res) => {
  try {
    // console.log(req.body, "its");
    const {
      name,
      // role,
      class: className,
      rollNumber,
      rfid,
      parentName,
      parentContactNumber,
      schoolName,
    } = req.body;
    if (!name || !className || !rollNumber || !rfid) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if student already exists
    const existingStudent = await Student.findOne({ rfid });
    const schoolCode = await School.findOne({ name: schoolName });
    // console.log(schoolCode, "school code");

    if (existingStudent) {
      return res.status(400).json({ error: "RFID is already registered" });
    }

    // Add student to the students collection
    const newStudent = await Student.create({
      name,
      role: "student", // Default role is 'student'
      className,
      rollNumber,
      parentName,
      parentContactNumber,
      schoolName,
      schoolCode: schoolCode.schoolCode,
      rfid,
    });

    // Remove from pending students
    await PendingStudent.deleteOne({ rfid });

    return res.json({ success: true, student: newStudent });
  } catch (err) {
    console.error("Error registering student:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;