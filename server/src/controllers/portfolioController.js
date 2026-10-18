import { query } from '../config/db.js';

export const getFreelancerPortfolio = async (req, res, next) => {
  try {
    const { freelancerId } = req.params;
    const result = await query(
      `SELECT pp.id, pp.freelancer_id, pp.title, pp.description, pp.image_url, pp.project_url, pp.created_at
       FROM portfolio_projects pp
       JOIN freelancer_profiles fp ON pp.freelancer_id = fp.id
       WHERE fp.id = $1 OR fp.user_id = $1
       ORDER BY pp.created_at DESC;`,
      [freelancerId]
    );

    res.json({
      success: true,
      count: result.rows.length,
      portfolio: result.rows
    });
  } catch (error) {
    next(error);
  }
};

export const createPortfolioItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title, description, image_url, project_url } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Portfolio item title is required.'
      });
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

    const defaultImage = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80';

    const sql = `
      INSERT INTO portfolio_projects (freelancer_id, title, description, image_url, project_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const result = await query(sql, [
      freelancerId,
      title.trim(),
      description || '',
      image_url || defaultImage,
      project_url || ''
    ]);

    res.status(201).json({
      success: true,
      message: 'Portfolio project added successfully!',
      item: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const deletePortfolioItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const check = await query(
      `SELECT pp.id, fp.user_id 
       FROM portfolio_projects pp 
       JOIN freelancer_profiles fp ON pp.freelancer_id = fp.id 
       WHERE pp.id = $1`,
      [id]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Portfolio project not found.' });
    }

    if (String(check.rows[0].user_id) !== String(userId) && req.user.role?.toUpperCase() !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this portfolio project.' });
    }

    await query('DELETE FROM portfolio_projects WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Portfolio project deleted successfully!'
    });
  } catch (error) {
    next(error);
  }
};
