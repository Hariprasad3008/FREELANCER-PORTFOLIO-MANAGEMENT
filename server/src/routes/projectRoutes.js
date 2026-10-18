import { Router } from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getMyProjects
} from '../controllers/projectController.js';
import { verifyToken, requireRole, optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', optionalAuth, getProjects);
router.get('/my/projects', verifyToken, requireRole('client', 'admin'), getMyProjects);
router.get('/:id', optionalAuth, getProjectById);
router.post('/', verifyToken, requireRole('client', 'admin'), createProject);
router.put('/:id', verifyToken, updateProject);
router.delete('/:id', verifyToken, deleteProject);

export default router;
