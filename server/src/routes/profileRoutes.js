import { Router } from 'express';
import { getFreelancers, getClients, getProfileById, updateMyProfile } from '../controllers/profileController.js';
import { verifyToken, optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/freelancers', optionalAuth, getFreelancers);
router.get('/clients', optionalAuth, getClients);
router.get('/:id', optionalAuth, getProfileById);
router.put('/me', verifyToken, updateMyProfile);

export default router;
