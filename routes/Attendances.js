const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Staff = require("../models/Staff");
const Institution = require("../models/Institution");
const PendingUser = require("../models/PendingUser");

let hashedPassword;
let plainPassword;

const generateRandomPassword = () => {
  return Math.random().toString(36).slice(-8);
};

router.post("/register", async (req, res) => {
  //console.log(req.body, "From Fronetend");
  try {
    const {
      name,
      role,
      className,
      subject,
      rollNumber,
      email,
      rfid,
      parentName,
      parentContactNumber,
      designation,
      contactNumber,
      department,
      institutionCode,
      password,
    } = req.body;
    // console.log(req.body);

    if (!name || !rfid || !role || !institutionCode) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (
      await Promise.any([
        Student.findOne({ rfid, institutionCode }),
        Teacher.findOne({ rfid, institutionCode }),
        Staff.findOne({ rfid, institutionCode }),
      ]).catch(() => null)
    ) {
      return res.status(400).json({ error: "RFID is already registered" });
    }

    const institution = await Institution.findOne({ institutionCode });
    if (!institution) {
      return res.status(400).json({ error: "Institution not found" });
    }

    let newUser;
    if (role === "student") {
      newUser = await Student.create({
        name,
        role,
        className,
        rollNumber,
        parentName,
        parentContactNumber,
        institutionName: institution.institutionName,
        institutionCode,
        rfid,
      });
    } else if (role === "teacher") {
      if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
      } else {
        plainPassword = generateRandomPassword();
        hashedPassword = await bcrypt.hash(plainPassword, 10);
      }
      newUser = await Teacher.create({
        name,
        role,
        className,
        subject,
        contactNumber,
        institutionName: institution.institutionName,
        institutionCode,
        email,
        rfid,
        password: hashedPassword,
      });
    } else if (role === "staff") {
      newUser = await Staff.create({
        name,
        role,
        designation,
        contactNumber,
        department,
        institutionName: institution.institutionName,
        institutionCode,
        rfid,
      });
    } else {
      return res.status(400).json({ error: "Invalid role specified" });
    }

    await PendingUser.deleteOne({ rfid, institutionCode });
    const response = { success: true, user: newUser };
    if (role === "teacher" && (plainPassword || password)) {
      response.password = plainPassword || password; // Send plain password only for testing
    }
    res.json(response);
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/unregistered", async (req, res) => {
  const { deviceId } = req.query;

  try {
    const pendingUser = await PendingUser.findOne({ deviceId }) // match with device
      .sort({ detectedAt: -1 }) // latest first
      .limit(1);

    res.json({ pendingUser: pendingUser ? pendingUser : null });
  } catch (err) {
    console.error("Error fetching pending users:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /api/my-institution/devices (JWT-protected)
router.get("/devices", async (req, res) => {
  try {
    const institution = await Institution.findOne({
      institutionCode: req.user.institutionCode,
    });

    if (!institution) {
      return res.status(404).json({ error: "Institution not found" });
    }

    return res.status(200).json({
      deviceIds: institution.deviceIds,
      status: institution.subscriptionStatus,
      subscriptionEndDate: institution.subscriptionEndDate,
    });
  } catch (error) {
    console.error("Error fetching device IDs:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
