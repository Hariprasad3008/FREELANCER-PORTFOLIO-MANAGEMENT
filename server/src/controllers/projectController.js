import pool from "../config/db.js";

export async function getAllProjects(req, res, next) {
  try {
    const { search, category, status = "open", minBudget, maxBudget, limit = 50 } = req.query;

    let query = `
      SELECT p.id, p.title, p.description, p.category, p.budget_min, p.budget_max,
             p.budget_type, p.required_skills, p.deadline, p.status, p.created_at,
             p.client_id,
             json_build_object(
               'id', c.id,
               'full_name', c.full_name,
               'title', c.title,
               'location', c.location,
               'category', c.category,
               'avatar_url', c.avatar_url
             ) AS client
      FROM projects p
      JOIN profiles c ON p.client_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (status && status !== "all") {
      query += ` AND p.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (search) {
      query += ` AND (p.title ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex} OR $${paramIndex + 1} = ANY(p.required_skills))`;
      params.push(`%${search}%`, search);
      paramIndex += 2;
    }

    if (category) {
      query += ` AND p.category ILIKE $${paramIndex}`;
      params.push(`%${category}%`);
      paramIndex++;
    }

    if (minBudget) {
      query += ` AND p.budget_min >= $${paramIndex}`;
      params.push(Number(minBudget));
      paramIndex++;
    }

    if (maxBudget) {
      query += ` AND p.budget_max <= $${paramIndex}`;
      params.push(Number(maxBudget));
      paramIndex++;
    }

    query += ` ORDER BY p.created_at DESC LIMIT $${paramIndex};`;
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

export async function getProjectById(req, res, next) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT p.id, p.title, p.description, p.category, p.budget_min, p.budget_max,
              p.budget_type, p.required_skills, p.deadline, p.status, p.created_at,
              p.client_id,
              json_build_object(
                'id', c.id,
                'full_name', c.full_name,
                'title', c.title,
                'location', c.location,
                'bio', c.bio,
                'category', c.category,
                'avatar_url', c.avatar_url
              ) AS client
       FROM projects p
       JOIN profiles c ON p.client_id = c.id
       WHERE p.id = $1;`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
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

export async function createProject(req, res, next) {
  try {
    const clientId = req.user.id;
    const {
      title,
      description,
      category,
      budget_min,
      budget_max,
      budget_type = "fixed",
      required_skills = [],
      deadline,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Project title and description are required.",
      });
    }

    const result = await pool.query(
      `INSERT INTO projects (client_id, title, description, category, budget_min, budget_max, budget_type, required_skills, deadline, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'open')
       RETURNING *;`,
      [
        clientId,
        title.trim(),
        description.trim(),
        category || null,
        budget_min ? Number(budget_min) : null,
        budget_max ? Number(budget_max) : null,
        budget_type,
        Array.isArray(required_skills) ? required_skills : [],
        deadline || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Project created successfully.",
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProject(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify ownership
    const check = await pool.query("SELECT client_id FROM projects WHERE id = $1;", [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }
    if (check.rows[0].client_id !== userId && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "You can only edit your own projects." });
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
      status,
    } = req.body;

    const result = await pool.query(
      `UPDATE projects
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           category = COALESCE($3, category),
           budget_min = COALESCE($4, budget_min),
           budget_max = COALESCE($5, budget_max),
           budget_type = COALESCE($6, budget_type),
           required_skills = COALESCE($7, required_skills),
           deadline = COALESCE($8, deadline),
           status = COALESCE($9, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING *;`,
      [
        title,
        description,
        category,
        budget_min !== undefined ? (budget_min ? Number(budget_min) : null) : undefined,
        budget_max !== undefined ? (budget_max ? Number(budget_max) : null) : undefined,
        budget_type,
        Array.isArray(required_skills) ? required_skills : undefined,
        deadline,
        status,
        id,
      ]
    );

    res.json({
      success: true,
      message: "Project updated successfully.",
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteProject(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const check = await pool.query("SELECT client_id FROM projects WHERE id = $1;", [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }
    if (check.rows[0].client_id !== userId && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "You can only delete your own projects." });
    }

    await pool.query("DELETE FROM projects WHERE id = $1;", [id]);

    res.json({
      success: true,
      message: "Project deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
}

export async function getUserProjects(req, res, next) {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT * FROM projects
       WHERE client_id = $1
       ORDER BY created_at DESC;`,
      [userId]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
}
