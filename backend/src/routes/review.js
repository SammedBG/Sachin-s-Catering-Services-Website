import express from "express"
import { getReviews, createReview } from "../controllers/reviewController.js"
import { auth } from "../middleware/auth.js"

const router = express.Router()

router.get("/", getReviews)
router.post("/", auth, createReview)

export default router

