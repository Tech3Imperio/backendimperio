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

app.use(
  cors({
    origin: [
      "https://imperiorailing.com",
      "https://www.imperiorailing.com",
      "http://localhost:5173",
    ],
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type",
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
// "https://script.google.com/macros/s/AKfycbyq0xTgh4StifjEfUpXFGXaJMmWabRJTKZYwmypiHgSW5uwBOO0cVsCcjsW1GwIgyY9OQ/exec"
app.post("/submit-form", async (req, res) => {
  try {
    const response = await axios.post(
      "https://script.google.com/macros/s/AKfycbyCGf2TT2YK60eqF27mee8LKCvV0eBCuopNxG-Ye9VSPVN4QI2QU1Hgc8RNJmzMqRqT/exec",
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

app.use(errorhandeler);
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
