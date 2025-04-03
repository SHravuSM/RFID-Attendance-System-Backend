const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  rfid: { type: String, required: true, unique: true },
  schoolCode: { type: String, required: true }, // School identifier
  attendance: [
    {
      date: { type: String, required: true }, // Store date as "YYYY-MM-DD"
      morningEntry: { type: Date, default: null }, // Morning scan
      eveningEntry: { type: Date, default: null }, // Evening scan
    },
  ],
});

module.exports = mongoose.model("attendances", attendanceSchema);