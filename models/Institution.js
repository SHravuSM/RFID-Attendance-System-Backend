const mongoose = require("mongoose")

const institutionSchema = new mongoose.Schema({
  principalName: String,
  role: { type: String, default: "institution" },
  contactNumber: { type: String, required: true },
  address: String,
  email: { type: String, unique: true, required: true },
  institutionName: { type: String, unique: true, required: true },
  institutionCode: { type: String, unique: true, required: true },
  password: String,
  subscriptionStatus: { type: String, default: "expired" }, // Default status is "expired"
  subscriptionStartDate: { type: Date, default: Date.now },
  subscriptionEndDate: { type: Date, default: Date.now },
  // classes: [String], // Array of class names
  classes: [
    {
      className: String,
      _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    },
  ],
  deviceIds: [String], // Array of registered RFID device IDs
});

module.exports = mongoose.model("institutions", institutionSchema);
