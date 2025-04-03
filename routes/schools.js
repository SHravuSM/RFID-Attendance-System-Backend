// const express = require("express");
// const SchoolRequest = require("../models/SchoolRequest");
// const School = require("../models/School");
// const router = express.Router();

// // Admin: View all pending requests
// router.get("/requests", async (req, res) => {
//   const requests = await SchoolRequest.find({ status: "pending" });
//   res.json(requests);
// });

// // Admin: Approve Request
// router.post("/approve/:id", async (req, res) => {
//   const request = await SchoolRequest.findById(req.params.id);
//   if (!request) return res.status(404).json({ message: "Request not found" });

//   // Create school
//   const schoolCode = `${request.name.toUpperCase().replace(/\s/g, "")}_${Date.now()}`;
//   const password = Math.random().toString(36).slice(-8); // random password

//   const newSchool = new School({
//     name: request.name,
//     address: request.address,
//     principal: request.principal,
//     email: request.email,
//     contact: request.contact,
//     schoolCode,
//     password,
//   });

//   await newSchool.save();
//   request.status = "approved";
//   await request.save();

//   res.json({ message: "School Approved", login: { schoolCode, password } });
// });

// module.exports = router;


const express = require("express");
const router = express.Router();
const School = require("../models/School");

// Get all schools
router.get("/", async (req, res) => {
  try {
    const schools = await School.find();
    res.json(schools);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete school
router.delete("/:id", async (req, res) => {
  try {
    await School.findByIdAndDelete(req.params.id);
    res.json({ message: "School deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;