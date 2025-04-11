const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: String,
  role: { type: String, default: "student" }, // Default role is 'student'
  className: String, // Changed from 'class' to avoid conflicts
  rollNumber: String,
  parentName: String,
  parentContactNumber: String,
  institutionName: String,
  institutionCode: { type: String, required: true },
  rfid: { type: String, unique: true, required: true }, // Unique RFID
});

module.exports = mongoose.model("student", studentSchema);
