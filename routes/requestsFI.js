const express = require("express");
const router = express.Router();
const ServiceRequest = require("../models/ServiceRequest");

// POST - Store Service Request
router.post("/institution-request", async (req, res) => {
  try {
    const { name, address, principal, email, contact } = req.body;
    if (!name || !address || !principal || !email || !contact) {
      return res.status(400).json({ message: "All fields are required." });
    }

    await ServiceRequest.create({
      institutionName: name,
      address: address,
      principalName: principal,
      email,
      contactNumber: contact,
    });

    res.status(201).json({
      message: "Request received successfully. We will reach out you Soon..",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error. Try again later." });
  }
});

module.exports = router;
