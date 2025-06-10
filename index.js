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

// Send Phone OTP endpoint
app.post("/api/send-phone-otp", async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        Status: "Error",
        Details: "Phone number is required",
      });
    }

    // Your 2factor API key - store this in environment variables
    const apiKey = process.env.TWOFACTOR_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        Status: "Error",
        Details: "API key not configured",
      });
    }

    // 2factor API endpoint for sending OTP
    const url = `https://2factor.in/API/V1/${apiKey}/SMS/${phoneNumber}/AUTOGEN`;

    const response = await fetch(url, {
      method: "GET",
    });

    // Check if response is ok
    if (!response.ok) {
      return res.status(400).json({
        Status: "Error",
        Details: `HTTP error! status: ${response.status}`,
      });
    }

    // Get response as text first
    const responseText = await response.text();

    if (!responseText || responseText.trim() === "") {
      return res.status(400).json({
        Status: "Error",
        Details: "Empty response from server",
      });
    }

    // Try to parse JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Response text:", responseText);
      return res.status(400).json({
        Status: "Error",
        Details: "Invalid response format from server",
      });
    }

    if (data.Status === "Success") {
      return res.json({
        Status: "Success",
        Details: data.Details, // This is the session ID
      });
    } else {
      return res.status(400).json({
        Status: "Error",
        Details: data.Details || "Failed to send OTP",
      });
    }
  } catch (error) {
    console.error("Error sending OTP:", error);
    return res.status(500).json({
      Status: "Error",
      Details: "Internal server error",
    });
  }
});

// Verify Phone OTP endpoint
app.post("/api/verify-phone-otp", async (req, res) => {
  try {
    const { sessionId, otp } = req.body;

    if (!sessionId || !otp) {
      return res.status(400).json({
        Status: "Error",
        Details: "Session ID and OTP are required",
      });
    }

    const apiKey = process.env.TWOFACTOR_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        Status: "Error",
        Details: "API key not configured",
      });
    }

    // 2factor API endpoint for verifying OTP
    const url = `https://2factor.in/API/V1/${apiKey}/SMS/VERIFY/${sessionId}/${otp}`;

    const response = await fetch(url, {
      method: "GET",
    });

    if (!response.ok) {
      return res.status(400).json({
        Status: "Error",
        Details: `HTTP error! status: ${response.status}`,
      });
    }

    const responseText = await response.text();

    if (!responseText || responseText.trim() === "") {
      return res.status(400).json({
        Status: "Error",
        Details: "Empty response from server",
      });
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Response text:", responseText);
      return res.status(400).json({
        Status: "Error",
        Details: "Invalid response format from server",
      });
    }

    if (data.Status === "Success") {
      return res.json({
        Status: "Success",
        Details: data.Details,
      });
    } else {
      return res.status(400).json({
        Status: "Error",
        Details: data.Details || "Invalid OTP",
      });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({
      Status: "Error",
      Details: "Internal server error",
    });
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

// Add new endpoint to fetch quotation data with images
app.get("/get-quotation", async (req, res) => {
  try {
    const { orderId } = req.query;

    // Fetch quotation data from Google Sheet
    const response = await axios.get(
      "https://script.google.com/macros/s/AKfycbyGliJ9kC9zhN4ShItCtCatIe-GCB98yVo0z9uVa8k0ToaPfKM7LupxuiBiDkgZJ2Ug/exec",
      {
        params: {
          sheet: "Quotations",
          orderId: orderId,
        },
      }
    );

    // Fetch product images from Google Sheet
    const imagesResponse = await axios.get(
      "https://script.google.com/macros/s/AKfycbyGliJ9kC9zhN4ShItCtCatIe-GCB98yVo0z9uVa8k0ToaPfKM7LupxuiBiDkgZJ2Ug/exec",
      {
        params: {
          sheet: "ProductImages",
        },
      }
    );

    // Combine quotation data with images
    const quotationData = response.data;
    const productImages = imagesResponse.data;

    // Find matching images for the products
    const baseImage = productImages.find(
      (img) => img.product === quotationData.base && img.type === "base"
    )?.imageUrl;

    const handrailImage = productImages.find(
      (img) => img.product === quotationData.handrail && img.type === "handrail"
    )?.imageUrl;

    const combinationImage = productImages.find(
      (img) =>
        img.base === quotationData.base &&
        img.handrail === quotationData.handrail
    )?.imageUrl;

    // Add images to quotation data
    const finalQuotationData = {
      ...quotationData,
      baseImage,
      handrailImage,
      combinationImage,
    };

    res.json(finalQuotationData);
  } catch (error) {
    console.error("Error fetching quotation:", error);
    res.status(500).json({ error: "Failed to fetch quotation data" });
  }
});

app.use(errorhandeler);
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
