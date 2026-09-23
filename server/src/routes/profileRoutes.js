import { Router } from "express";
import {
  getFreelancers,
  getClients,
  getProfileById,
  updateMyProfile,
} from "../controllers/profileController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/freelancers", getFreelancers);
router.get("/clients", getClients);
router.get("/:id", getProfileById);
router.put("/me", verifyToken, updateMyProfile);

export default router;
