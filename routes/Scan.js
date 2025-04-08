const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Staff = require("../models/Staff");
const Institution = require("../models/Institution");
const Attendance = require("../models/Attendance");
const PendingUser = require("../models/PendingUser");

router.post("/scan", async (req, res) => {
  try {
    const { uid: rfid, deviceId } = req.body;
    console.log(rfid, deviceId);
    if (!rfid || !deviceId) {
      return res.status(400).json({ error: "RFID and deviceId are required" });
    }

    const institution = await Institution.findOne({ deviceIds: deviceId });
    console.log(institution);
    if (!institution) {
      return res
        .status(404)
        .json({ error: "Institution not found for this device" });
    }

    const institutionCode = institution.institutionCode;
    const user = await Promise.any([
      Student.findOne({ rfid, institutionCode }),
      Teacher.findOne({ rfid, institutionCode }),
      Staff.findOne({ rfid, institutionCode }),
    ]).catch(() => null);

    if (user) {
      const now = new Date();
      const currentDate = now.toISOString().split("T")[0];
      const hour = now.getHours();

      let attendanceRecord = await Attendance.findOne({
        rfid,
        institutionCode,
      });
      if (!attendanceRecord) {
        attendanceRecord = new Attendance({
          name: user.name,
          role: user.role,
          rfid,
          institutionCode,
          attendance: [],
        });
      }

      let todayEntry = attendanceRecord.attendance.find(
        (entry) => entry.date === currentDate
      );
      if (!todayEntry) {
        todayEntry = {
          date: currentDate,
          morningEntry: null,
          eveningEntry: null,
        };
        attendanceRecord.attendance.push(todayEntry);
      }

      if (hour < 12 && !todayEntry.morningEntry) {
        todayEntry.morningEntry = currentTime;
      } else if (hour >= 12 && !todayEntry.eveningEntry) {
        todayEntry.eveningEntry = currentTime;
      } else {
        return res
          .status(400)
          .json({ error: "Entry already exists for this session" });
      }

      await attendanceRecord.save();
      return res.json({
        name: user.name,
        uid: user.rfid,
        role: user.role,
        status: "Present",
        time: currentTime,
      });
    } else {
      if (!(await PendingUser.findOne({ rfid }))) {
        const pending = new PendingUser({ rfid, deviceId, institutionCode, institutionName: institution.name });
        await pending.save();
      }
      return res.json({ uid: rfid, status: "Pending" });
    }
  } catch (err) {
    console.error("Error processing RFID scan:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;