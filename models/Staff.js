const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  designation: { type: String, required: true }, // Role (e.g., Clerk, Peon, Admin, etc.)
  contactNumber: { type: String, required: true },
  department: { type: String, required: true }, // e.g., Administration, Support, IT, etc.
  schoolName: { type: String, required: true },
  schoolCode: { type: String, required: true }, // School identifier
  rfid: { type: String, unique: true, required: true }, // Unique RFID
});

module.exports = mongoose.model("staffs", staffSchema);