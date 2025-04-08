const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

// Temporary one-time route to create the first admin
router.post("/puneethrajkumar18sh", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required." });
  }

  try {
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(409).json({ message: "Admin already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      username,
      password: hashedPassword,
      role: "admin", // or "superadmin" if you're planning role escalation
    });

    await newAdmin.save();

    res.status(201).json({
      message: "Initial admin created successfully.",
      admin: {
        username: newAdmin.username,
        role: newAdmin.role,
      },
    });
  } catch (error) {
    console.error("Error creating initial admin:", error);
    res.status(500).json({ message: "Server error. Try again later." });
  }
});

module.exports = router;