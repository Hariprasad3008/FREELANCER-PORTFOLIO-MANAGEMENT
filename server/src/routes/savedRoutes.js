import { Router } from 'express';
import {
  getSavedProfiles,
  toggleSavedProfile,
  getSavedProjects,
  toggleSavedProject,
  getSavedIds
} from '../controllers/savedController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(verifyToken);

router.get('/ids', getSavedIds);
router.get('/profiles', getSavedProfiles);
router.post('/profiles', toggleSavedProfile);
router.get('/projects', getSavedProjects);
router.post('/projects', toggleSavedProject);

export default router;
