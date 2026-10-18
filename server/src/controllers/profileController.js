import { query } from '../config/db.js';

export const getFreelancers = async (req, res, next) => {
  try {
    const { search, experience, minRate, maxRate, availability, sort = 'rating_desc' } = req.query;

    let sql = `
      SELECT 
        u.id,
        u.name,
        u.name AS full_name,
        u.email,
        'freelancer' AS role,
        u.bio,
        u.avatar_url,
        fp.id AS profile_id,
        fp.title,
        fp.hourly_rate,
        fp.experience_years,
        fp.experience_level,
        fp.location,
        LOWER(fp.availability_status) AS availability_status,
        fp.response_time_minutes,
        fp.projects_completed,
        fp.success_rate,
        fp.average_rating AS rating,
        u.created_at,
        COALESCE(
          array_agg(s.name) FILTER (WHERE s.name IS NOT NULL),
          '{}'
        ) AS skills
      FROM users u
      JOIN freelancer_profiles fp ON u.id = fp.user_id
      LEFT JOIN freelancer_skills fs ON fp.id = fs.freelancer_id
      LEFT JOIN skills s ON fs.skill_id = s.id
      WHERE u.role = 'FREELANCER'
    `;
    const params = [];
    let paramIndex = 1;

    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      sql += ` AND (
        u.name ILIKE $${paramIndex} OR 
        fp.title ILIKE $${paramIndex} OR 
        u.bio ILIKE $${paramIndex}
      )`;
      params.push(searchTerm);
      paramIndex++;
    }

    if (experience && experience !== 'All') {
      sql += ` AND UPPER(fp.experience_level) = UPPER($${paramIndex})`;
      params.push(experience);
      paramIndex++;
    }

    if (availability && availability !== 'All') {
      sql += ` AND UPPER(fp.availability_status) = UPPER($${paramIndex})`;
      params.push(availability);
      paramIndex++;
    }

    if (minRate) {
      sql += ` AND fp.hourly_rate >= $${paramIndex}`;
      params.push(parseFloat(minRate));
      paramIndex++;
    }

    if (maxRate) {
      sql += ` AND fp.hourly_rate <= $${paramIndex}`;
      params.push(parseFloat(maxRate));
      paramIndex++;
    }

    sql += ` GROUP BY u.id, fp.id`;

    // Sorting
    switch (sort) {
      case 'rate_asc':
        sql += ` ORDER BY fp.hourly_rate ASC`;
        break;
      case 'rate_desc':
        sql += ` ORDER BY fp.hourly_rate DESC`;
        break;
      case 'projects_desc':
        sql += ` ORDER BY fp.projects_completed DESC`;
        break;
      case 'rating_desc':
      default:
        sql += ` ORDER BY fp.average_rating DESC, fp.projects_completed DESC`;
        break;
    }

    const result = await query(sql, params);
    res.json({
      success: true,
      count: result.rows.length,
      freelancers: result.rows
    });
  } catch (error) {
    next(error);
  }
};

export const getClients = async (req, res, next) => {
  try {
    const sql = `
      SELECT 
        u.id,
        u.name,
        u.name AS full_name,
        u.email,
        'client' AS role,
        u.bio,
        u.avatar_url,
        cp.id AS profile_id,
        cp.company_name AS title,
        cp.company_name,
        cp.company_location AS location,
        cp.company_description,
        cp.website,
        u.created_at,
        5.0 AS rating,
        COUNT(p.id)::int AS total_projects_posted
      FROM users u
      JOIN client_profiles cp ON u.id = cp.user_id
      LEFT JOIN projects p ON cp.id = p.client_id
      WHERE u.role = 'CLIENT'
      GROUP BY u.id, cp.id
      ORDER BY total_projects_posted DESC, u.created_at DESC;
    `;
    const result = await query(sql);
    res.json({
      success: true,
      count: result.rows.length,
      clients: result.rows
    });
  } catch (error) {
    next(error);
  }
};

