const mongoose = require("mongoose");

const serviceRequestSchema = new mongoose.Schema(
  {
    institutionName: { type: String, required: true },
    address: { type: String, required: true },
    principalName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    contactNumber: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("servicerequests", serviceRequestSchema);