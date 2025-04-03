// server/routes/schoolLogin.js
import express from "express";
import School from "../models/School.js"; // Your MongoDB School model
import bcrypt from "bcrypt"; // Optional, if password is hashed

const router = express.Router();

router.post("/school-login", async (req, res) => {
  const { schoolId, password } = req.body;

  try {
    const school = await School.findOne({ schoolId });

    if (!school) {
      return res.status(404).json({ message: "School ID not found" });
    }

    // 👉 If you stored plain password (for now):
    if (school.password !== password) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // ✅ Success
    res.status(200).json({ schoolId: school.schoolId });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;