const express = require("express");
const Student = require("../models/Student");
const router = express.Router();
const Institution = require("../models/Institution");

/**
 * 📌 GET all students
 */

router.get("/", async (req, res) => {
  const { institutionCode } = req.user;

  if (!institutionCode) {
    return res.status(400).json({ error: "Institution code is required." });
  }

  try {
    const students = await Student.find({ institutionCode });

    const institution = await Institution.findOne({ institutionCode });

    res.json({
      students: students,
      classes: institution.classes,
    });
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/classnames", async (req, res) => {
  const { institutionCode } = req.user;

  try {
    const institution = await Institution.findOne({ institutionCode });
    if (!institution) {
      return res.status(404).json({ error: "Institution not found." });
    }

    // Extract only class names from the objects
    const classNames = institution.classes.map((cls) => cls.className);
    return res.json({ classes: classNames });
  } catch (error) {
    console.error("Error fetching class info:", error);
    return res.status(500).json({ error: "Server error." });
  }
});

//  * 📌 DELETE a student by ID
router.delete("/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error.message);
    res.status(500).json({ error: "Server Error" });
  }
});

/**
 * 📌 PROMOTE a student (increase class level)
 */
// router.patch("/:id/promote", async (req, res) => {
//   try {
//     const student = await Student.findById(req.params.id);
//     if (!student) {
//       return res.status(404).json({ error: "Student not found" });
//     }

//     let classNumber = parseInt(student.className.replace(/\D/g, ""), 10) + 1;
//     student.className = String(classNumber);
//     await student.save();

//     res.json({ message: "Student promoted", student });
//   } catch (error) {
//     console.error("Error promoting student:", error.message);
//     res.status(500).json({ error: "Server Error" });
//   }
// });

/**
 * 📌 DEPROMOTE a student (decrease class level)
 */
// router.patch("/:id/depromote", async (req, res) => {
//   try {
//     const student = await Student.findById(req.params.id);
//     if (!student) {
//       return res.status(404).json({ error: "Student not found" });
//     }

//     let classNumber = parseInt(student.className.replace(/\D/g, ""), 10);

//     if (classNumber > 1) {
//       student.className = String(classNumber - 1);
//       await student.save();
//       res.json({ message: "Student depromoted", student });
//     } else {
//       res.status(400).json({ error: "Cannot depromote below Class 1" });
//     }
//   } catch (error) {
//     console.error("Error depromoting student:", error.message);
//     res.status(500).json({ error: "Server Error" });
//   }
// });

module.exports = router;
