import { query } from '../config/db.js';

export const getMyContracts = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const sql = `
      SELECT 
        c.*,
        p.title AS project_title,
        p.category AS project_category,
        cu.name AS client_name,
        cu.avatar_url AS client_avatar,
        fu.name AS freelancer_name,
        fu.avatar_url AS freelancer_avatar,
        fp.title AS freelancer_title
      FROM contracts c
      JOIN projects p ON c.project_id = p.id
      JOIN client_profiles cp ON c.client_id = cp.id
      JOIN users cu ON cp.user_id = cu.id
      JOIN freelancer_profiles fp ON c.freelancer_id = fp.id
      JOIN users fu ON fp.user_id = fu.id
      WHERE cp.user_id = $1 OR fp.user_id = $1
      ORDER BY c.created_at DESC;
    `;

    const result = await query(sql, [userId]);
    res.json({
      success: true,
      count: result.rows.length,
      contracts: result.rows
    });
  } catch (error) {
    next(error);
  }
};

export const completeContract = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const check = await query(
      `SELECT c.*, cp.user_id AS client_user_id 
       FROM contracts c 
       JOIN client_profiles cp ON c.client_id = cp.id 
       WHERE c.id = $1`,
      [id]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Contract not found.' });
    }

    const contract = check.rows[0];
    if (String(contract.client_user_id) !== String(userId) && req.user.role?.toUpperCase() !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Only the client can complete this contract.' });
    }

    // Update contract status
    await query(
      "UPDATE contracts SET status = 'COMPLETED', completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [id]
    );

    // Update project status
    await query("UPDATE projects SET status = 'COMPLETED' WHERE id = $1", [contract.project_id]);

    // Bump freelancer projects_completed
    await query(
      "UPDATE freelancer_profiles SET projects_completed = projects_completed + 1 WHERE id = $1",
      [contract.freelancer_id]
    );

    res.json({
      success: true,
      message: 'Contract completed successfully!'
    });
  } catch (error) {
    next(error);
  }
};
