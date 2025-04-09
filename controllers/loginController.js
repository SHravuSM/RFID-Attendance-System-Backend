const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Institution = require("../models/Institution");
const Teacher = require("../models/Teacher");

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in the environment variables.");
}

const login = async (req, res) => {
  const { Id, password } = req.body;

  if (!Id || !password) {
    return res.status(400).json({ message: "ID and password are required." });
  }

  try {
    // 🔍 Check Admin
    let user = await Admin.findOne({ username: Id });
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(401).json({ message: "Invalid password." });

      const token = jwt.sign(
        { id: user._id, role: user.role, username: user.username },
        JWT_SECRET,
        { expiresIn: "1d" }
      );
      return res.json({ token });
    }

    // 🏫 Check Institution
    user = await Institution.findOne({ institutionCode: Id });
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(401).json({ message: "Invalid password." });

      const token = jwt.sign(
        {
          id: user._id,
          role: "institution",
          institutionCode: user.institutionCode,
          institutionName: user.institutionName,
        },
        JWT_SECRET,
        { expiresIn: "1d" }
      );

      return res.json({ token, role: "institution" });
    }

    // 👩‍🏫 Check Teacher
    user = await Teacher.findOne({ name: Id });
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(401).json({ message: "Invalid password." });

      const token = jwt.sign(
        {
          id: user._id,
          role: "teacher",
          name: user.name,
          institutionCode: user.institutionCode,
        },
        JWT_SECRET,
        { expiresIn: "1d" }
      );

      return res.json({
        token,
        role: "teacher",
        name: user.name,
      });
    }

    // ❌ No user found
    return res.status(404).json({ message: "User not found." });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = login;
