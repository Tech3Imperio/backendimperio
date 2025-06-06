const express = require("express");
const errorhandeler = require("./Middleware/errorHandeler");
const userRouter = require("./Routes/user");
const dealerRouter = require("./Routes/dealer");
const enquiryRouter = require("./Routes/contact");
const jobapplicationRouter = require("./Routes/jobapplication");
const Dbconnector = require("./DatabaseConnection/user");
const logHistory = require("./Middleware/user");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const cors = require("cors");
const path = require("path");
const axios = require("axios");
require("dotenv").config();
const dbUri = process.env.MONGODB_URI;

const app = express();
const PORT = process.env.PORT || 3001; // Ensure your backend runs on port 3001
const otpRoutes = require("./Routes/otpRoutes");
// Database connection
Dbconnector(dbUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log("Database connected...");
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error);
  });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

const allowedOrigins = [
  "https://imperiorailing.com",
  "https://www.imperiorailing.com",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// app.use(logHistory("log.txt"));

app.use("/", userRouter);
app.use("/product", dealerRouter);
app.use("/", enquiryRouter);
app.use("/", jobapplicationRouter);

const GOOGLE_SHEET_WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbyxkgQzpx1ha9MACPolsGrewDCBCtd-a8N8VsBiGAOicAzhWMEFAvJON-99ZE6RyahFEQ/exec";

app.post("/submit", async (req, res) => {
  try {
    const response = await fetch(GOOGLE_SHEET_WEB_APP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    if (response.ok) {
      res.status(200).json({ message: "Data submitted successfully" });
    } else {
      res.status(500).json({ error: "Failed to submit data" });
    }
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});
// Test route
app.get("/test", (req, res) => {
  res.send("Test route is working");
});

app.post("/submit-form", async (req, res) => {
  try {
    const response = await axios.post(
      "https://script.google.com/macros/s/AKfycbw_qHdwPSyvj-RyG9QNQRDAQRFiyyjhXFSDsZpYksjPBas7Mmy7PxBwZ5-uaX3VDvh6/exec",
      req.body,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    res.send(response.data);
  } catch (error) {
    console.error("Error submitting form:", error.message);
    res.status(500).send("Error submitting form");
  }
});
app.post("/landing-form", async (req, res) => {
  try {
    const response = await axios.post(
      "https://script.google.com/macros/s/AKfycbyD8bll0gVWbOxhycG1pvAEv8l8DUs8fpYE3DzWFLqChuOtoZO1S8zTwIXOv3EtKYd1uw/exec",
      req.body,
      { headers: { "Content-Type": "application/json" } }
    );
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.json(response.data); // Send JSON response
  } catch (error) {
    console.error("Error submitting form:", error.message);
    res.status(500).json({ error: "Error submitting form" });
  }
});

// Handle preflight OPTIONS request
app.options("/submit-form", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.sendStatus(200);
});

app.options("/landing-form", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.sendStatus(200);
});

app.use("/api", otpRoutes);

app.use(errorhandeler);
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
