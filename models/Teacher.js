const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, default: "teacher" },
  className: String,
  subject: { type: String, required: true }, // Teacher's subject
  contactNumber: { type: String, required: true },
  schoolName: { type: String, required: true },
  schoolCode: { type: String, required: true }, // School identifier
  rfid: { type: String, unique: true, required: true }, // Unique RFID
});

module.exports = mongoose.model("teachers", teacherSchema);