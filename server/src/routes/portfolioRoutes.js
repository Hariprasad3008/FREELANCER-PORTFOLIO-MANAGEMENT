import { Router } from 'express';
import {
  getFreelancerPortfolio,
  createPortfolioItem,
  deletePortfolioItem
} from '../controllers/portfolioController.js';
import { verifyToken, requireRole, optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/:freelancerId', optionalAuth, getFreelancerPortfolio);
router.post('/', verifyToken, requireRole('freelancer', 'admin'), createPortfolioItem);
router.delete('/:id', verifyToken, deletePortfolioItem);

export default router;
