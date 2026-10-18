import { Router } from 'express';
import { getMyContracts, completeContract } from '../controllers/contractController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

router.use(verifyToken);

router.get('/my', getMyContracts);
router.put('/:id/complete', requireRole('CLIENT', 'ADMIN'), completeContract);

export default router;
