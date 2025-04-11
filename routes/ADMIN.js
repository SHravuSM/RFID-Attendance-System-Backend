const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const allowRoles = require("../middlewares/allowRoles.js");
const AInstitutions = require("./AInstitutions.js");
const Attendances = require("./Attendances.js");
const servicerequests = require("./servicerequests.js");
const Students = require("./students.js");
const Teachers = require("./Teachers.js");
const RFID_Devices = require("./RFID_Devices.js");

router.use(verifyToken, allowRoles("admin")); // 🔐 applies to all routes below

router.use("/institutions", AInstitutions);
router.use("/rfid", Attendances);
router.use("/servicerequests", servicerequests);
router.use("/students", Students);
router.use("/teachers", Teachers);
router.use("/teachers", Teachers);
router.use("/rfiddevices", RFID_Devices);

module.exports = router;
