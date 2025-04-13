const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Staff = require("../models/Staff");
const Institution = require("../models/Institution");
const Attendance = require("../models/Attendance");
const PendingUser = require("../models/PendingUser");

// router.post("/scan", async (req, res) => {
//   try {
//     const now = new Date();
//     const { uid: rfid, deviceId } = req.body;
//     const currentDate = now.toISOString().split("T")[0];
//     const currentTime = now.toTimeString().split(" ")[0];

//     const institution = await Institution.findOne({ deviceIds: deviceId });
//     if (!institution) {
//       return res
//         .status(404)
//         .json({ error: "Institution not found for this device" });
//     }

//     const institutionCode = institution.institutionCode;
//     const collections = [Student, Teacher, Staff];

//     let user = null;
//     for (const Model of collections) {
//       user = await Model.findOne({ rfid, institutionCode });
//       if (user) break;
//     }

//     if (user) {
//       const hour = now.getHours();

//       let attendanceRecord = await Attendance.findOne({
//         name: user.name,
//         role: user.role,
//         rfid: user.rfid,
//         institutionCode: user.institutionCode,
//       });

//       if (!attendanceRecord) {
//         attendanceRecord = new Attendance({
//           name: user.name,
//           role: user.role,
//           rfid,
//           institutionCode,
//           attendance: [],
//         });
//       }

//       let todayEntry = attendanceRecord.attendance.find(
//         (entry) => entry.date === currentDate
//       );

//       console.log(todayEntry);

//       // if (!todayEntry) {
//       //   todayEntry = {
//       //     date: currentDate,
//       //     morningEntry: null,
//       //     eveningEntry: null,
//       //   };
//       //   todayEntry.morningEntry = currentTime;
//       //   attendanceRecord.attendance.push(todayEntry);
//       // } else {
//       //   todayEntry.eveningEntry = currentTime;
//       // }

//       // if (hour < 12) {
//       //   todayEntry.morningEntry = currentTime;
//       //   todayEntry.eveningEntry = null;
//       // } else if (hour >= 12 && todayEntry.morningEntry) {
//       //   todayEntry.eveningEntry = currentTime;
//       // } else {
//       //   return res
//       //     .status(400)
//       //     .json({ message: "Entry already exists for this session" });
//       // }
//       if (!todayEntry) {
//         todayEntry = {
//           date: currentDate,
//           morningEntry: null,
//           eveningEntry: null,
//         };

//         if (hour < 12) {
//           todayEntry.morningEntry = currentTime;
//         } else {
//           todayEntry.eveningEntry = currentTime;
//         }

//         attendanceRecord.attendance.push(todayEntry);
//       } else {
//         if (hour < 12) {
//           if (!todayEntry.morningEntry) {
//             todayEntry.morningEntry = currentTime;
//           } else {
//             return res
//               .status(400)
//               .json({ message: "Morning entry already exists." });
//           }
//         } else {
//           if (!todayEntry.eveningEntry) {
//             todayEntry.eveningEntry = currentTime;
//           } else {
//             return res
//               .status(400)
//               .json({ message: "Evening entry already exists." });
//           }
//         }
//       }

//       await attendanceRecord.save();
//       return res.json({ message: `${user.name} marked present.` });
//     } else {
//       // User not found — add to pending list if not already there
//       const alreadyPending = await PendingUser.findOne({ rfid });
//       if (!alreadyPending) {
//         const pending = new PendingUser({
//           rfid,
//           deviceId,
//           institutionCode,
//           institutionName: institution.institutionName,
//         });
//         await pending.save();
//       }
//       return res.json({ message: `${rfid} added to pending list.` });
//     }
//   } catch (err) {
//     console.error("Error processing RFID scan:", err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

router.post("/scan", async (req, res) => {
  try {
    const { uid: rfid, deviceId } = req.body;

    const now = new Date();

    // Get hours, minutes, and seconds
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();

    // Determine AM or PM
    const ampm = hours >= 12 ? "PM" : "AM";

    // Convert hours from 24-hour to 12-hour format
    hours = hours % 12; // Convert hour to 12-hour format
    hours = hours ? hours : 12; // Hour '0' should be '12'

    // Pad minutes and seconds with leading zero if necessary
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    // Construct the time string
    const currentTime = `${hours}:${minutes}:${seconds} ${ampm}`;

    console.log(currentTime);

    const currentDate = now.toISOString().split("T")[0];
    const hour = now.getHours();

    // Find the institution by device ID
    const institution = await Institution.findOne({ deviceIds: deviceId });
    if (!institution) {
      return res
        .status(404)
        .json({ error: "Institution not found for this device" });
    }

    const institutionCode = institution.institutionCode;
    const collections = [Student, Teacher, Staff];

    let user = null;
    for (const Model of collections) {
      user = await Model.findOne({ rfid, institutionCode });
      if (user) break;
    }

    if (user) {
      // Check if attendance record exists
      let attendanceRecord = await Attendance.findOne({
        name: user.name,
        role: user.role,
        rfid: user.rfid,
        institutionCode: user.institutionCode,
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

      // Check today's attendance entry
      let todayEntry = attendanceRecord.attendance.find(
        (entry) => entry.date === currentDate
      );

      if (!todayEntry) {
        // Create new entry for today
        todayEntry = {
          date: currentDate,
          morningEntry: null,
          eveningEntry: null,
        };

        if (hour < 12) {
          todayEntry.morningEntry = currentTime;
        } else {
          todayEntry.eveningEntry = currentTime;
        }

        attendanceRecord.attendance.push(todayEntry);
      } else {
        // Update existing entry for today
        if (hour < 12) {
          if (!todayEntry.morningEntry) {
            todayEntry.morningEntry = currentTime;
          } else {
            console.log("Evening entry already exists.");
            return res
              .status(400)
              .json({ message: "Morning entry already exists." });
          }
        } else {
          if (!todayEntry.eveningEntry) {
            todayEntry.eveningEntry = currentTime;
          } else {
            console.log("Evening entry already exists.");
            return res
              .status(400)
              .json({ message: "Evening entry already exists." });
          }
        }
      }

      await attendanceRecord.save();
      return res.json({ message: `${user.name} marked present.` });
    } else {
      // User not found — check if already in pending
      const alreadyPending = await PendingUser.findOne({ rfid });

      if (!alreadyPending) {
        const pending = new PendingUser({
          rfid,
          deviceId,
          institutionCode,
          institutionName: institution.institutionName,
        });
        await pending.save();
      }

      return res.json({ message: `${rfid} added to pending list.` });
    }
  } catch (err) {
    console.error("Error processing RFID scan:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/delete/:Id", async (req, res) => {
  try {
    const Id = req.params.Id;

    const user = await PendingUser.findOneAndDelete({ rfid: Id });

    if (!user) {
      return res
        .status(404)
        .json({ message: "RFID not found or already deleted." });
    }

    res
      .status(200)
      .json({ message: "User deleted successfully.", deletedUser: user });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = router;
