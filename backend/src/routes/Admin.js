import express from "express"
import Booking from "../models/booking.js"
import { auth } from "../middleware/auth.js"
import { isAdmin } from "../middleware/isAdmin.js"

const router = express.Router()

router.get("/bookings", auth, isAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ date: 1 }).populate("user", "name email")
    res.json(bookings)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

router.put("/bookings/:id", auth, isAdmin, async (req, res) => {
  try {
    const { status } = req.body
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate(
      "user",
      "name email",
    )

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    res.json(booking)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

export default router

