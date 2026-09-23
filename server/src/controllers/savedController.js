import pool from "../config/db.js";

// Client saving Freelancer profiles
export async function getSavedProfiles(req, res, next) {
  try {
    const clientId = req.user.id;

    const result = await pool.query(
      `SELECT sp.created_at as saved_at,
              json_build_object(
                'id', p.id,
                'full_name', p.full_name,
                'title', p.title,
                'location', p.location,
                'hourly_rate', p.hourly_rate,
                'rating', p.rating,
                'skills', p.skills,
                'avatar_url', p.avatar_url
              ) AS freelancer
       FROM saved_profiles sp
       JOIN profiles p ON sp.freelancer_id = p.id
       WHERE sp.client_id = $1
       ORDER BY sp.created_at DESC;`,
      [clientId]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
}

export async function saveProfile(req, res, next) {
  try {
    const clientId = req.user.id;
    const { freelancerId } = req.params;

    await pool.query(
      `INSERT INTO saved_profiles (client_id, freelancer_id)
       VALUES ($1, $2)
       ON CONFLICT (client_id, freelancer_id) DO NOTHING;`,
      [clientId, freelancerId]
    );

    res.status(201).json({
      success: true,
      message: "Freelancer profile saved.",
    });
  } catch (error) {
    next(error);
  }
}

export async function unsaveProfile(req, res, next) {
  try {
    const clientId = req.user.id;
    const { freelancerId } = req.params;

    await pool.query(
      `DELETE FROM saved_profiles
       WHERE client_id = $1 AND freelancer_id = $2;`,
      [clientId, freelancerId]
    );

    res.json({
      success: true,
      message: "Freelancer profile removed from saved list.",
    });
  } catch (error) {
    next(error);
  }
}

// Freelancer saving Projects
export async function getSavedProjects(req, res, next) {
  try {
    const freelancerId = req.user.id;

    const result = await pool.query(
      `SELECT sp.created_at as saved_at,
              json_build_object(
                'id', p.id,
                'title', p.title,
                'description', p.description,
                'budget_min', p.budget_min,
                'budget_max', p.budget_max,
                'budget_type', p.budget_type,
                'required_skills', p.required_skills,
                'status', p.status,
                'client', json_build_object(
                  'id', c.id,
                  'full_name', c.full_name,
                  'location', c.location
                )
              ) AS project
       FROM saved_projects sp
       JOIN projects p ON sp.project_id = p.id
       JOIN profiles c ON p.client_id = c.id
       WHERE sp.freelancer_id = $1
       ORDER BY sp.created_at DESC;`,
      [freelancerId]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
}

export async function saveProject(req, res, next) {
  try {
    const freelancerId = req.user.id;
    const { projectId } = req.params;

    await pool.query(
      `INSERT INTO saved_projects (freelancer_id, project_id)
       VALUES ($1, $2)
       ON CONFLICT (freelancer_id, project_id) DO NOTHING;`,
      [freelancerId, projectId]
    );

    res.status(201).json({
      success: true,
      message: "Project saved.",
    });
  } catch (error) {
    next(error);
  }
}

export async function unsaveProject(req, res, next) {
  try {
    const freelancerId = req.user.id;
    const { projectId } = req.params;

    await pool.query(
      `DELETE FROM saved_projects
       WHERE freelancer_id = $1 AND project_id = $2;`,
      [freelancerId, projectId]
    );

    res.json({
      success: true,
      message: "Project removed from saved list.",
    });
  } catch (error) {
    next(error);
  }
}
