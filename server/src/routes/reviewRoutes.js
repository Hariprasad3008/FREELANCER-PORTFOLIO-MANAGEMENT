import { Router } from "express";
import { getFreelancerReviews, createReview } from "../controllers/reviewController.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/freelancer/:id", getFreelancerReviews);
router.post("/", verifyToken, requireRole("client", "admin"), createReview);

export default router;
