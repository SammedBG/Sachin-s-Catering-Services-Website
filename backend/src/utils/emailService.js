import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number.parseInt(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Reset Your Password",
      html: `
        <h1>Password Reset</h1>
        <p>Please click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link will expire in 1 hour.</p>
      `,
    })
    console.log("Password reset email sent")
  } catch (error) {
    console.error("Error sending password reset email:", error)
    throw error
  }
}

export const sendOwnerBookingNotification = async (booking) => {
  try {
    
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.OWNER_EMAIL,
      subject: "New Booking Notification",
      html: `
        <h1>New Booking Received</h1>
        <p>A new booking has been made:</p>
        <ul>
          <li>Event Type: ${booking.eventType}</li>
          <li>Date: ${new Date(booking.date).toLocaleDateString()}</li>
          <li>Time: ${booking.time}</li>
          <li>Guests: ${booking.guests}</li>
          <li>Additional Info: ${booking.additionalInfo || "None"}</li>
        </ul>
      `,
    })
    console.log("Owner booking notification email sent")
  } catch (error) {
    console.error("Error sending owner booking notification email:", error)
    throw error
  }
}

export const sendUserBookingConfirmation = async (booking, userEmail) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: userEmail,
      subject: "Booking Confirmation",
      html: `
        <h1>Your Booking is Confirmed</h1>
        <p>Thank you for choosing Shree Mahaveer Inchal Canteen!</p>
        <p>Event Type: ${booking.eventType}</p>
        <p>Date: ${new Date(booking.date).toLocaleDateString()}</p>
        <p>Time: ${booking.time}</p>
        <p>Guests: ${booking.guests}</p>
        <p>We look forward to serving you!</p>
      `,
    })
    console.log("User booking confirmation email sent")
  } catch (error) {
    console.error("Error sending user booking confirmation email:", error)
    throw error
  }
}

