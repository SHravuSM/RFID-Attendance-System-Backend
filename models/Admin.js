// models/Admin.js
const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    default: "admin",
  },
  password: {
    type: String, // hashed
    required: true,
  },
});

module.exports = mongoose.model("admin", adminSchema);