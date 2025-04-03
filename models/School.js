const mongoose = require("mongoose");

const schoolSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  principal: String,
  contact: String,
  address: String,
  email: { type: String, unique: true, required: true },
  schoolCode: { type: String, unique: true, required: true }, // ✅ Add this field
  password: String,
});

module.exports = mongoose.model("schools", schoolSchema);