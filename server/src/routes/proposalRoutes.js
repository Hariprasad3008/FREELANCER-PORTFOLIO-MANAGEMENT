import { Router } from 'express';
import {
  submitProposal,
  getProjectProposals,
  getMyProposals,
  acceptProposal
} from '../controllers/proposalController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

router.use(verifyToken);

router.post('/', requireRole('FREELANCER', 'ADMIN'), submitProposal);
router.get('/my', getMyProposals);
router.get('/project/:projectId', requireRole('CLIENT', 'ADMIN'), getProjectProposals);
router.post('/:proposalId/accept', requireRole('CLIENT', 'ADMIN'), acceptProposal);

export default router;
