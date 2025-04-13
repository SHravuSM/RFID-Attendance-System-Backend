const moment = require("moment");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const Institution = require("../models/Institution");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const Staff = require("../models/Staff");

// Get all Institutions
router.get("/", async (req, res) => {
  try {
    const Institution = await Institution.find({
      institutionCode: req.user.institutionCode,
    });
    res.json(Institution);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/change-password
router.post("/change-password", async (req, res) => {
  const { institutionCode } = req.user;
  const { currentPassword, newPassword } = req.body;
  //console.log(currentPassword, newPassword);

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Both fields are required." });
  }

  try {
    // Find the Institution
    const institution = await Institution.findOne({ institutionCode });
    if (!institution)
      return res.status(404).json({ error: "Institution not found." });

    // Validate current password
    const isMatch = await bcrypt.compare(currentPassword, institution.password);
    //console.log(isMatch, "Success");
    if (!isMatch) {
      return res.status(401).json({ error: "Current password is incorrect." });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the password
    institution.password = hashedNewPassword;
    await institution.save();
    //console.log("Success");

    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

router.get("/home", async (req, res) => {
  const { institutionCode } = req.user;
  const today = new Date().toISOString().split("T")[0];

  try {
    // Fetch the institution to get class list
    const institution = await Institution.findOne({ institutionCode });

    const institutionName = institution.institutionName;

    if (!institution) {
      return res.status(404).json({ message: "Institution not found" });
    }

    const classes = institution.classes || []; // Array of class objects or strings

    // Count total students in this institution
    const totalStudents = await Student.countDocuments({ institutionCode });

    // Count total teachers in this institution
    const totalTeachers = await Teacher.countDocuments({ institutionCode });

    // Count total classes from institution.classes array
    const totalClasses = classes.length;

    // Fetch all student attendance records for today
    const attendances = await Attendance.find({
      institutionCode,
      role: "student",
      "attendance.date": today,
    });

    // Filter students who are present (either morning or evening entry)
    const presentToday = attendances.filter((record) =>
      record.attendance.some(
        (entry) =>
          entry.date === today &&
          (entry.morningEntry !== null || entry.eveningEntry !== null)
      )
    );

    // Calculate percentage
    const attendancePercentage =
      totalStudents > 0
        ? `${((presentToday.length / totalStudents) * 100).toFixed(1)}%`
        : "0.0%";

    res.json({
      principalName: institution.principalName,
      institutionName,
      totalStudents,
      email: institution.email,
      totalTeachers,
      totalClasses,
      subsctiptionEndsOn: institution.subscriptionEndDate,
      subscriptionStatus: institution.subscriptionStatus,
      attendancePercentage,
    });
  } catch (error) {
    console.error("Error in /home:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/attendance/:role", async (req, res) => {
  try {
    const role = req.params.role;
    const institutionCode = req.user.institutionCode;

    // Get institution
    const institution = await Institution.findOne({ institutionCode });
    if (!institution)
      return res.status(404).json({ error: "Institution not found" });

    // Attendance records for this institution and role
    const attendanceRecords = await Attendance.find({
      role,
      institutionCode,
    });

    let users = [];
    let responseData = [];

    if (role === "student") {
      users = await Student.find({ institutionCode });

      const userMap = {};
      users.forEach((u) => {
        userMap[u.rfid] = {
          className: u.className,
          rollNumber: u.rollNumber,
        };
      });

      responseData = attendanceRecords.map((record) => ({
        ...record.toObject(),
        className: userMap[record.rfid]?.className || "Unknown",
        rollNumber: userMap[record.rfid]?.rollNumber || "Unknown",
      }));
    } else if (role === "teacher") {
      users = await Teacher.find({ institutionCode });

      const userMap = {};
      users.forEach((u) => {
        userMap[u.rfid] = {
          className: u.className || "Not Assigned",
        };
      });

      responseData = attendanceRecords.map((record) => ({
        ...record.toObject(),
        className: userMap[record.rfid]?.className || "Unknown",
      }));
    } else if (role === "staff") {
      responseData = attendanceRecords; // no className or rollNumber needed
    } else {
      return res.status(400).json({ error: "Invalid role specified" });
    }

    console.log(responseData);
    res.status(200).json(responseData);
  } catch (err) {
    console.error("Error fetching attendance by role:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
