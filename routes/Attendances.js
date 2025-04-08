// const express = require("express");
// const mongoose = require("mongoose");
// const router = express.Router();
// const Student = require("../models/Student");
// const School = require("../models/School");
// const Attendance = require("../models/Attendance");

// // Pending Student Schema (for unregistered RFIDs)
// const pendingStudentSchema = new mongoose.Schema({
//   rfid: { type: String, unique: true }, // Ensure RFID is unique
//   detectedAt: { type: Date, default: Date.now },
// });

// const PendingStudent =
//   mongoose.models.PendingStudent ||
//   mongoose.model("PendingStudent", pendingStudentSchema);

// router.post("/scan", async (req, res) => {
//   try {
//     const rfid = req.body.uid;
//     if (!rfid) return res.status(400).json({ error: "RFID is required" });

//     // Find the student by RFID
//     const student = await Student.findOne({ rfid });

//     if (student) {
//       const currentDate = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
//       const currentTime = new Date();
//       const hour = currentTime.getHours();

//       // Find attendance record using rfid instead of studentId
//       let attendanceRecord = await Attendance.findOne({ rfid });
//       console.log(attendanceRecord, "attendancerecord");

//       if (!attendanceRecord) {
//         // If no attendance record exists for the student, create a new one
//         attendanceRecord = new Attendance({
//           institutionCode: student.institutionCode, // ✅ Ensure institutionCode is stored
//           name: student.name,
//           role: student.role, // Assuming role is a field in the Student model
//           rfid: student.rfid,
//           attendance: [],
//         });
//       }

//       // Find today's attendance entry
//       let todayEntryIndex = attendanceRecord.attendance.findIndex(
//         (entry) => entry.date === currentDate
//       );

//       if (todayEntryIndex === -1) {
//         // If today's entry doesn't exist, create a new one
//         attendanceRecord.attendance.push({
//           date: currentDate,
//           morningEntry: null,
//           eveningEntry: null,
//         });
//         todayEntryIndex = attendanceRecord.attendance.length - 1;
//       }

//       // Reference the correct entry
//       let todayEntry = attendanceRecord.attendance[todayEntryIndex];

//       // Check and update morning or evening entry
//       if (hour < 12 && !todayEntry.morningEntry) {
//         todayEntry.morningEntry = currentTime;
//       } else if (hour >= 12 && !todayEntry.eveningEntry) {
//         todayEntry.eveningEntry = currentTime;
//       } else {
//         return res
//           .status(400)
//           .json({ error: "Entry already exists for this session" });
//       }

//       // ✅ Save updated attendance array
//       attendanceRecord.attendance[todayEntryIndex] = todayEntry;
//       await attendanceRecord.save();

//       return res.json({
//         name: student.name,
//         uid: student.rfid,
//         status: "Present",
//         time: currentTime,
//       });
//     } else {
//       // If student is not found, add to pending list
//       const existingPending = await PendingStudent.findOne({ rfid });

//       if (!existingPending) {
//         await PendingStudent.create({ rfid });
//       }

//       return res.json({
//         uid: rfid,
//         status: "Pending",
//       });
//     }
//   } catch (err) {
//     console.error("Error processing RFID scan:", err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// // Get Pending Students for React Frontend
// router.get("/unregistered", async (req, res) => {
//   try {
//     const pendingStudent = await PendingStudent.findOne()
//       .sort({ detectedAt: -1 })
//       .limit(1);

//     return res.json({ rfid: pendingStudent ? pendingStudent.rfid : null });
//   } catch (err) {
//     console.error("Error fetching pending students:", err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// // Register Pending Student
// router.post("/register", async (req, res) => {
//   try {
//     // console.log(req.body, "its");
//     const {
//       name,
//       // role,
//       class: className,
//       rollNumber,
//       rfid,
//       parentName,
//       parentContactNumber,
//       schoolName,
//     } = req.body;
//     if (!name || !className || !rollNumber || !rfid) {
//       return res.status(400).json({ error: "All fields are required" });
//     }

