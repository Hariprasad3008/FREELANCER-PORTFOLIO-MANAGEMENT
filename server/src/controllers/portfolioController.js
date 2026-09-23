import pool from "../config/db.js";

export async function getPortfolioByFreelancer(req, res, next) {
  try {
    const { freelancerId } = req.params;

    const result = await pool.query(
      `SELECT * FROM portfolio_items
       WHERE freelancer_id = $1
       ORDER BY created_at DESC;`,
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

export async function addPortfolioItem(req, res, next) {
  try {
    const freelancerId = req.user.id;
    const { title, description, image_url, project_url, tags = [] } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Portfolio item title is required.",
      });
    }

    const result = await pool.query(
      `INSERT INTO portfolio_items (freelancer_id, title, description, image_url, project_url, tags)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *;`,
      [
        freelancerId,
        title.trim(),
        description ? description.trim() : null,
        image_url || null,
        project_url || null,
        Array.isArray(tags) ? tags : [],
      ]
    );

    res.status(201).json({
      success: true,
      message: "Portfolio item added.",
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

export async function updatePortfolioItem(req, res, next) {
  try {
    const { id } = req.params;
    const freelancerId = req.user.id;
    const { title, description, image_url, project_url, tags } = req.body;

    const check = await pool.query("SELECT freelancer_id FROM portfolio_items WHERE id = $1;", [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Portfolio item not found." });
    }
    if (check.rows[0].freelancer_id !== freelancerId) {
      return res.status(403).json({ success: false, message: "Unauthorized." });
    }

    const result = await pool.query(
      `UPDATE portfolio_items
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           image_url = COALESCE($3, image_url),
           project_url = COALESCE($4, project_url),
           tags = COALESCE($5, tags)
       WHERE id = $6
       RETURNING *;`,
      [title, description, image_url, project_url, Array.isArray(tags) ? tags : undefined, id]
    );

    res.json({
      success: true,
      message: "Portfolio item updated.",
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

export async function deletePortfolioItem(req, res, next) {
  try {
    const { id } = req.params;
    const freelancerId = req.user.id;

    const check = await pool.query("SELECT freelancer_id FROM portfolio_items WHERE id = $1;", [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Portfolio item not found." });
    }
    if (check.rows[0].freelancer_id !== freelancerId) {
      return res.status(403).json({ success: false, message: "Unauthorized." });
    }

    await pool.query("DELETE FROM portfolio_items WHERE id = $1;", [id]);

    res.json({
      success: true,
      message: "Portfolio item deleted.",
    });
  } catch (error) {
    next(error);
  }
}
