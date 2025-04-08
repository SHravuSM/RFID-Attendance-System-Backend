const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, default: "staff", enum: ["staff"] }, // Role locked to "staff"
  designation: { type: String, required: true }, // Job title (e.g., Clerk, Admin)
  contactNumber: { type: String, required: true },
  department: { type: String, required: true }, // Stored in lowercase
  institutionName: { type: String, required: true },
  institutionCode: { type: String, required: true }, // Uppercase for uniformity
  rfid: { type: String, required: true }, // Unique RFID
});

module.exports = mongoose.model("staffs", staffSchema);