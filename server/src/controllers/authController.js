import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

const JWT_SECRET = process.env.JWT_SECRET || "freelancer_jwt_secret_key_default_2026";
const JWT_EXPIRES_IN = "7d";

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export async function register(req, res, next) {
  try {
    const { email, password, role, fullName } = req.body;

    if (!email || !password || !fullName || !role) {
      return res.status(400).json({
        success: false,
        message: "Email, password, full name, and role are required.",
      });
    }

    if (!["client", "freelancer"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be either 'client' or 'freelancer'.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    // Check if user already exists
    const existing = await pool.query(
      "SELECT id FROM profiles WHERE LOWER(email) = LOWER($1);",
      [email.trim()]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user profile
    const result = await pool.query(
      `INSERT INTO profiles (email, password_hash, role, full_name)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, role, full_name, created_at;`,
      [email.trim().toLowerCase(), passwordHash, role, fullName.trim()]
    );

    const newUser = result.rows[0];
    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        full_name: newUser.full_name,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const result = await pool.query(
      `SELECT id, email, password_hash, role, full_name, title, avatar_url, location
       FROM profiles
       WHERE LOWER(email) = LOWER($1);`,
      [email.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: "Logged in successfully.",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
        title: user.title,
        avatar_url: user.avatar_url,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT id, email, role, full_name, title, bio, hourly_rate, experience_level,
              location, skills, category, gender, rating, success_rate, projects_completed,
              availability_status, avatar_url, created_at, updated_at
       FROM profiles
       WHERE id = $1;`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User profile not found.",
      });
    }

    res.json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}
