const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Resend } = require("resend");
require("dotenv").config();

const resend = new Resend(process.env.RESEND_API_KEY);

const app = express();
const PORT = process.env.PORT || 5000;

// Allowed frontend origins
const allowedOrigins = [
  "https://contactforms-vlxf.vercel.app",
  "https://contactforms-ten.vercel.app",
  "http://localhost:3000", // for local testing
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like curl, Postman, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

app.use(bodyParser.json());

// Using Resend's HTTP API instead of SMTP — this avoids Render's free tier
// blocking outbound SMTP ports (465/587), which caused the ETIMEDOUT errors.
// Sign up free at https://resend.com, get an API key, and set it as
// RESEND_API_KEY in your environment variables.

// Contact Route
app.post("/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all fields.",
      });
    }

    const { data, error } = await resend.emails.send({
      // Must be a verified domain in Resend, OR use "onboarding@resend.dev"
      // for quick testing before you verify your own domain.
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: process.env.EMAIL_USER,
      reply_to: email,
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to send message.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Message sent successfully!",
    });
  } catch (error) {
    console.error("Send mail error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message.",
    });
  }
});

// IMPORTANT: CORS error handler — without this, blocked-origin requests
// hang/fail silently on the frontend with no useful response.
app.use((err, req, res, next) => {
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "This origin is not allowed to access the API.",
    });
  }
  next(err);
});

// Catch-all error handler (safety net for anything unhandled)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: "Something went wrong on the server.",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
