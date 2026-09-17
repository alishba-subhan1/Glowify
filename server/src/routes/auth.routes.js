const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Admin = require("../models/Admin");
const { jwtSecret } = require("../config");
const { requireAuth } = require("../middleware/auth");
const { isValidEmail, normalizeEmail } = require("../utils/validators");

const router = express.Router();

function signAuthToken({ id, email, role, name }) {
  return jwt.sign({ id, email, role, name }, jwtSecret, { expiresIn: "7d" });
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone = "", profileImage = "" } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const normalizedEmail = normalizeEmail(email);
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: passwordHash,
      phone: String(phone).trim(),
      profileImage: String(profileImage || "").trim(),
      role: "user"
    });

    const token = signAuthToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name
    });

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Registration failed", error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const normalizedEmail = normalizeEmail(email);
    let user = await User.findOne({ email: normalizedEmail });
    if (user) {
      const passwordOk = await bcrypt.compare(password, user.password);
      if (!passwordOk) return res.status(401).json({ message: "Invalid credentials" });

      const token = signAuthToken({
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name
      });
      const payload = {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          profileImage: user.profileImage
        }
      };
      if (user.role === "admin") payload.admin = { id: user._id, email: user.email, name: user.name };
      return res.json(payload);
    }

    // Backward compatibility for existing Admin collection.
    const admin = await Admin.findOne({ email: normalizedEmail });
    if (!admin) return res.status(401).json({ message: "Invalid credentials" });
    const passwordOk = await bcrypt.compare(password, admin.passwordHash);
    if (!passwordOk) return res.status(401).json({ message: "Invalid credentials" });

    const token = signAuthToken({
      id: admin._id.toString(),
      email: admin.email,
      role: "admin",
      name: admin.name
    });

    return res.json({
      token,
      user: { id: admin._id, email: admin.email, name: admin.name, role: "admin" },
      admin: { id: admin._id, email: admin.email, name: admin.name }
    });
  } catch (error) {
    return res.status(500).json({ message: "Login failed", error: error.message });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  return res.json({ user: req.user });
});

module.exports = router;
