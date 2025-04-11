const express = require("express");
const Institution = require("../models/Institution");
const router = express.Router();

router.get("/", async (req, res) => {
  const institution = await Institution.find({
    institutionCode: req.user.institutionCode,
  });

  return res.json(institution);
});

module.exports = router;
