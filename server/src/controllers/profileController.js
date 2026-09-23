import pool from "../config/db.js";

export async function getFreelancers(req, res, next) {
  try {
    const { search, experience, category, minRate, maxRate, limit = 50 } = req.query;

    let query = `
      SELECT id, full_name, title, location, hourly_rate, experience_level,
             success_rate, projects_completed, rating, skills, category, gender,
             availability_status, avatar_url, created_at
      FROM profiles
      WHERE role = 'freelancer'
    `;
    const params = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (full_name ILIKE $${paramIndex} OR title ILIKE $${paramIndex} OR bio ILIKE $${paramIndex} OR $${paramIndex + 1} = ANY(skills))`;
      params.push(`%${search}%`, search);
      paramIndex += 2;
    }

    if (experience && experience !== "any") {
      query += ` AND experience_level = $${paramIndex}`;
      params.push(experience);
      paramIndex++;
    }

    if (category) {
      query += ` AND category ILIKE $${paramIndex}`;
      params.push(`%${category}%`);
      paramIndex++;
    }

    if (minRate) {
      query += ` AND hourly_rate >= $${paramIndex}`;
      params.push(Number(minRate));
      paramIndex++;
    }

    if (maxRate) {
      query += ` AND hourly_rate <= $${paramIndex}`;
      params.push(Number(maxRate));
      paramIndex++;
    }

    query += ` ORDER BY rating DESC, projects_completed DESC LIMIT $${paramIndex};`;
    params.push(Number(limit));

    const result = await pool.query(query, params);
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
}

export async function getClients(req, res, next) {
  try {
    const { search, category, limit = 50 } = req.query;

    let query = `
      SELECT id, full_name, title, bio, location, category, avatar_url, created_at
      FROM profiles
      WHERE role = 'client'
    `;
    const params = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (full_name ILIKE $${paramIndex} OR bio ILIKE $${paramIndex} OR location ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (category) {
      query += ` AND category ILIKE $${paramIndex}`;
      params.push(`%${category}%`);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex};`;
    params.push(Number(limit));

    const result = await pool.query(query, params);
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProfileById(req, res, next) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id, email, role, full_name, title, bio, hourly_rate, experience_level,
              location, skills, category, gender, rating, success_rate, projects_completed,
              availability_status, avatar_url, created_at, updated_at
       FROM profiles
       WHERE id = $1;`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

export async function updateMyProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const {
      full_name,
      title,
      bio,
      hourly_rate,
      experience_level,
      location,
      skills,
      category,
      gender,
      availability_status,
      avatar_url,
    } = req.body;

    const result = await pool.query(
      `UPDATE profiles
       SET full_name = COALESCE($1, full_name),
           title = COALESCE($2, title),
           bio = COALESCE($3, bio),
           hourly_rate = COALESCE($4, hourly_rate),
           experience_level = COALESCE($5, experience_level),
           location = COALESCE($6, location),
           skills = COALESCE($7, skills),
           category = COALESCE($8, category),
           gender = COALESCE($9, gender),
           availability_status = COALESCE($10, availability_status),
           avatar_url = COALESCE($11, avatar_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $12
       RETURNING id, email, role, full_name, title, bio, hourly_rate, experience_level,
                 location, skills, category, gender, rating, success_rate, projects_completed,
                 availability_status, avatar_url, updated_at;`,
      [
        full_name,
        title,
        bio,
        hourly_rate !== undefined ? hourly_rate : null,
        experience_level,
        location,
        Array.isArray(skills) ? skills : null,
        category,
        gender,
        availability_status,
        avatar_url,
        userId,
      ]
    );

    res.json({
      success: true,
      message: "Profile updated successfully.",
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}
