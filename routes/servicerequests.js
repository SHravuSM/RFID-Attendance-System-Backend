const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs"); // For password hashing
const School = require("../models/School");
const ServiceRequest = require("../models/ServiceRequest");

// GET - Fetch All Service Requests
router.get("/", async (req, res) => {
  try {
    const requests = await ServiceRequest.find();
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: "Server error. Try again later." });
  }
});

// Function to generate a unique school ID
const generateSchoolID = (name) => {
  // Remove spaces, convert to uppercase, and take the first 3 letters
  const namePart = name.toUpperCase().replace(/\s+/g, "").slice(0, 3);

  // Generate a random 3-digit number
  const randomPart = Math.floor(100 + Math.random() * 900); // Ensures a 3-digit number

  return `${namePart}${randomPart}`;
};

// Function to generate a random password
const generateRandomPassword = () => {
  return Math.random().toString(36).slice(-8); // 8-character password
};

// PUT - Approve a Service Request and create a school record
router.put("/:id/approve", async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found." });
    }

    // Generate School ID and Password
    const schoolCode = generateSchoolID(request.name); // ✅ Assign schoolCode
    console.log(schoolCode);
    const plainPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 10); // Hash the password

    // Save school in the database
    const newSchool = new School({
      name: request.name,
      principal: request.principal,
      contact: request.contact,
      address: request.address,
      email: request.email,
      schoolCode: schoolCode, // ✅ Assign schoolCode here
      password: hashedPassword,
    });

    await newSchool.save();

    // Delete the approved request from ServiceRequests collection
    await ServiceRequest.findByIdAndDelete(req.params.id);

    res.status(200).json({
      schoolCode: schoolCode,
      password: plainPassword, // Send plain password for reference (optional)
    });
  } catch (error) {
    console.error("Approval Error:", error);
    res.status(500).json({ message: "Server error. Try again later." });
  }
});

// DELETE - Remove a Service Request
router.delete("/:id", async (req, res) => {
  try {
    const request = await ServiceRequest.findByIdAndDelete(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found." });
    }
    res.status(200).json({ message: "Request deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error. Try again later." });
  }
});

module.exports = router;