export const getProfileById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const userRes = await query(
      `SELECT u.*, 
              fp.id AS fp_id, fp.title AS fp_title, fp.hourly_rate, fp.experience_years, 
              fp.experience_level, fp.location AS fp_location, fp.availability_status, 
              fp.response_time_minutes, fp.projects_completed, fp.success_rate, fp.average_rating,
              cp.id AS cp_id, cp.company_name, cp.company_location, cp.company_description, cp.website
       FROM users u
       LEFT JOIN freelancer_profiles fp ON u.id = fp.user_id
       LEFT JOIN client_profiles cp ON u.id = cp.user_id
       WHERE u.id = $1 OR fp.id = $1 OR cp.id = $1;`,
      [id]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found.'
      });
    }

    const row = userRes.rows[0];
    const isFreelancer = row.role === 'FREELANCER';
    const profileId = isFreelancer ? row.fp_id : row.cp_id;

    // Fetch skills
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

    // Fetch portfolio projects
    let portfolio = [];
    if (isFreelancer && profileId) {
      const pRes = await query(
        `SELECT id, title, description, project_url, image_url, created_at 
         FROM portfolio_projects 
         WHERE freelancer_id = $1 
         ORDER BY created_at DESC`,
        [profileId]
      );
      portfolio = pRes.rows;
    }

    // Fetch reviews
    let reviews = [];
    if (isFreelancer && profileId) {
      const rRes = await query(
        `SELECT r.id, r.rating, r.comment, r.created_at,
                cu.id AS client_id, cu.name AS client_name, cu.avatar_url AS client_avatar,
                p.title AS project_title
         FROM reviews r
         JOIN client_profiles cp ON r.client_id = cp.id
         JOIN users cu ON cp.user_id = cu.id
         LEFT JOIN contracts c ON r.contract_id = c.id
         LEFT JOIN projects p ON c.project_id = p.id
         WHERE r.freelancer_id = $1
         ORDER BY r.created_at DESC`,
        [profileId]
      );
      reviews = rRes.rows;
    }

    // Fetch client posted projects
    let projects = [];
    if (!isFreelancer && profileId) {
      const projRes = await query(
        `SELECT id, title, description, category, budget_min, budget_max, 
                budget_type, deadline, status, created_at 
         FROM projects 
         WHERE client_id = $1 
         ORDER BY created_at DESC`,
        [profileId]
      );
      projects = projRes.rows;
    }

    const profile = {
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
      portfolio,
      reviews,
      projects
    };

    res.json({
      success: true,
      profile
    });
  } catch (error) {
    next(error);
  }
};

