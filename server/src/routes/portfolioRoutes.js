import { Router } from "express";
import {
  getPortfolioByFreelancer,
  addPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
} from "../controllers/portfolioController.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/:freelancerId", getPortfolioByFreelancer);
router.post("/", verifyToken, requireRole("freelancer", "admin"), addPortfolioItem);
router.put("/:id", verifyToken, requireRole("freelancer", "admin"), updatePortfolioItem);
router.delete("/:id", verifyToken, requireRole("freelancer", "admin"), deletePortfolioItem);

export default router;