//     // Check if student already exists
//     const existingStudent = await Student.findOne({ rfid });
//     const institutionCode = await School.findOne({ name: schoolName });
//     // console.log(institutionCode, "school code");

//     if (existingStudent) {
//       return res.status(400).json({ error: "RFID is already registered" });
//     }

//     // Add student to the students collection
//     const newStudent = await Student.create({
//       name,
//       role: "student", // Default role is 'student'
//       className,
//       rollNumber,
//       parentName,
//       parentContactNumber,
//       schoolName,
//       institutionCode: institutionCode.institutionCode,
//       rfid,
//     });

//     // Remove from pending students
//     await PendingStudent.deleteOne({ rfid });

//     return res.json({ success: true, student: newStudent });
//   } catch (err) {
//     console.error("Error registering student:", err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// module.exports = router;

// const express = require("express");
// const mongoose = require("mongoose");
// const router = express.Router();
// const Student = require("../models/Student");
// const Teacher = require("../models/Teacher");
// const Staff = require("../models/Staff");
// const School = require("../models/School");
// const Attendance = require("../models/Attendance");

// // Pending User Schema (for unregistered RFIDs)
// const pendingUserSchema = new mongoose.Schema({
//   rfid: { type: String, unique: true }, // Ensure RFID is unique
//   detectedAt: { type: Date, default: Date.now },
// });

// const PendingUser =
//   mongoose.models.PendingUser ||
//   mongoose.model("PendingUser", pendingUserSchema);

// router.post("/scan", async (req, res) => {
//   try {
//     const rfid = req.body.uid;
//     if (!rfid) return res.status(400).json({ error: "RFID is required" });

//     // Find the user by RFID (student, teacher, or staff)
//     const user =
//       (await Student.findOne({ rfid })) ||
//       (await Teacher.findOne({ rfid })) ||
//       (await Staff.findOne({ rfid }));

//     if (user) {
//       const currentDate = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
//       const currentTime = new Date();
//       const hour = currentTime.getHours();

//       // Find attendance record using rfid instead of userId
//       let attendanceRecord = await Attendance.findOne({ rfid });

//       if (!attendanceRecord) {
//         // If no attendance record exists for the user, create a new one
//         attendanceRecord = new Attendance({
//           institutionCode: user.institutionCode,
//           name: user.name,
//           role: user.role,
//           rfid: user.rfid,
//           attendance: [],
//         });
//       }

//       // Find today's attendance entry
//       let todayEntryIndex = attendanceRecord.attendance.findIndex(
//         (entry) => entry.date === currentDate
//       );

//       if (todayEntryIndex === -1) {
//         // If today's entry doesn't exist, create a new one
//         attendanceRecord.attendance.push({
//           date: currentDate,
//           morningEntry: null,
//           eveningEntry: null,
//         });
//         todayEntryIndex = attendanceRecord.attendance.length - 1;
//       }

//       // Reference the correct entry
//       let todayEntry = attendanceRecord.attendance[todayEntryIndex];

//       // Check and update morning or evening entry
//       if (hour < 12 && !todayEntry.morningEntry) {
//         todayEntry.morningEntry = currentTime;
//       } else if (hour >= 12 && !todayEntry.eveningEntry) {
//         todayEntry.eveningEntry = currentTime;
//       } else {
//         return res
//           .status(400)
//           .json({ error: "Entry already exists for this session" });
//       }

//       // Save updated attendance array
//       attendanceRecord.attendance[todayEntryIndex] = todayEntry;
//       await attendanceRecord.save();

//       return res.json({
//         name: user.name,
//         uid: user.rfid,
//         role: user.role,
//         status: "Present",
//         time: currentTime,
//       });
//     } else {
//       // If user is not found, add to pending list
//       const existingPending = await PendingUser.findOne({ rfid });

//       if (!existingPending) {
//         await PendingUser.create({ rfid });
//       }

