import Review from "../models/Review.js"

export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 }).limit(10)
    res.json(reviews)
  } catch (error) {
    res.status(500).json({ message: "Error fetching reviews", error: error.message })
  }
}

export const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body
    const newReview = new Review({
      user: req.user.id,
      name: req.user.name,
      rating,
      comment,
    })
    await newReview.save()
    res.status(201).json({ message: "Review submitted successfully", review: newReview })
  } catch (error) {
    res.status(400).json({ message: "Error submitting review", error: error.message })
  }
}

