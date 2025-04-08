const express = require("express");
const router = express.Router();
const Teacher = require("../models/Teacher"); // Assuming you have a Teacher model

router.get("/", async (req, res) => {
  try {
    const teachers = await Teacher.find({
      institutionCode: req.user.institutionCode,
    });
    res.json(teachers);
  } catch (error) {
    console.error("Error fetching teachers:", error.message);
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;