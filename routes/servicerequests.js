const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const Institution = require("../models/Institution");
const ServiceRequest = require("../models/ServiceRequest");

// GET - Fetch all service requests
router.get("/", async (req, res) => {
  try {
    const requests = await ServiceRequest.find();
    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching service requests:", error);
    res.status(500).json({ message: "Server error. Try again later." });
  }
});

// Utility function to generate a unique institution code
const generateInstitutionCode = (name) => {
  const namePart = name.toUpperCase().replace(/\s+/g, "").slice(0, 4);
  const randomPart = Math.floor(100 + Math.random() * 900);
  return `${namePart}${randomPart}`;
};

// Utility function to generate a random 8-character password
const generateRandomPassword = () => {
  return Math.random().toString(36).slice(-8);
};

router.put("/:id/approve", async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);
    const { principalName, contactNumber, address, email, institutionName } =
      request;

    if (
      !principalName ||
      !contactNumber ||
      !address ||
      !email ||
      !institutionName
    ) {
      return res
        .status(400)
        .json({ message: "Missing required fields in the service request." });
    }

    const institutionCode = generateInstitutionCode(institutionName);
    const plainPassword = generateRandomPassword();
    const password = await bcrypt.hash(plainPassword, 10);

    await Institution.create({
      principalName,
      contactNumber,
      role: "institution",
      address,
      email,
      institutionName,
      institutionCode,
      password,
      subscriptionStatus: "expired",
    });
    await ServiceRequest.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Institution approved and created successfully.",
      institutionCode,
      password: plainPassword,
    });
  } catch (error) {
    console.error("Error approving service request:", error);
    res.status(500).json({ message: "Server error. Try again later." });
  }
});

// DELETE - Remove a service request
router.delete("/:id/reject", async (req, res) => {
  try {
    await ServiceRequest.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Service request deleted successfully." });
  } catch (error) {
    console.error("Error deleting service request:", error);
    res.status(500).json({ message: "Server error. Try again later." });
  }
});

module.exports = router;
