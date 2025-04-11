const mongoose = require("mongoose");

const institutionSchema = new mongoose.Schema({
  principalName: String,
  role: { type: String, default: "institution" },
  contactNumber: { type: String, required: true },
  address: String,
  email: { type: String, unique: true, required: true },
  institutionName: { type: String, unique: true, required: true },
  institutionCode: { type: String, unique: true, required: true },
  password: String,
  allsubscriptions: [
    {
      subscribedDate: { type: String, required: true }, // Store as IST string
    },
  ],
  subscriptionStatus: { type: String, default: "expired" }, // Default status is "expired"
  subscriptionStartDate: { type: String, default: Date.now },
  subscriptionEndDate: { type: String, default: Date.now },
  // classes: [String], // Array of class names
  classes: [String],
  deviceIds: [String], // Array of registered RFID device IDs
});

module.exports = mongoose.model("institution", institutionSchema);
