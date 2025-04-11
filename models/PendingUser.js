const mongoose = require("mongoose");

// Pending User Schema (for unregistered RFIDs)
const pendingUserSchema = new mongoose.Schema({
  rfid: { type: String, unique: true, required: true }, // RFID must be unique
  deviceId: { type: String, required: false }, // Device ID that scanned the RFID
  institutionCode: { type: String, required: false }, // Institution to which the device belongs
  institutionName: { type: String, required: false }, // Institution to which the device belongs
  detectedAt: { type: Date, default: Date.now }, // Timestamp of detection
});

module.exports = mongoose.model("pendinguser", pendingUserSchema);
