import { query } from '../config/db.js';

export const getFreelancerReviews = async (req, res, next) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT 
        r.id,
        r.rating,
        r.comment,
        r.created_at,
        cu.id AS client_user_id,
        cu.name AS client_name,
        cu.avatar_url AS client_avatar,
        p.title AS project_title
      FROM reviews r
      JOIN client_profiles cp ON r.client_id = cp.id
      JOIN users cu ON cp.user_id = cu.id
      LEFT JOIN contracts c ON r.contract_id = c.id
      LEFT JOIN projects p ON c.project_id = p.id
      JOIN freelancer_profiles fp ON r.freelancer_id = fp.id
      WHERE fp.id = $1 OR fp.user_id = $1
      ORDER BY r.created_at DESC;
    `;

    const result = await query(sql, [id]);
    res.json({
      success: true,
      count: result.rows.length,
      reviews: result.rows
    });
  } catch (error) {
    next(error);
  }
};

export const createReview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { freelancer_id, contract_id, rating, comment } = req.body;

    if (!freelancer_id || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Freelancer ID and rating (1-5) are required.'
      });
    }

    const numRating = parseInt(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5.'
      });
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

    const sql = `
      INSERT INTO reviews (client_id, freelancer_id, contract_id, rating, comment)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const reviewRes = await query(sql, [
      clientId,
      targetFpId,
      contract_id || null,
      numRating,
      comment || ''
    ]);

    // Recalculate average rating
    const avgRes = await query(
      `SELECT AVG(rating)::decimal(3,2) AS avg_rating, COUNT(id)::int AS count 
       FROM reviews 
       WHERE freelancer_id = $1`,
      [targetFpId]
    );

    const newAvg = avgRes.rows[0]?.avg_rating || numRating;

    await query(
      'UPDATE freelancer_profiles SET average_rating = $1 WHERE id = $2',
      [newAvg, targetFpId]
    );

    res.status(201).json({
      success: true,
      message: 'Verified review posted successfully!',
      review: reviewRes.rows[0],
      new_rating: newAvg
    });
  } catch (error) {
    next(error);
  }
};
