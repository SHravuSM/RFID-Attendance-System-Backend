const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, default: "teacher" }, // Role locked to "teacher"
  className: { type: String }, // Optional if they teach a specific class
  subject: { type: String, required: true }, // Subject stored in lowercase
  contactNumber: { type: String, required: true },
  institutionName: { type: String, required: true },
  institutionCode: {
    type: String,
    required: true,
  }, // Uppercase for uniformity
  rfid: { type: String, required: true }, // Unique RFID
  email: { type: String, required: true, unique: true }, // Unique email
  password: String,
});

module.exports = mongoose.model("teacher", teacherSchema);
