const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  rfid: { type: String, required: true, unique: true },
  institutionCode: { type: String, required: true },
  attendance: [
    {
      date: { type: String, required: true }, // Store date as "YYYY-MM-DD"
      morningEntry: String, // Morning a
      eveningEntry: String, // Evening scan
    },
  ],
});

module.exports = mongoose.model("attendance", attendanceSchema);
