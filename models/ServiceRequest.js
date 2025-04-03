const mongoose = require("mongoose");

const serviceRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    principal: { type: String, required: true },
    email: { type: String, required: true },
    contact: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("servicerequests", serviceRequestSchema);
