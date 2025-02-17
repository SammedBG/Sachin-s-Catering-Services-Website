import jwt from "jsonwebtoken"

const generateAccessToken = (userId, role) => {
  if (!process.env.JWT_ACCESS_SECRET) {
    throw new Error("JWT_ACCESS_SECRET is not defined in environment variables")
  }
  return jwt.sign({ id: userId, role }, process.env.JWT_ACCESS_SECRET, { expiresIn: "15m" })
}

const generateRefreshToken = (userId) => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET is not defined in environment variables")
  }
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" })
}

const verifyAccessToken = (token) => {
  if (!process.env.JWT_ACCESS_SECRET) {
    throw new Error("JWT_ACCESS_SECRET is not defined in environment variables")
  }
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET)
}

const verifyRefreshToken = (token) => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET is not defined in environment variables")
  }
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET)
}

export { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken }

