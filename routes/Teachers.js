const express = require("express");
const router = express.Router();
const Teacher = require("../models/Teacher"); // Assuming you have a Teacher model

// Example route to get all teachers
router.get("/", async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;