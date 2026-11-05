import nodemailer from "nodemailer";
import { escapeHtml } from "../utils/escapeHtml.js";

// Create a transporter using environment variables
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_MESSAGE_LENGTH = 5000;

export const sendContactEmail = async (req, res) => {
  const email = typeof req.body.email === "string" ? req.body.email.trim() : "";
  const message =
    typeof req.body.message === "string" ? req.body.message.trim() : "";

  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return res.status(400).json({ message: "Please enter a valid email address." });
  }
  if (!message || message.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({
      message: `Message must be between 1 and ${MAX_MESSAGE_LENGTH} characters.`,
    });
  }

  try {
    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to yourself
      replyTo: email, // Set reply-to as the sender's email
      subject: "New Contact Form Submission",
      text: `New message from: ${email}\n\nMessage:\n${message}`,
            html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>From:</strong> ${escapeHtml(email)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
      `,
    });

    res.status(200).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};
