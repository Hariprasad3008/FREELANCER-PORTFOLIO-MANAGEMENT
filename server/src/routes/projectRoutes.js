import { Router } from "express";
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getUserProjects,
} from "../controllers/projectController.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", getAllProjects);
router.get("/user/:userId", getUserProjects);
router.get("/:id", getProjectById);
router.post("/", verifyToken, requireRole("client", "admin"), createProject);
router.put("/:id", verifyToken, requireRole("client", "admin"), updateProject);
router.delete("/:id", verifyToken, requireRole("client", "admin"), deleteProject);

export default router;
