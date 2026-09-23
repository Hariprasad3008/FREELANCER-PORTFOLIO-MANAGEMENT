import pool from "../config/db.js";

export async function getFreelancerReviews(req, res, next) {
  try {
    const { id: freelancerId } = req.params;

    const result = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.created_at,
              json_build_object(
                'id', c.id,
                'full_name', c.full_name,
                'avatar_url', c.avatar_url
              ) AS client,
              json_build_object(
                'id', p.id,
                'title', p.title
              ) AS project
       FROM reviews r
       JOIN profiles c ON r.client_id = c.id
       LEFT JOIN projects p ON r.project_id = p.id
       WHERE r.freelancer_id = $1
       ORDER BY r.created_at DESC;`,
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

export async function createReview(req, res, next) {
  try {
    const clientId = req.user.id;
    const { freelancer_id, project_id, rating, comment } = req.body;

    if (!freelancer_id || !rating) {
      return res.status(400).json({
        success: false,
        message: "Freelancer ID and rating (1-5) are required.",
      });
    }

    if (clientId === freelancer_id) {
      return res.status(400).json({
        success: false,
        message: "You cannot review yourself.",
      });
    }

    // Insert review
    const result = await pool.query(
      `INSERT INTO reviews (client_id, freelancer_id, project_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (client_id, freelancer_id)
       DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment, created_at = CURRENT_TIMESTAMP
       RETURNING *;`,
      [clientId, freelancer_id, project_id || null, Number(rating), comment ? comment.trim() : null]
    );

    // Recalculate average rating & update profiles table
    const avgResult = await pool.query(
      `SELECT AVG(rating)::numeric(3,1) as avg_rating, COUNT(*) as review_count
       FROM reviews
       WHERE freelancer_id = $1;`,
      [freelancer_id]
    );

    if (avgResult.rows.length > 0) {
      const avg = avgResult.rows[0].avg_rating;
      await pool.query(
        "UPDATE profiles SET rating = $1 WHERE id = $2;",
        [avg, freelancer_id]
      );
    }

    res.status(201).json({
      success: true,
      message: "Review submitted successfully.",
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}
