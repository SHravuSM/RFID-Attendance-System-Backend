const express = require("express");
const Student = require("../models/Student");
const router = express.Router();

// 📌 GET all students
router.get("/", async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

// router.delete("/:id", async (req, res) => {
//   try {
//     const student = await Student.findByIdAndDelete(req.params.id);
//     if (!student) return res.status(404).json({ error: "Student not found" });
//     res.json({ message: "Student deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ error: "Server Error" });
//   }
// });

// 📌 Promote student (Increase class)
router.patch("/:id/promote", async (req, res) => {
  try {
    // console.log(req.params.id);
    const student = await Student.findById(req.params.id);
    // console.log(student);
    if (!student) return res.status(404).json({ error: "Student not found" });
    // console.log(student);
    let classNumber = parseInt(student.className.replace(/\D/g, "")) + 1;
    // console.log(student);
    student.className = String(classNumber);
    console.log(student);
    await student.save();
    console.log(student, "at afer");
    res.json({ message: "Student promoted", student });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

// 📌 Depromote student (Decrease class)
router.patch("/:id/depromote", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: "Student not found" });

    let classNumber = parseInt(student.className.replace(/\D/g, ""));
    console.log(student);
    if (classNumber > 1) {
      console.log(student);
      student.className = classNumber - 1;
      console.log(student);
      await student.save();
      res.json({ message: "Student depromoted", student });
    } else {
      res.status(400).json({ error: "Cannot depromote below Class 1" });
    }
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;
