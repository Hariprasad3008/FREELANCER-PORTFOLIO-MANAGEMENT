import { query } from '../config/db.js';

export const getSavedProfiles = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const sql = `
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
        fp.experience_level,
        fp.location,
        LOWER(fp.availability_status) AS availability_status,
        fp.projects_completed,
        fp.success_rate,
        fp.average_rating AS rating,
        sf.created_at AS saved_at,
        COALESCE(
          array_agg(s.name) FILTER (WHERE s.name IS NOT NULL),
          '{}'
        ) AS skills
      FROM saved_freelancers sf
      JOIN client_profiles cp ON sf.client_id = cp.id
      JOIN freelancer_profiles fp ON sf.freelancer_id = fp.id
      JOIN users u ON fp.user_id = u.id
      LEFT JOIN freelancer_skills fs ON fp.id = fs.freelancer_id
      LEFT JOIN skills s ON fs.skill_id = s.id
      WHERE cp.user_id = $1
      GROUP BY u.id, fp.id, sf.created_at
      ORDER BY sf.created_at DESC;
    `;

    const result = await query(sql, [userId]);
    res.json({
      success: true,
      count: result.rows.length,
      saved_profiles: result.rows
    });
  } catch (error) {
    next(error);
  }
};

export const toggleSavedProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { freelancer_id } = req.body;

    if (!freelancer_id) {
      return res.status(400).json({ success: false, message: 'Freelancer ID is required.' });
    }

    // Get client profile ID
    let cpRes = await query('SELECT id FROM client_profiles WHERE user_id = $1', [userId]);
    let clientId = cpRes.rows[0]?.id;
    if (!clientId) {
      const newCp = await query(
        'INSERT INTO client_profiles (user_id, company_name) VALUES ($1, $2) RETURNING id',
        [userId, 'Company']
      );
      clientId = newCp.rows[0].id;
    }

    // Resolve target freelancer profile ID
    let fpRes = await query(
      'SELECT id FROM freelancer_profiles WHERE id = $1 OR user_id = $1',
      [freelancer_id]
    );
    if (fpRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Freelancer profile not found.' });
    }
    const targetFpId = fpRes.rows[0].id;

    const check = await query(
      'SELECT client_id FROM saved_freelancers WHERE client_id = $1 AND freelancer_id = $2',
      [clientId, targetFpId]
    );

    let isSaved = false;
    if (check.rows.length > 0) {
      await query(
        'DELETE FROM saved_freelancers WHERE client_id = $1 AND freelancer_id = $2',
        [clientId, targetFpId]
      );
      isSaved = false;
    } else {
      await query(
        'INSERT INTO saved_freelancers (client_id, freelancer_id) VALUES ($1, $2)',
        [clientId, targetFpId]
      );
      isSaved = true;
    }

    res.json({
      success: true,
      isSaved,
      message: isSaved ? 'Freelancer saved to bookmarks!' : 'Freelancer removed from bookmarks.'
    });
  } catch (error) {
    next(error);
  }
};

export const getSavedProjects = async (req, res, next) => {
  try {
    const userId = req.user.id;

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
        sp.created_at AS saved_at,
        u.name AS client_name,
        u.avatar_url AS client_avatar,
        5.0 AS client_rating,
        COALESCE(
          array_agg(s.name) FILTER (WHERE s.name IS NOT NULL),
          '{}'
        ) AS required_skills
      FROM saved_projects sp
      JOIN freelancer_profiles fp ON sp.freelancer_id = fp.id
      JOIN projects p ON sp.project_id = p.id
      JOIN client_profiles cp ON p.client_id = cp.id
      JOIN users u ON cp.user_id = u.id
      LEFT JOIN project_skills ps ON p.id = ps.project_id
      LEFT JOIN skills s ON ps.skill_id = s.id
      WHERE fp.user_id = $1
      GROUP BY p.id, sp.created_at, u.id
      ORDER BY sp.created_at DESC;
    `;

    const result = await query(sql, [userId]);
    res.json({
      success: true,
      count: result.rows.length,
      saved_projects: result.rows
    });
  } catch (error) {
    next(error);
  }
};

export const toggleSavedProject = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { project_id } = req.body;

    if (!project_id) {
      return res.status(400).json({ success: false, message: 'Project ID is required.' });
    }

    let fpRes = await query('SELECT id FROM freelancer_profiles WHERE user_id = $1', [userId]);
    let freelancerId = fpRes.rows[0]?.id;

    if (!freelancerId) {
      const newFp = await query(
        'INSERT INTO freelancer_profiles (user_id, title) VALUES ($1, $2) RETURNING id',
        [userId, 'Freelancer Specialist']
      );
      freelancerId = newFp.rows[0].id;
    }

    const check = await query(
      'SELECT freelancer_id FROM saved_projects WHERE freelancer_id = $1 AND project_id = $2',
      [freelancerId, project_id]
    );

    let isSaved = false;
    if (check.rows.length > 0) {
      await query(
        'DELETE FROM saved_projects WHERE freelancer_id = $1 AND project_id = $2',
        [freelancerId, project_id]
      );
      isSaved = false;
    } else {
      await query(
        'INSERT INTO saved_projects (freelancer_id, project_id) VALUES ($1, $2)',
        [freelancerId, project_id]
      );
      isSaved = true;
    }

    res.json({
      success: true,
      isSaved,
      message: isSaved ? 'Project saved to bookmarks!' : 'Project removed from bookmarks.'
    });
  } catch (error) {
    next(error);
  }
};

export const getSavedIds = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [profilesRes, projectsRes] = await Promise.all([
      query(
        `SELECT sf.freelancer_id, u.id AS user_id 
         FROM saved_freelancers sf 
         JOIN client_profiles cp ON sf.client_id = cp.id 
         JOIN freelancer_profiles fp ON sf.freelancer_id = fp.id
         JOIN users u ON fp.user_id = u.id
         WHERE cp.user_id = $1`,
        [userId]
      ),
      query(
        `SELECT sp.project_id 
         FROM saved_projects sp 
         JOIN freelancer_profiles fp ON sp.freelancer_id = fp.id 
         WHERE fp.user_id = $1`,
        [userId]
      )
    ]);

    const savedProfileIds = [
      ...profilesRes.rows.map(r => r.freelancer_id),
      ...profilesRes.rows.map(r => r.user_id)
    ];

    res.json({
      success: true,
      savedProfileIds,
      savedProjectIds: projectsRes.rows.map(r => r.project_id)
    });
  } catch (error) {
    next(error);
  }
};
