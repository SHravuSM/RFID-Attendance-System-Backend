const express = require("express");
const router = express.Router();
const Institution = require("../models/Institution");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Attendance = require("../models/Attendance");

router.get("/", async (req, res) => {
  const { institutionCode } = req.user;
  if (!institutionCode) {
    return res.status(400).json({ error: "Institution code is required." });
  }

  try {
    const institution = await Institution.findOne({ institutionCode });
    if (!institution) {
      return res.status(404).json({ error: "Institution not found." });
    }

    cons;

    const today = new Date().toISOString().split("T")[0];
    const classInfo = await Promise.all(
      institution.classes.map(async (cls) => {
        const { className, _id } = cls;

        // 1. Total students
        const totalStudents = await Student.countDocuments({
          className,
          institutionCode,
        });

        // 2. Assigned teacher
        const teacher = await Teacher.findOne({
          className,
          institutionCode,
        });

        // 3. Attendance records for today (only students)
        const attendances = await Attendance.find({
          institutionCode,
          role: "student",
          "attendance.date": today,
        });

        const presentToday = attendances
          .filter((record) =>
            record.attendance.some(
              (entry) =>
                entry.date === today &&
                (entry.morningEntry !== null || entry.eveningEntry !== null)
            )
          )
          .filter((r) => {
            // Filter those who belong to this class
            const studentMatch = r.rfid && cls.className;
            return studentMatch;
          });

        // Get actual students in the class today
        const studentRFIDs = await Student.find({
          className,
          institutionCode,
        }).select("rfid");

        const rfidSet = new Set(studentRFIDs.map((s) => s.rfid));
        const actuallyPresent = presentToday.filter((r) => rfidSet.has(r.rfid));

        const attendancePercentage =
          totalStudents > 0
            ? ((actuallyPresent.length / totalStudents) * 100).toFixed(1)
            : "0.0";

        return {
          _id,
          className,
          totalStudents,
          teacher: teacher ? teacher.name : "Not Assigned",
          attendancePercentage,
        };
      })
    );

    return res.json(classInfo);
  } catch (error) {
    console.error("Error fetching class info:", error);
    return res.status(500).json({ error: "Server error." });
  }
});

router.get("/classnames", async (req, res) => {
  const { institutionCode } = req.user;

  const institution = await Institution.findOne({ institutionCode });
  if (!institution) {
    return res.status(404).json({ error: "Institution not found" });
  }

  // Get all students of the institution
  const allStudents = await Student.find({ institutionCode });

  // Get only attendance records of students in this institution
  const attendanceRecords = await Attendance.find({
    institutionCode,
    role: "student",
  });

  const result = institution.classes.map((className) => {
    // Filter students of current class
    const classStudents = allStudents.filter(
      (student) => student.className === className
    );

    const studentCount = classStudents.length;

    // Filter attendance records for students in this class
    const classAttendance = attendanceRecords.filter((record) =>
      classStudents.some((s) => s.rfid === record.rfid)
    );

    // Calculate average attendance
    let totalPercentage = 0;
    let validCount = 0;

    classAttendance.forEach((studentRecord) => {
      const totalDays = studentRecord.attendance.length;

      const presentDays = studentRecord.attendance.filter(
        (day) => day.morningEntry || day.eveningEntry
      ).length;

      if (totalDays > 0) {
        const percentage = (presentDays / totalDays) * 100;
        totalPercentage += percentage;
        validCount++;
      }
    });

    const averageAttendance =
      validCount > 0 ? (totalPercentage / validCount).toFixed(2) : "N/A";

    return {
      className,
      studentCount,
      averageAttendance: `${averageAttendance}%`,
    };
  });

  return res.json(result);
});

router.post("/add", async (req, res) => {
  try {
    const className = req.body.className?.trim();

    if (!className) {
      return res.status(400).json({ error: "Class name is required" });
    }

    // Fetch the institution based on the authenticated user's institutionCode
    const institution = await Institution.findOne({
      institutionCode: req.user.institutionCode,
    });

    if (!institution) {
      return res.status(404).json({ error: "Institution not found" });
    }

    // Check if class already exists (case-insensitive)
    // const alreadyExists = institution.classes.some(
    //   (cls) => cls.className == className
    // );

    // if (alreadyExists) {
    //   return res.status(409).json({ error: "Class already exists" });
    // }

    // Push the class object — MongoDB will auto-generate the `_id`
    institution.classes.push(className);
    //console.log(institution.classes);
    await institution.save();

    res.status(201).json({
      message: "Class added successfully",
      classes: institution.classes,
    });
  } catch (err) {
    console.error("Error adding class:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/delete/:className", async (req, res) => {
  try {
    const className = req.params.className;

    const updatedInstitution = await Institution.findOneAndUpdate(
      { institutionCode: req.user.institutionCode },
      {
        $pull: { classes: className }, // Remove the class string
      },
      { new: true } // Return the updated institution document
    );

    if (!updatedInstitution) {
      return res.status(404).json({ message: "Institution not found" });
    }

    res.json({
      message: "Class deleted successfully",
      classes: updatedInstitution.classes,
    });
  } catch (err) {
    console.error("Error deleting class:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
