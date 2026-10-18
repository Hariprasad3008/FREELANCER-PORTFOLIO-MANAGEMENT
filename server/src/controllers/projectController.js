import { query } from '../config/db.js';

export const getProjects = async (req, res, next) => {
  try {
    const { search, category, budgetType, minBudget, maxBudget, status, sort = 'newest', clientId } = req.query;

    let sql = `
      SELECT 
        p.id,
        p.client_id,
        p.title,
        p.description,
        p.category,
        p.budget_min,
        p.budget_max,
        p.budget_type,
        p.deadline,
        p.status,
        p.created_at,
        p.updated_at,
        u.name AS client_name,
        u.avatar_url AS client_avatar,
        u.id AS client_user_id,
        cp.company_name,
        cp.company_location AS client_location,
        5.0 AS client_rating,
        COALESCE(
          array_agg(s.name) FILTER (WHERE s.name IS NOT NULL),
          '{}'
        ) AS required_skills,
        (SELECT COUNT(*)::int FROM proposals prop WHERE prop.project_id = p.id) AS proposals_count
      FROM projects p
      JOIN client_profiles cp ON p.client_id = cp.id
      JOIN users u ON cp.user_id = u.id
      LEFT JOIN project_skills ps ON p.id = ps.project_id
      LEFT JOIN skills s ON ps.skill_id = s.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      sql += ` AND (
        p.title ILIKE $${paramIndex} OR 
        p.description ILIKE $${paramIndex}
      )`;
      params.push(searchTerm);
      paramIndex++;
    }

    if (category && category !== 'All') {
      sql += ` AND p.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (budgetType && budgetType !== 'All') {
      sql += ` AND UPPER(p.budget_type) = UPPER($${paramIndex})`;
      params.push(budgetType);
      paramIndex++;
    }

    if (status && status !== 'All') {
      sql += ` AND UPPER(p.status) = UPPER($${paramIndex})`;
      params.push(status);
      paramIndex++;
    }

    if (minBudget) {
      sql += ` AND (p.budget_max >= $${paramIndex} OR p.budget_min >= $${paramIndex})`;
      params.push(parseFloat(minBudget));
      paramIndex++;
    }

    if (maxBudget) {
      sql += ` AND (p.budget_min <= $${paramIndex} OR p.budget_max <= $${paramIndex})`;
      params.push(parseFloat(maxBudget));
      paramIndex++;
    }

    if (clientId) {
      sql += ` AND (p.client_id = $${paramIndex} OR u.id = $${paramIndex})`;
      params.push(clientId);
      paramIndex++;
    }

    sql += ` GROUP BY p.id, cp.id, u.id`;

    switch (sort) {
      case 'budget_desc':
        sql += ` ORDER BY p.budget_max DESC NULLS LAST, p.budget_min DESC`;
        break;
      case 'budget_asc':
        sql += ` ORDER BY p.budget_min ASC NULLS LAST, p.budget_max ASC`;
        break;
      case 'deadline_soon':
        sql += ` ORDER BY p.deadline ASC NULLS LAST`;
        break;
      case 'newest':
      default:
        sql += ` ORDER BY p.created_at DESC`;
        break;
    }

    const result = await query(sql, params);
    res.json({
      success: true,
      count: result.rows.length,
      projects: result.rows
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT 
        p.id,
        p.client_id,
        p.title,
        p.description,
        p.category,
        p.budget_min,
        p.budget_max,
        p.budget_type,
        p.deadline,
        p.status,
        p.created_at,
        p.updated_at,
        u.name AS client_name,
        u.avatar_url AS client_avatar,
        u.id AS client_user_id,
        u.email AS client_email,
        u.bio AS client_bio,
        cp.company_name,
        cp.company_location AS client_location,
        5.0 AS client_rating,
        COALESCE(
          array_agg(s.name) FILTER (WHERE s.name IS NOT NULL),
          '{}'
        ) AS required_skills,
        (SELECT COUNT(*)::int FROM proposals prop WHERE prop.project_id = p.id) AS proposals_count
      FROM projects p
      JOIN client_profiles cp ON p.client_id = cp.id
      JOIN users u ON cp.user_id = u.id
      LEFT JOIN project_skills ps ON p.id = ps.project_id
      LEFT JOIN skills s ON ps.skill_id = s.id
      WHERE p.id = $1
      GROUP BY p.id, cp.id, u.id;
    `;
    const result = await query(sql, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.'
      });
    }

    res.json({
      success: true,
      project: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      title,
      description,
      category = 'Web Development',
      budget_min,
      budget_max,
      budget_type = 'FIXED',
      required_skills = [],
      deadline
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide project title and description.'
      });
    }

    // Lookup client profile ID
    let cpRes = await query('SELECT id FROM client_profiles WHERE user_id = $1', [userId]);
    let clientId = cpRes.rows[0]?.id;

    if (!clientId) {
      // Auto-create client profile if missing
      const newCp = await query(
        'INSERT INTO client_profiles (user_id, company_name) VALUES ($1, $2) RETURNING id',
        [userId, 'Company']
      );
      clientId = newCp.rows[0].id;
    }

    const sql = `
      INSERT INTO projects (
        client_id, title, description, category, 
        budget_min, budget_max, budget_type, deadline, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'OPEN')
      RETURNING *;
    `;

    const result = await query(sql, [
      clientId,
      title.trim(),
      description.trim(),
      category,
      budget_min ? parseFloat(budget_min) : null,
      budget_max ? parseFloat(budget_max) : null,
      budget_type.toUpperCase(),
      deadline ? new Date(deadline) : null
    ]);

    const newProject = result.rows[0];

    // Link skills
    if (Array.isArray(required_skills) && required_skills.length > 0) {
      for (const sName of required_skills) {
        if (sName && sName.trim()) {
          let sRes = await query('SELECT id FROM skills WHERE LOWER(name) = LOWER($1)', [sName.trim()]);
          let sId = sRes.rows[0]?.id;
          if (!sId) {
            const newSkill = await query('INSERT INTO skills (name) VALUES ($1) RETURNING id', [sName.trim()]);
            sId = newSkill.rows[0].id;
          }
          await query(
            'INSERT INTO project_skills (project_id, skill_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [newProject.id, sId]
          );
        }
      }
    }

    res.status(201).json({
      success: true,
      message: 'Project posted successfully!',
      project: newProject
    });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check ownership
    const check = await query(
      `SELECT p.id, cp.user_id 
       FROM projects p 
       JOIN client_profiles cp ON p.client_id = cp.id 
       WHERE p.id = $1`,
      [id]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    if (String(check.rows[0].user_id) !== String(userId) && req.user.role?.toUpperCase() !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this project.' });
    }

    const {
      title,
      description,
      category,
      budget_min,
      budget_max,
      budget_type,
      required_skills,
      deadline,
      status
    } = req.body;

    const sql = `
      UPDATE projects
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          category = COALESCE($3, category),
          budget_min = COALESCE($4, budget_min),
          budget_max = COALESCE($5, budget_max),
          budget_type = COALESCE($6, budget_type),
          deadline = COALESCE($7, deadline),
          status = COALESCE($8, status),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *;
    `;

    const result = await query(sql, [
      title,
      description,
      category,
      budget_min !== undefined ? parseFloat(budget_min) : null,
      budget_max !== undefined ? parseFloat(budget_max) : null,
      budget_type ? budget_type.toUpperCase() : null,
      deadline ? new Date(deadline) : null,
      status ? status.toUpperCase() : null,
      id
    ]);

    // Update skills if provided
    if (Array.isArray(required_skills)) {
      await query('DELETE FROM project_skills WHERE project_id = $1', [id]);
      for (const sName of required_skills) {
        if (sName && sName.trim()) {
          let sRes = await query('SELECT id FROM skills WHERE LOWER(name) = LOWER($1)', [sName.trim()]);
          let sId = sRes.rows[0]?.id;
          if (!sId) {
            const newSkill = await query('INSERT INTO skills (name) VALUES ($1) RETURNING id', [sName.trim()]);
            sId = newSkill.rows[0].id;
          }
          await query(
            'INSERT INTO project_skills (project_id, skill_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [id, sId]
          );
        }
      }
    }

    res.json({
      success: true,
      message: 'Project updated successfully!',
      project: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const check = await query(
      `SELECT p.id, cp.user_id 
       FROM projects p 
       JOIN client_profiles cp ON p.client_id = cp.id 
       WHERE p.id = $1`,
      [id]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    if (String(check.rows[0].user_id) !== String(userId) && req.user.role?.toUpperCase() !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this project.' });
    }

    await query('DELETE FROM projects WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Project deleted successfully!'
    });
  } catch (error) {
    next(error);
  }
};

export const getMyProjects = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await query(
      `SELECT p.*,
              COALESCE(
                array_agg(s.name) FILTER (WHERE s.name IS NOT NULL),
                '{}'
              ) AS required_skills,
              (SELECT COUNT(*)::int FROM proposals prop WHERE prop.project_id = p.id) AS proposals_count
       FROM projects p
       JOIN client_profiles cp ON p.client_id = cp.id
       LEFT JOIN project_skills ps ON p.id = ps.project_id
       LEFT JOIN skills s ON ps.skill_id = s.id
       WHERE cp.user_id = $1
       GROUP BY p.id
       ORDER BY p.created_at DESC;`,
      [userId]
    );

    res.json({
      success: true,
      count: result.rows.length,
      projects: result.rows
    });
  } catch (error) {
    next(error);
  }
};