//       return res.json({
//         uid: rfid,
//         status: "Pending",
//       });
//     }
//   } catch (err) {
//     console.error("Error processing RFID scan:", err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// // Get Pending Users for React Frontend
// router.get("/unregistered", async (req, res) => {
//   try {
//     const pendingUser = await PendingUser.findOne()
//       .sort({ detectedAt: -1 })
//       .limit(1);

//     return res.json({ rfid: pendingUser ? pendingUser.rfid : null });
//   } catch (err) {
//     console.error("Error fetching pending users:", err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// // Register Pending User
// router.post("/register", async (req, res) => {
//   try {
//     const {
//       name,
//       role,
//       class: className,
//       rollNumber,
//       rfid,
//       parentName,
//       parentContactNumber,
//       schoolName,
//       designation,
//     } = req.body;
//     if (!name || !rfid || !role || !schoolName) {
//       return res.status(400).json({ error: "All fields are required" });
//     }

//     // Check if user already exists
//     const existingUser =
//       (await Student.findOne({ rfid })) ||
//       (await Teacher.findOne({ rfid })) ||
//       (await Staff.findOne({ rfid }));
//     const institutionCode = await School.findOne({ name: schoolName });

//     if (existingUser) {
//       return res.status(400).json({ error: "RFID is already registered" });
//     }

//     let newUser;
//     if (role === "student") {
//       newUser = await Student.create({
//         name,
//         role,
//         className,
//         rollNumber,
//         parentName,
//         parentContactNumber,
//         schoolName,
//         institutionCode: institutionCode.institutionCode,
//         rfid,
//       });
//     } else if (role === "teacher") {
//       newUser = await Teacher.create({
//         name,
//         role,
//         schoolName,
//         institutionCode: institutionCode.institutionCode,
//         rfid,
//         designation,
//       });
//     } else if (role === "staff") {
//       newUser = await Staff.create({
//         name,
//         role,
//         schoolName,
//         institutionCode: institutionCode.institutionCode,
//         rfid,
//         designation,
//       });
//     } else {
//       return res.status(400).json({ error: "Invalid role specified" });
//     }

//     // Remove from pending users
//     await PendingUser.deleteOne({ rfid });

//     return res.json({ success: true, user: newUser });
//   } catch (err) {
//     console.error("Error registering user:", err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// module.exports = router;

// const express = require("express");
// const router = express.Router();
// const Teacher = require("../models/Teacher");
// const Staff = require("../models/Staff");
// const School = require("../models/Institution");
// const Attendance = require("../models/Attendance");
// const PendingUser = require("../models/PendingUser");
// const Institution = require("../models/Institution");

// router.post("/scan", async (req, res) => {
//   try {
//     const rfid = req.body.uid;
//     const deviceId = req.body.deviceId;

//     if (!rfid || !deviceId) {
//       return res.status(400).json({ error: "RFID and deviceId are required" });
//     }

//     console.log(rfid, deviceId, "rfid and device id");

//     // Step 1: Find institution by deviceId
//     const institution = await Institution.findOne({ deviceIds: deviceId });
//     if (!institution) {
//       return res
//         .status(404)
//         .json({ error: "Institution not found for this device" });
//     }

//     const institutionCode = institution.institutionCode; // or institutionCode

//     // Step 2: Find the user using both rfid and institutionCode
//     const user =
//       (await Student.findOne({ rfid, institutionCode: institutionCode })) ||
//       (await Teacher.findOne({ rfid, institutionCode: institutionCode })) ||
//       (await Staff.findOne({ rfid, institutionCode: institutionCode }));

//     if (user) {
//       const currentDate = new Date().toISOString().split("T")[0];
//       const currentTime = new Date();
//       const hour = currentTime.getHours();

//       let attendanceRecord = await Attendance.findOne({
//         rfid,
//         institutionCode: institutionCode,
//       });

