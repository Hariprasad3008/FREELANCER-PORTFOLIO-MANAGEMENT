import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_freelancer_marketplace_2026_secure';
const JWT_EXPIRES_IN = '7d';

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      profile_id: user.profile_id
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

export const register = async (req, res, next) => {
  try {
    const {
      email,
      password,
      name,
      full_name,
      role = 'FREELANCER',
      title,
      bio,
      gender,
      age,
      location,
      hourly_rate,
      skills,
      avatar_url,
      company_name
    } = req.body;

    const userName = name || full_name;
    const normalizedRole = role.toUpperCase();

    if (!email || !password || !userName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password, and name.'
      });
    }

    if (!['CLIENT', 'FREELANCER'].includes(normalizedRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be either CLIENT or FREELANCER.'
      });
    }

    // Check existing email
    const existing = await query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=6366f1&color=fff`;
    const avatar = avatar_url || defaultAvatar;

    // 1. Insert into users
    const userRes = await query(
      `INSERT INTO users (name, email, password_hash, age, gender, role, bio, avatar_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, name, email, age, gender, role, bio, avatar_url, created_at;`,
      [
        userName.trim(),
        email.toLowerCase().trim(),
        passwordHash,
        age ? parseInt(age) : null,
        gender || null,
        normalizedRole,
        bio || '',
        avatar
      ]
    );

    const newUser = userRes.rows[0];
    let profileId = null;

    // 2. Insert Profile
    if (normalizedRole === 'FREELANCER') {
      const fpRes = await query(
        `INSERT INTO freelancer_profiles (
          user_id, title, hourly_rate, location, experience_level, availability_status
        ) VALUES ($1, $2, $3, $4, 'MID', 'AVAILABLE')
        RETURNING id;`,
        [
          newUser.id,
          title || 'Freelance Specialist',
          hourly_rate ? parseFloat(hourly_rate) : 0,
          location || 'Remote'
        ]
      );
      profileId = fpRes.rows[0].id;

      // Insert skills if provided
      if (Array.isArray(skills) && skills.length > 0) {
        for (const sName of skills) {
          if (sName && sName.trim()) {
            let sRes = await query('SELECT id FROM skills WHERE LOWER(name) = LOWER($1)', [sName.trim()]);
            let sId = sRes.rows[0]?.id;
            if (!sId) {
              const newSkill = await query('INSERT INTO skills (name) VALUES ($1) RETURNING id', [sName.trim()]);
              sId = newSkill.rows[0].id;
            }
            await query(
              'INSERT INTO freelancer_skills (freelancer_id, skill_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
              [profileId, sId]
            );
          }
        }
      }
    } else {
      const cpRes = await query(
        `INSERT INTO client_profiles (
          user_id, company_name, company_location, company_description
        ) VALUES ($1, $2, $3, $4)
        RETURNING id;`,
        [
          newUser.id,
          company_name || title || 'Hiring Client Company',
          location || 'Remote',
          bio || ''
        ]
      );
      profileId = cpRes.rows[0].id;
    }

    const payloadUser = {
      ...newUser,
      full_name: newUser.name,
      profile_id: profileId,
      role: newUser.role.toLowerCase()
    };

    const token = generateToken({ ...newUser, profile_id: profileId });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully!',
      token,
      user: payloadUser
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.'
      });
    }

    const userRes = await query(
      `SELECT u.*, 
              fp.id AS fp_id, fp.title AS fp_title, fp.hourly_rate, fp.experience_years, 
              fp.experience_level, fp.location AS fp_location, fp.availability_status, 
              fp.projects_completed, fp.success_rate, fp.average_rating,
              cp.id AS cp_id, cp.company_name, cp.company_location, cp.company_description, cp.website
       FROM users u
       LEFT JOIN freelancer_profiles fp ON u.id = fp.user_id
       LEFT JOIN client_profiles cp ON u.id = cp.user_id
       WHERE LOWER(u.email) = LOWER($1);`,
      [email.trim()]
    );

    if (userRes.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const row = userRes.rows[0];
    const isMatch = await bcrypt.compare(password, row.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isFreelancer = row.role === 'FREELANCER';
    const profileId = isFreelancer ? row.fp_id : row.cp_id;

    // Fetch skills if freelancer
    let skills = [];
    if (isFreelancer && profileId) {
      const sRes = await query(
        `SELECT s.name 
         FROM freelancer_skills fs 
         JOIN skills s ON fs.skill_id = s.id 
         WHERE fs.freelancer_id = $1`,
        [profileId]
      );
      skills = sRes.rows.map(r => r.name);
    }

    const userPayload = {
      id: row.id,
      email: row.email,
      name: row.name,
      full_name: row.name,
      role: row.role.toLowerCase(),
      bio: row.bio,
      avatar_url: row.avatar_url,
      age: row.age,
      gender: row.gender,
      profile_id: profileId,
      // Freelancer fields
      title: isFreelancer ? row.fp_title : row.company_name,
      hourly_rate: row.hourly_rate || 0,
      experience_years: row.experience_years,
      experience_level: row.experience_level,
      location: isFreelancer ? row.fp_location : row.company_location,
      availability_status: row.availability_status ? row.availability_status.toLowerCase() : 'available',
      projects_completed: row.projects_completed || 0,
      success_rate: row.success_rate || 100,
      rating: row.average_rating || 0,
      skills,
      // Client fields
      company_name: row.company_name,
      website: row.website
    };

    const token = generateToken({
      id: row.id,
      email: row.email,
      role: row.role,
      name: row.name,
      profile_id: profileId
    });

    res.json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: userPayload
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const userRes = await query(
      `SELECT u.*, 
              fp.id AS fp_id, fp.title AS fp_title, fp.hourly_rate, fp.experience_years, 
              fp.experience_level, fp.location AS fp_location, fp.availability_status, 
              fp.projects_completed, fp.success_rate, fp.average_rating,
              cp.id AS cp_id, cp.company_name, cp.company_location, cp.company_description, cp.website
       FROM users u
       LEFT JOIN freelancer_profiles fp ON u.id = fp.user_id
       LEFT JOIN client_profiles cp ON u.id = cp.user_id
       WHERE u.id = $1;`,
      [req.user.id]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.'
      });
    }

    const row = userRes.rows[0];
    const isFreelancer = row.role === 'FREELANCER';
    const profileId = isFreelancer ? row.fp_id : row.cp_id;

    let skills = [];
    if (isFreelancer && profileId) {
      const sRes = await query(
        `SELECT s.name 
         FROM freelancer_skills fs 
         JOIN skills s ON fs.skill_id = s.id 
         WHERE fs.freelancer_id = $1`,
        [profileId]
      );
      skills = sRes.rows.map(r => r.name);
    }

    const userPayload = {
      id: row.id,
      email: row.email,
      name: row.name,
      full_name: row.name,
      role: row.role.toLowerCase(),
      bio: row.bio,
      avatar_url: row.avatar_url,
      age: row.age,
      gender: row.gender,
      profile_id: profileId,
      title: isFreelancer ? row.fp_title : row.company_name,
      hourly_rate: row.hourly_rate || 0,
      experience_years: row.experience_years,
      experience_level: row.experience_level,
      location: isFreelancer ? row.fp_location : row.company_location,
      availability_status: row.availability_status ? row.availability_status.toLowerCase() : 'available',
      projects_completed: row.projects_completed || 0,
      success_rate: row.success_rate || 100,
      rating: row.average_rating || 0,
      skills,
      company_name: row.company_name,
      website: row.website
    };

    res.json({
      success: true,
      user: userPayload
    });
  } catch (error) {
    next(error);
  }
};
