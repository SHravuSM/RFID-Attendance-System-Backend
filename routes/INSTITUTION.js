const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const allowRoles = require("../middlewares/allowRoles.js");
const Institutions = require("./institutions.js");
const Attendances = require("./Attendances.js");
const servicerequests = require("./servicerequests.js");
const Students = require("./students.js");
const Teachers = require("./Teachers.js");
const Account = require("./Account.js");
const Classes = require("./Classes.js");

router.use(verifyToken, allowRoles("institution")); // 🔐 applies to all routes below

router.use("/institutions", Institutions);
router.use("/rfid", Attendances);
router.use("/students", Students);
router.use("/teachers", Teachers);
router.use("/classes", Classes);
router.use("/account", Account);

module.exports = router;