//       if (!attendanceRecord) {
//         attendanceRecord = new Attendance({
//           name: user.name,
//           role: user.role,
//           rfid: user.rfid,
//           institutionCode: institutionCode,
//           attendance: [],
//         });
//       }

//       let todayEntryIndex = attendanceRecord.attendance.findIndex(
//         (entry) => entry.date === currentDate
//       );

//       if (todayEntryIndex === -1) {
//         attendanceRecord.attendance.push({
//           date: currentDate,
//           morningEntry: null,
//           eveningEntry: null,
//         });
//         todayEntryIndex = attendanceRecord.attendance.length - 1;
//       }

//       let todayEntry = attendanceRecord.attendance[todayEntryIndex];

//       if (hour < 12 && !todayEntry.morningEntry) {
//         todayEntry.morningEntry = currentTime;
//       } else if (hour >= 12 && !todayEntry.eveningEntry) {
//         todayEntry.eveningEntry = currentTime;
//       } else {
//         return res
//           .status(400)
//           .json({ error: "Entry already exists for this session" });
//       }

//       attendanceRecord.attendance[todayEntryIndex] = todayEntry;
//       await attendanceRecord.save();

//       return res.json({
//         name: user.name,
//         uid: user.rfid,
//         role: user.role,
//         status: "Present",
//         time: currentTime,
//       });
//     } else {
//       // Add to pending list with scoped institutionCode
//       const existingPending = await PendingUser.findOne({
//         rfid,
//         institutionCode: institutionCode,
//       });

//       if (!existingPending) {
//         await PendingUser.create({ rfid, institutionCode: institutionCode });
//       }

//       return res.json({
//         uid: rfid,
//         status: "Pending",
//       });
//     }
//   } catch (err) {
//     console.error("Error processing RFID scan:", err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// // Get Pending Users for React Frontend
// router.get("/unregistered", async (req, res) => {
//   try {
//     const pendingUser = await PendingUser.findOne()
//       .sort({ detectedAt: -1 })
//       .limit(1);

//     return res.json({ rfid: pendingUser ? pendingUser.rfid : null });
//   } catch (err) {
//     console.error("Error fetching pending users:", err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// // Register Pending User
// router.post("/register", async (req, res) => {
//   try {
//     const {
//       name,
//       role,
//       class: className,
//       rollNumber,
//       rfid,
//       parentName,
//       parentContactNumber,
//       schoolName,
//       designation,
//     } = req.body;
//     if (!name || !rfid || !role || !schoolName) {
//       return res.status(400).json({ error: "All fields are required" });
//     }

//     // Check if user already exists
//     const existingUser =
//       (await Student.findOne({ rfid })) ||
//       (await Teacher.findOne({ rfid })) ||
//       (await Staff.findOne({ rfid }));
//     const institutionCode = await School.findOne({ name: schoolName });

//     if (existingUser) {
//       return res.status(400).json({ error: "RFID is already registered" });
//     }

//     let newUser;
//     if (role === "student") {
//       newUser = await Student.create({
//         name,
//         role,
//         className,
//         rollNumber,
//         parentName,
//         parentContactNumber,
//         schoolName,
//         institutionCode: institutionCode.institutionCode,
//         rfid,
//       });
//     } else if (role === "teacher") {
//       newUser = await Teacher.create({
//         name,
//         role,
//         className,
//         subject,
//         contactNumber,
//         schoolName,
//         institutionCode: institutionCode.institutionCode,
//         rfid,
//       });
//     } else if (role === "staff") {
//       newUser = await Staff.create({
//         name,
//         role,
//         designation,
//         contactNumber,
//         department,
//         schoolName,
//         institutionCode: institutionCode.institutionCode,
//         rfid,
//       });
//     } else {
//       return res.status(400).json({ error: "Invalid role specified" });
//     }

//     // Remove from pending users
//     await PendingUser.deleteOne({ rfid });

