const express = require("express");
const router = express.Router();
const Institution = require("../models/Institution");

// GET /api/devices
router.get("/", async (req, res) => {
  try {
    const institutions = await Institution.find(
      { deviceIds: { $exists: true, $not: { $size: 0 } } },
      {
        institutionName: 1,
        subscriptionStatus: 1,
        deviceIds: 1,
        _id: 0,
      }
    );

    const devices = institutions.flatMap((institution) =>
      institution.deviceIds.map((deviceId) => ({
        id: deviceId,
        institutionName: institution.institutionName,
        status:
          institution.subscriptionStatus === "active" ? "Active" : "Inactive",
      }))
    );
    console.log(devices);
    res.json(devices);
  } catch (error) {
    console.error("Error fetching devices:", error);
    res.status(500).json({ error: "Server error fetching devices." });
  }
});

// DELETE device
router.delete("/:deviceId", async (req, res) => {
  const { deviceId } = req.params;
  console.log(deviceId);

  try {
    // Find institution that has this device
    const institution = await Institution.findOne({ deviceIds: deviceId });
    if (!institution) {
      return res.status(404).json({ error: "Device not found" });
    }

    // Remove the deviceId from the array
    institution.deviceIds = institution.deviceIds.filter(
      (id) => id !== deviceId
    );
    await institution.save();
    console.log(institution.deviceIds);
    res.status(200).json({ message: "Device deleted successfully" });
  } catch (err) {
    console.error("Error deleting device:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
