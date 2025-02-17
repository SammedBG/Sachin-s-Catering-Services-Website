import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import { createServer } from "http"
import { Server } from "socket.io"
import authRoutes from "./routes/auth.js"
import bookingRoutes from "./routes/booking.js"
import adminRoutes from "./routes/admin.js"
import reviewRoutes from "./routes/review.js"


dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
})

const PORT = process.env.PORT || 5000

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
)
app.use(express.json())

// Database connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Socket.IO
io.on("connection", (socket) => {
  console.log("A user connected")

  socket.on("disconnect", () => {
    console.log("User disconnected")
  })
})

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/bookings", bookingRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/reviews", reviewRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send("Something broke!")
})

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

export { io }

