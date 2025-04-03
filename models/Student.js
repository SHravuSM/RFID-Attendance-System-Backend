const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: String,
  role: { type: String, default: "student" }, // Default role is 'student'
  className: String, // Changed from 'class' to avoid conflicts
  rollNumber: String,
  parentName: String,
  parentContactNumber: String,
  schoolName: String,
  schoolCode: { type: String, required: true }, // School identifier
  rfid: { type: String, unique: true }, // Ensure RFID is unique
});

module.exports = mongoose.model("students", studentSchema);