export const updateMyProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      full_name,
      name,
      title,
      bio,
      hourly_rate,
      experience_level,
      experience_years,
      response_time_minutes,
      location,
      skills,
      gender,
      age,
      availability_status,
      avatar_url,
      company_name,
      company_location,
      company_description,
      website
    } = req.body;

    const userName = name || full_name;

    // 1. Update users table
    await query(
      `UPDATE users
       SET name = COALESCE($1, name),
           bio = COALESCE($2, bio),
           gender = COALESCE($3, gender),
           age = COALESCE($4, age),
           avatar_url = COALESCE($5, avatar_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6;`,
      [
        userName ? userName.trim() : null,
        bio !== undefined ? bio.trim() : null,
        gender || null,
        age !== undefined && age !== '' ? parseInt(age) : null,
        avatar_url !== undefined ? avatar_url.trim() : null,
        userId
      ]
    );

    // Check role
    const userCheck = await query('SELECT role FROM users WHERE id = $1', [userId]);
    const role = (userCheck.rows[0]?.role || '').toUpperCase();

    if (role === 'FREELANCER') {
      const fpCheck = await query('SELECT id FROM freelancer_profiles WHERE user_id = $1', [userId]);
      let fpId = fpCheck.rows[0]?.id;

      if (!fpId) {
        const newFp = await query(
          'INSERT INTO freelancer_profiles (user_id, title) VALUES ($1, $2) RETURNING id',
          [userId, title || 'Freelance Specialist']
        );
        fpId = newFp.rows[0].id;
      }

      await query(
        `UPDATE freelancer_profiles
         SET title = COALESCE($1, title),
             hourly_rate = COALESCE($2, hourly_rate),
             experience_level = COALESCE($3, experience_level),
             experience_years = COALESCE($4, experience_years),
             location = COALESCE($5, location),
             availability_status = COALESCE($6, availability_status),
             response_time_minutes = COALESCE($7, response_time_minutes),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $8;`,
        [
          title !== undefined ? title.trim() : null,
          hourly_rate !== undefined && hourly_rate !== '' ? parseFloat(hourly_rate) : null,
          experience_level ? experience_level.toUpperCase() : null,
          experience_years !== undefined && experience_years !== '' ? parseInt(experience_years) : null,
          location !== undefined ? location.trim() : null,
          availability_status ? availability_status.toUpperCase() : null,
          response_time_minutes !== undefined && response_time_minutes !== '' ? parseInt(response_time_minutes) : null,
          fpId
        ]
      );

      // Update skills
      if (Array.isArray(skills)) {
        await query('DELETE FROM freelancer_skills WHERE freelancer_id = $1', [fpId]);
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
              [fpId, sId]
            );
          }
        }
      }
    } else {
      const cpCheck = await query('SELECT id FROM client_profiles WHERE user_id = $1', [userId]);
      let cpId = cpCheck.rows[0]?.id;

      if (!cpId) {
        const newCp = await query(
          'INSERT INTO client_profiles (user_id, company_name) VALUES ($1, $2) RETURNING id',
          [userId, company_name || title || 'Company']
        );
        cpId = newCp.rows[0].id;
      }

      const compLoc = company_location !== undefined ? company_location : location;
      const compDesc = company_description !== undefined ? company_description : bio;

      await query(
        `UPDATE client_profiles
         SET company_name = COALESCE($1, company_name),
             company_location = COALESCE($2, company_location),
             company_description = COALESCE($3, company_description),
             website = COALESCE($4, website),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $5;`,
        [
          company_name !== undefined ? company_name.trim() : (title ? title.trim() : null),
          compLoc !== undefined ? compLoc.trim() : null,
          compDesc !== undefined ? compDesc.trim() : null,
          website !== undefined ? website.trim() : null,
          cpId
        ]
      );
    }

    // Query refreshed user payload to return to client
    const userRes = await query(
      `SELECT u.*, 
              fp.id AS fp_id, fp.title AS fp_title, fp.hourly_rate, fp.experience_years, 
              fp.experience_level, fp.location AS fp_location, fp.availability_status, 
              fp.response_time_minutes, fp.projects_completed, fp.success_rate, fp.average_rating,
              cp.id AS cp_id, cp.company_name, cp.company_location, cp.company_description, cp.website
       FROM users u
       LEFT JOIN freelancer_profiles fp ON u.id = fp.user_id
       LEFT JOIN client_profiles cp ON u.id = cp.user_id
       WHERE u.id = $1;`,
      [userId]
    );

    const row = userRes.rows[0];
    const isFreelancer = row.role === 'FREELANCER';
    const profileId = isFreelancer ? row.fp_id : row.cp_id;

    let skillsList = [];
    if (isFreelancer && profileId) {
      const sRes = await query(
        `SELECT s.name 
         FROM freelancer_skills fs 
         JOIN skills s ON fs.skill_id = s.id 
         WHERE fs.freelancer_id = $1`,
        [profileId]
      );
      skillsList = sRes.rows.map(r => r.name);
    }

    const updatedUserPayload = {
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
      response_time_minutes: row.response_time_minutes || 60,
      projects_completed: row.projects_completed || 0,
      success_rate: row.success_rate || 100,
      rating: row.average_rating || 0,
      skills: skillsList,
      company_name: row.company_name,
      website: row.website
    };

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: updatedUserPayload
    });
  } catch (error) {
    next(error);
  }
};
