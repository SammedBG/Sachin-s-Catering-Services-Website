import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { generateAccessToken, generateRefreshToken } from "../utils/jwtUtils.js"
import User from "../models/User.js"
import { auth } from "../middleware/auth.js"
import { sendPasswordResetEmail } from "../utils/emailService.js"
import rateLimit from "express-rate-limit"
import crypto from "crypto"

const router = express.Router()

// Rate limiting
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: "Too many login attempts, please try again after 15 minutes",
})

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next()
  } else {
    res.status(403).json({ message: "Access denied. Admin only." })
  }
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body
    let user = await User.findOne({ email })

    if (user) {
      return res.status(400).json({ message: "User already exists" })
    }

    user = new User({ name, email, password })
    await user.save()

    const accessToken = generateAccessToken(user._id, user.role)
    const refreshToken = generateRefreshToken(user._id)

    res
      .status(201)
      .json({ accessToken, refreshToken, user: { id: user._id, name: user.name, email: user.email, role: user.role } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const isMatch = await user.comparePassword(password)

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const accessToken = generateAccessToken(user._id, user.role)
    const refreshToken = generateRefreshToken(user._id)

    res.json({ accessToken, refreshToken, user: { id: user._id, name: user.name, email: user.email, role: user.role } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

router.post("/refresh-token", async (req, res) => {
  const { refreshToken } = req.body

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required" })
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
    const user = await User.findById(decoded.id)

    if (!user) {
      return res.status(401).json({ message: "User not found" })
    }

    const accessToken = generateAccessToken(user._id, user.role)
    res.json({ accessToken })
  } catch (err) {
    res.status(401).json({ message: "Invalid refresh token" })
  }
})

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    const resetToken = crypto.randomBytes(20).toString("hex")
    user.resetPasswordToken = resetToken
    user.resetPasswordExpires = Date.now() + 3600000 // 1 hour
    await user.save()

    await sendPasswordResetEmail(user.email, resetToken)

    res.json({ message: "Password reset email sent" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

router.post("/reset-password/:token", async (req, res) => {
  try {
    const { password } = req.body
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" })
    }

    user.password = password
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    res.json({ message: "Password reset successful" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

router.get("/user", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")
    res.json(user)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// Admin-only route example
router.get("/admin-only", auth, isAdmin, (req, res) => {
  res.json({ message: "This is an admin-only route" })
})

export default router

