import { Router } from "express";
import {
  getSavedProfiles,
  saveProfile,
  unsaveProfile,
  getSavedProjects,
  saveProject,
  unsaveProject,
} from "../controllers/savedController.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = Router();

// Client saving Freelancer profiles
router.get("/profiles", verifyToken, requireRole("client", "admin"), getSavedProfiles);
router.post("/profiles/:freelancerId", verifyToken, requireRole("client", "admin"), saveProfile);
router.delete("/profiles/:freelancerId", verifyToken, requireRole("client", "admin"), unsaveProfile);

// Freelancer saving Projects
router.get("/projects", verifyToken, requireRole("freelancer", "admin"), getSavedProjects);
router.post("/projects/:projectId", verifyToken, requireRole("freelancer", "admin"), saveProject);
router.delete("/projects/:projectId", verifyToken, requireRole("freelancer", "admin"), unsaveProject);

export default router;
