const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const Institution = require("../models/Institution");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const Admin = require("../models/Admin");
const Staff = require("../models/Staff");
const ServiceRequest = require("../models/ServiceRequest");

// Get all Institutions
router.get("/", async (req, res) => {
  try {
    const institution = await Institution.find({});
    //console.log(institution);
    res.json(institution);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/institution/:institutionName", async (req, res) => {
  try {
    const institutionName = req.params.institutionName;

    // 1. Fetch institution
    const institution = await Institution.findOne({ institutionName });
    if (!institution) {
      return res.status(404).json({ message: "Institution not found" });
    }

    const institutionCode = institution.institutionCode;

    // 2. Fetch students, teachers, staff
    const students = await Student.find({ institutionCode });
    const teachers = await Teacher.find({ institutionCode });
    const staff = await Staff.find({ institutionCode });

    // 3. Fetch attendance records
    const attendanceRecords = await Attendance.find({ institutionCode });

    // 4. Attendance calculations
    let studentAttendance = [],
      teacherAttendance = [],
      staffAttendance = [];

    attendanceRecords.forEach((record) => {
      if (record.role === "student") studentAttendance.push(record);
      else if (record.role === "teacher") teacherAttendance.push(record);
      else if (record.role === "staff") staffAttendance.push(record);
    });

    // Helper: Calculate average attendance
    const getAvgAttendance = (records) => {
      if (records.length === 0) return 0;
      let totalDays = 0;
      let presentDays = 0;

      records.forEach((record) => {
        totalDays += record.attendance.length;
        presentDays += record.attendance.filter(
          (entry) => entry.morningEntry || entry.eveningEntry
        ).length;
      });

      return totalDays === 0 ? 0 : ((presentDays / totalDays) * 100).toFixed(2);
    };

    const avgStudentAttendance = getAvgAttendance(studentAttendance);
    const avgTeacherAttendance = getAvgAttendance(teacherAttendance);
    const avgStaffAttendance = getAvgAttendance(staffAttendance);

    // 5. Class-wise breakdown
    const classStats = {};
    students.forEach((student) => {
      if (!classStats[student.className]) {
        classStats[student.className] = {
          studentCount: 0,
          teacher:
            teachers.find((t) => t.className === student.className)?.name ||
            "Not Assigned",
        };
      }
      classStats[student.className].studentCount += 1;
    });

    // 6. Compose the final response
    const data = {
      institution: {
        principalName: institution.principalName,
        email: institution.email,
        contactNumber: institution.contactNumber,
        institutionName: institution.institutionName,
        institutionCode: institution.institutionCode,
        address: institution.address,
        classes: institution.classes,
        subscriptionStatus: institution.subscriptionStatus,
        subscriptionStartDate: institution.subscriptionStartDate,
        subscriptionEndDate: institution.subscriptionEndDate,
        allsubscriptions: institution.allsubscriptions,
        totalDevices: institution.deviceIds.length,
      },
      subscriptions: {
        currentStatus: institution.subscriptionStatus,
        currentStartDate: institution.subscriptionStartDate,
        currentEndDate: institution.subscriptionEndDate,
        previousRecords: institution.allsubscriptions,
      },
      students: {
        total: students.length,
        averageAttendance: avgStudentAttendance + "%",
        attendanceRecords: studentAttendance,
      },
      teachers: {
        total: teachers.length,
        averageAttendance: avgTeacherAttendance + "%",
        attendanceRecords: teacherAttendance,
      },
      staff: {
        total: staff.length,
        averageAttendance: avgStaffAttendance + "%",
        attendanceRecords: staffAttendance,
      },
      classWiseStats: classStats,
    };

    console.log(data);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching institution data:", error);
    res.status(500).json({ message: "Server Overloaded" });
  }
});

// POST /api/change-password
router.post("/change-password", async (req, res) => {
  // const { institutionCode } = req.user;
  const { currentPassword, newPassword } = req.body;
  const user = await Admin.findOne({ name: req.user.name });
  //console.log(currentPassword, newPassword);
  // user.password =

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Both fields are required." });
  }

  try {
    // Validate current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    //console.log(isMatch, "Success");
    if (!isMatch) {
      return res.status(401).json({ error: "Current password is incorrect." });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the password
    institution.password = hashedNewPassword;
    await institution.save();
    //console.log("Success");

    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

router.get("/home", async (req, res) => {
  const today = new Date().toISOString().split("T")[0];

  try {
    // Fetch the institution to get class list
    const institutions = await Institution.find({});
    const pending = await ServiceRequest.countDocuments({});
    const institution = institutions.length;
    const totalDevices = institutions.reduce((acc, ist) => {
      return acc + (ist.deviceIds?.length || 0);
    }, 0);

    // Count total students in this institution
    const totalStudents = await Student.countDocuments({});

    // Count total teachers in this institution
    const totalTeachers = await Teacher.countDocuments({});

    // Fetch all student attendance records for today
    const attendances = await Attendance.find({
      role: "student",
      "attendance.date": today,
    });

    // Filter students who are present (either morning or evening entry)
    const presentToday = attendances.filter((record) =>
      record.attendance.some(
        (entry) =>
          entry.date === today &&
          (entry.morningEntry !== null || entry.eveningEntry !== null)
      )
    );

    // Calculate percentage
    const attendancePercentage =
      totalStudents > 0
        ? `${((presentToday.length / totalStudents) * 100).toFixed(1)}%`
        : "0.0%";

    res.json({
      totalStudents,
      totalTeachers,
      totalDevices,
      pending,
      institution,
      attendancePercentage,
    });
  } catch (error) {
    console.error("Error in /home:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /admin/assign-device
router.post("/assign-device", async (req, res) => {
  const { institutionCode, deviceId } = req.body;
  //console.log("Assign Device Request:", req.body);
  //console.log("Institution Code:", institutionCode);
  //console.log("Device ID:", deviceId);
  try {
    const institution = await Institution.findOne({ institutionCode });
    if (!institution)
      return res.status(404).json({ message: "Institution not found" });

    // Prevent duplicate
    if (institution.deviceIds.includes(deviceId)) {
      return res
        .status(400)
        .json({ message: "Device already assigned to this institution" });
    }

    institution.deviceIds.push(deviceId);
    await institution.save();

    res.json({ message: `Device ${deviceId} assigned successfully.` });
  } catch (err) {
    console.error("Assign error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST - Change password (institution must be authenticated)
router.post("/changepassword", async (req, res) => {
  // //console.log("Change Password Request:", req.body);
  const { institutionCode, currentPassword, newPassword } = req.body;
  //console.log(institutionCode, currentPassword, newPassword);

  try {
    // const institution = await Institution.findById(institutionCode);
    const institution = await Institution.findOne({ institutionCode });

    if (!institution) {
      return res.status(404).json({ message: "Institution not found." });
    }

    // Compare current password with hashed password
    const isMatch = await bcrypt.compare(currentPassword, institution.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect current password." });
    }

    // Hash and update to new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    institution.password = hashedNewPassword;
    await institution.save();

    res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    console.error("Password Change Error:", error);
    res.status(500).json({ message: "Server error. Try again later." });
  }
});

// Delete school
router.delete("/:id", async (req, res) => {
  try {
    await Institution.findByIdAndDelete(req.params.id);
    res.json({ message: "Institution deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /admin/institutions/activate/:code
// router.patch("/:code", async (req, res) => {
//   const { code } = req.params;

//   try {
//     const institution = await Institution.findOne({ institutionCode: code });

//     if (!institution) {
//       return res.status(404).json({ error: "Institution not found" });
//     }

//     // Update subscription details
//     const now = new Date();
//     const nextYear = new Date();
//     nextYear.setFullYear(now.getFullYear() + 1); // One-year subscription

//     institution.subscriptionStatus = "Active";
//     institution.subscriptionStartDate = now;
//     institution.subscriptionEndDate = nextYear;

//     await institution.save();

//     res.json({
//       message: `Subscription activated successfully valid till ${nextYear}`,
//     });
//   } catch (error) {
//     console.error("Activation error:", error);
//     res
//       .status(500)
//       .json({ error: "Server error while activating subscription" });
//   }
// });

// Convert Date to IST string
function toISTString(date = new Date()) {
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour12: true,
  });
}

// Convert Date to IST Date object
function toISTDate(date = new Date()) {
  return new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
}

// PATCH /admin/institutions/:code
router.patch("/:code", async (req, res) => {
  const { code } = req.params;

  try {
    const institution = await Institution.findOne({ institutionCode: code });

    if (!institution) {
      return res.status(404).json({ error: "Institution not found" });
    }

    const nowIST = toISTDate(); // For calculations
    const nextYearIST = new Date(nowIST);
    nextYearIST.setFullYear(nowIST.getFullYear() + 1);

    // Format them for storage
    const formattedStart = toISTString(nowIST);
    const formattedEnd = toISTString(nextYearIST);

    // Update subscription
    institution.subscriptionStatus = "Active";
    institution.subscriptionStartDate = formattedStart;
    institution.subscriptionEndDate = formattedEnd;

    // Append to allsubscriptions
    const subscribedEntry = {
      subscribedDate: formattedStart,
    };

    if (!institution.allsubscriptions) {
      institution.allsubscriptions = [subscribedEntry];
    } else {
      institution.allsubscriptions.push(subscribedEntry);
    }

    await institution.save();

    res.json({
      message: `Subscription activated successfully, valid till ${formattedEnd}`,
    });
  } catch (error) {
    console.error("Activation error:", error);
    res
      .status(500)
      .json({ error: "Server error while activating subscription" });
  }
});

module.exports = router;
