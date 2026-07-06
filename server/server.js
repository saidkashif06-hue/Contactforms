const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

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

// Nodemailer Transporter
// NOTE: host/port used explicitly (instead of `service: "gmail"`) so we can
// force IPv4 — Render's network can't route to Gmail's IPv6 address, which
// causes ENETUNREACH / ETIMEDOUT connection errors.
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for port 465, false for 587
  family: 4, // force IPv4 to avoid ENETUNREACH on IPv6-blocked hosts like Render
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // must be a Gmail App Password, not your normal password
  },
});

// Verify SMTP connection on startup so failures show up immediately in logs
transporter.verify((err, success) => {
  if (err) {
    console.error("❌ SMTP connection failed:", err.message);
  } else {
    console.log("✅ SMTP server is ready to send emails");
  }
});

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

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

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
