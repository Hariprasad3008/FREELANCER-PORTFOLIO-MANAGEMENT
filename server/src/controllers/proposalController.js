import { query } from '../config/db.js';

export const submitProposal = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { project_id, bid_amount, estimated_days, cover_letter } = req.body;

    if (!project_id || !bid_amount || !estimated_days) {
      return res.status(400).json({
        success: false,
        message: 'Please provide project ID, bid amount, and estimated delivery days.'
      });
    }

    // Get freelancer profile ID
    let fpRes = await query('SELECT id FROM freelancer_profiles WHERE user_id = $1', [userId]);
    let freelancerId = fpRes.rows[0]?.id;

    if (!freelancerId) {
      const newFp = await query(
        'INSERT INTO freelancer_profiles (user_id, title) VALUES ($1, $2) RETURNING id',
        [userId, 'Freelancer Specialist']
      );
      freelancerId = newFp.rows[0].id;
    }

    // Verify project exists and is OPEN
    const projCheck = await query('SELECT id, status FROM projects WHERE id = $1', [project_id]);
    if (projCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    // Check existing proposal
    const existing = await query(
      'SELECT id FROM proposals WHERE project_id = $1 AND freelancer_id = $2',
      [project_id, freelancerId]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted a proposal for this project.'
      });
    }

    const sql = `
      INSERT INTO proposals (
        project_id, freelancer_id, cover_letter, bid_amount, estimated_days, status
      ) VALUES ($1, $2, $3, $4, $5, 'PENDING')
      RETURNING *;
    `;

    const result = await query(sql, [
      project_id,
      freelancerId,
      cover_letter || '',
      parseFloat(bid_amount),
      parseInt(estimated_days)
    ]);

    res.status(201).json({
      success: true,
      message: 'Proposal submitted successfully!',
      proposal: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectProposals = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // Verify user is project owner or admin
    const check = await query(
      `SELECT p.id, cp.user_id 
       FROM projects p 
       JOIN client_profiles cp ON p.client_id = cp.id 
       WHERE p.id = $1`,
      [projectId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    if (String(check.rows[0].user_id) !== String(userId) && req.user.role?.toUpperCase() !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized to view proposals for this project.' });
    }

    const sql = `
      SELECT 
        pr.id,
        pr.project_id,
        pr.freelancer_id,
        pr.cover_letter,
        pr.bid_amount,
        pr.estimated_days,
        pr.status,
        pr.created_at,
        u.id AS freelancer_user_id,
        u.name AS freelancer_name,
        u.avatar_url AS freelancer_avatar,
        fp.title AS freelancer_title,
        fp.hourly_rate AS freelancer_rate,
        fp.average_rating AS freelancer_rating,
        fp.projects_completed,
        fp.success_rate
      FROM proposals pr
      JOIN freelancer_profiles fp ON pr.freelancer_id = fp.id
      JOIN users u ON fp.user_id = u.id
      WHERE pr.project_id = $1
      ORDER BY pr.created_at DESC;
    `;

    const result = await query(sql, [projectId]);

    res.json({
      success: true,
      count: result.rows.length,
      proposals: result.rows
    });
  } catch (error) {
    next(error);
  }
};

export const getMyProposals = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const role = (req.user.role || '').toUpperCase();

    if (role === 'CLIENT') {
      // Inbound proposals received on client's posted projects
      const sql = `
        SELECT 
          pr.id,
          pr.project_id,
          pr.freelancer_id,
          pr.cover_letter,
          pr.bid_amount,
          pr.estimated_days,
          pr.status,
          pr.created_at,
          p.title AS project_title,
          p.budget_min,
          p.budget_max,
          p.budget_type,
          p.status AS project_status,
          u.id AS freelancer_user_id,
          u.name AS freelancer_name,
          u.avatar_url AS freelancer_avatar,
          fp.title AS freelancer_title,
          fp.hourly_rate AS freelancer_rate,
          fp.average_rating AS freelancer_rating,
          fp.projects_completed,
          fp.success_rate
        FROM proposals pr
        JOIN projects p ON pr.project_id = p.id
        JOIN client_profiles cp ON p.client_id = cp.id
        JOIN freelancer_profiles fp ON pr.freelancer_id = fp.id
        JOIN users u ON fp.user_id = u.id
        WHERE cp.user_id = $1
        ORDER BY pr.created_at DESC;
      `;

      const result = await query(sql, [userId]);
      return res.json({
        success: true,
        count: result.rows.length,
        proposals: result.rows
      });
    }

    // Freelancer submitted proposals
    const sql = `
      SELECT 
        pr.id,
        pr.project_id,
        pr.cover_letter,
        pr.bid_amount,
        pr.estimated_days,
        pr.status,
        pr.created_at,
        p.title AS project_title,
        p.budget_min,
        p.budget_max,
        p.budget_type,
        p.status AS project_status,
        cu.name AS client_name,
        cu.avatar_url AS client_avatar
      FROM proposals pr
      JOIN freelancer_profiles fp ON pr.freelancer_id = fp.id
      JOIN projects p ON pr.project_id = p.id
      JOIN client_profiles cp ON p.client_id = cp.id
      JOIN users cu ON cp.user_id = cu.id
      WHERE fp.user_id = $1
      ORDER BY pr.created_at DESC;
    `;

    const result = await query(sql, [userId]);

    res.json({
      success: true,
      count: result.rows.length,
      proposals: result.rows
    });
  } catch (error) {
    next(error);
  }
};

export const acceptProposal = async (req, res, next) => {
  try {
    const { proposalId } = req.params;
    const userId = req.user.id;

    // Check proposal and client ownership
    const propRes = await query(
      `SELECT pr.*, p.client_id, cp.user_id AS client_user_id 
       FROM proposals pr
       JOIN projects p ON pr.project_id = p.id
       JOIN client_profiles cp ON p.client_id = cp.id
       WHERE pr.id = $1`,
      [proposalId]
    );

    if (propRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Proposal not found.' });
    }

    const proposal = propRes.rows[0];

    if (String(proposal.client_user_id) !== String(userId) && req.user.role?.toUpperCase() !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized to accept this proposal.' });
    }

    // 1. Update proposal status to ACCEPTED
    await query("UPDATE proposals SET status = 'ACCEPTED' WHERE id = $1", [proposalId]);

    // 2. Reject other proposals for this project
    await query(
      "UPDATE proposals SET status = 'REJECTED' WHERE project_id = $1 AND id != $2 AND status = 'PENDING'",
      [proposal.project_id, proposalId]
    );

    // 3. Update project status to IN_PROGRESS
    await query("UPDATE projects SET status = 'IN_PROGRESS' WHERE id = $1", [proposal.project_id]);

    // 4. Create Contract
    const contractRes = await query(
      `INSERT INTO contracts (
        project_id, proposal_id, client_id, freelancer_id, agreed_amount, start_date, status
      ) VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, 'ACTIVE')
      RETURNING *;`,
      [
        proposal.project_id,
        proposalId,
        proposal.client_id,
        proposal.freelancer_id,
        proposal.bid_amount
      ]
    );

    res.json({
      success: true,
      message: 'Proposal accepted and contract initialized!',
      contract: contractRes.rows[0]
    });
  } catch (error) {
    next(error);
  }
};