//     return res.json({ success: true, user: newUser });
//   } catch (err) {
//     console.error("Error registering user:", err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Staff = require("../models/Staff");
const Institution = require("../models/Institution");
const Attendance = require("../models/Attendance");
const PendingUser = require("../models/PendingUser");

let hashedPassword;
let plainPassword;
// Utility function to generate a random 8-character password
const generateRandomPassword = () => {
  return Math.random().toString(36).slice(-8);
};

router.post("/scan", async (req, res) => {
  try {
    const { uid: rfid, deviceId } = req.body;
    if (!rfid || !deviceId) {
      return res.status(400).json({ error: "RFID and deviceId are required" });
    }

    const institution = await Institution.findOne({ deviceIds: deviceId });
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
      const currentDate = new Date().toISOString().split("T")[0];
      const currentTime = new Date();
      const hour = currentTime.getHours();

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
      if (!(await PendingUser.findOne({ rfid, institutionCode }))) {
        await PendingUser.create({ rfid, institutionCode });
      }
      return res.json({ uid: rfid, status: "Pending" });
    }
  } catch (err) {
    console.error("Error processing RFID scan:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/unregistered", async (req, res) => {
  const { deviceId } = req.query;

  try {
    const pendingUser = await PendingUser.findOne({ deviceId }) // match with device
      .sort({ detectedAt: -1 }) // latest first
      .limit(1);

    res.json({ pendingUser: pendingUser ? pendingUser : null });
  } catch (err) {
    console.error("Error fetching pending users:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /api/my-institution/devices (JWT-protected)
router.get("/devices", async (req, res) => {
  try {
    const institution = await Institution.findOne({
      institutionCode: req.user.institutionCode,
    });

    if (!institution) {
      return res.status(404).json({ error: "Institution not found" });
    }

    return res.status(200).json({ deviceIds: institution.deviceIds });
  } catch (error) {
    console.error("Error fetching device IDs:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/register", async (req, res) => {
  console.log(req.body, "From Fronetend");
  try {
    const {
      name,
      role,
      className,
      subject,
      rollNumber,
      email,
      rfid,
      parentName,
      parentContactNumber,
      designation,
      contactNumber,
      department,
      institutionCode,
      password,
    } = req.body;
    if (!name || !rfid || !role || !institutionCode) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (
      await Promise.any([
        Student.findOne({ rfid, institutionCode }),
        Teacher.findOne({ rfid, institutionCode }),
        Staff.findOne({ rfid, institutionCode }),
      ]).catch(() => null)
    ) {
      return res.status(400).json({ error: "RFID is already registered" });
    }

    const institution = await Institution.findOne({ institutionCode });
    if (!institution) {
      return res.status(400).json({ error: "Institution not found" });
    }

    let newUser;
    if (role === "student") {
      newUser = await Student.create({
        name,
        role,
        className,
        rollNumber,
        parentName,
        parentContactNumber,
        institutionName: institution.institutionName,
        institutionCode: institution.institutionCode,
        rfid,
      });
    } else if (role === "teacher") {
      if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
      } else {
        plainPassword = generateRandomPassword();
        hashedPassword = await bcrypt.hash(plainPassword, 10);
      }
      newUser = await Teacher.create({
        name,
        role,
        className,
        subject,
        contactNumber,
        institutionName: institution.institutionName,
        institutionCode: institution.institutionCode,
        email,
        rfid,
        password: hashedPassword,
      });
    } else if (role === "staff") {
      newUser = await Staff.create({
        name,
        role,
        designation,
        contactNumber,
        department,
        institutionName: institution.institutionName,
        institutionCode: institution.institutionCode,
        rfid,
      });
    } else {
      return res.status(400).json({ error: "Invalid role specified" });
    }

    await PendingUser.deleteOne({ rfid, institutionCode });
    // res.json({ success: true, user: newUser });
    const response = { success: true, user: newUser };
    if (role === "teacher" && (plainPassword || password)) {
      response.password = plainPassword || password; // Send plain password only for testing
    }
    res.json(response);
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
