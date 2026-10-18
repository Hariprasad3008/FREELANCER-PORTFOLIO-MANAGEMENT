import { Router } from 'express';
import { getFreelancerReviews, createReview } from '../controllers/reviewController.js';
import { verifyToken, requireRole, optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/freelancer/:id', optionalAuth, getFreelancerReviews);
router.post('/', verifyToken, requireRole('client', 'admin'), createReview);

export default router;
