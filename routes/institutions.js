const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const Institution = require("../models/Institution");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const Attendance = require("../models/Attendance");

// Get all Institutions
router.get("/", async (req, res) => {
  try {
    const Institutions = await Institution.find();
    res.json(Institutions);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/change-password
router.post("/change-password", async (req, res) => {
  const { institutionCode } = req.user;
  const { currentPassword, newPassword } = req.body;
  console.log(currentPassword, newPassword);

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
    console.log(isMatch, "Success");
    if (!isMatch) {
      return res.status(401).json({ error: "Current password is incorrect." });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the password
    institution.password = hashedNewPassword;
    await institution.save();
    console.log("Success");

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
      attendancePercentage
    });
  } catch (error) {
    console.error("Error in /home:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /admin/assign-device
router.post("/assign-device", async (req, res) => {
  const { institutionCode, deviceId } = req.body;
  console.log("Assign Device Request:", req.body);
  console.log("Institution Code:", institutionCode);
  console.log("Device ID:", deviceId);
  try {
    const institution = await Institution.findOne({ institutionCode });
    if (!institution)
      return res.status(404).json({ message: "Institution not found" });

    // Prevent duplicate
    if (institution.deviceIds.includes(deviceId)) {
      return res
        .status(400)
        .json({ message: "Device already assigned to this institution" });
    }

    institution.deviceIds.push(deviceId);
    await institution.save();

    res.json({ message: `Device ${deviceId} assigned successfully.` });
  } catch (err) {
    console.error("Assign error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST - Change password (institution must be authenticated)
router.post("/changepassword", async (req, res) => {
  // console.log("Change Password Request:", req.body);
  const { institutionCode, currentPassword, newPassword } = req.body;
  console.log(institutionCode, currentPassword, newPassword);

  try {
    // const institution = await Institution.findById(institutionCode);
    const institution = await Institution.findOne({ institutionCode });

    if (!institution) {
      return res.status(404).json({ message: "Institution not found." });
    }

    // Compare current password with hashed password
    const isMatch = await bcrypt.compare(currentPassword, institution.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect current password." });
    }

    // Hash and update to new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    institution.password = hashedNewPassword;
    await institution.save();

    res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    console.error("Password Change Error:", error);
    res.status(500).json({ message: "Server error. Try again later." });
  }
});

// Delete school
router.delete("/:id", async (req, res) => {
  try {
    await Institution.findByIdAndDelete(req.params.id);
    res.json({ message: "Institution deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
