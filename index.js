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
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// app.use(logHistory("log.txt"));

app.use("/", userRouter);
app.use("/product", dealerRouter);
app.use("/", enquiryRouter);
app.use("/", jobapplicationRouter);
app.options("*", cors(allowedOrigins));
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

app.post("/contest-form", async (req, res) => {
  try {
    const response = await axios.post(
      "https://script.google.com/macros/s/AKfycbyycbtgXfnmpGPLbBQomTqaVRX3RwbF6zObTg8VKZmZSqJES0uRhZpsw_E3fV0_aOTosw/exec",
      req.body,
      { headers: { "Content-Type": "application/json" } }
    );
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.json(response.data);
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

    // Message Central API credentials - store these in environment variables
    const authToken = process.env.MESSAGE_CENTRAL_AUTH_TOKEN;
    const customerId = process.env.MESSAGE_CENTRAL_CUSTOMER_ID;

    if (!authToken || !customerId) {
      return res.status(500).json({
        Status: "Error",
        Details: "Message Central API credentials not configured",
      });
    }

    // Extract country code and mobile number
    // Assuming phoneNumber comes as full number like "918976964817"
    let countryCode = "91"; // Default to India
    let mobileNumber = phoneNumber;

    // If phone number starts with country code, extract it
    if (phoneNumber.length > 10) {
      countryCode = phoneNumber.substring(0, phoneNumber.length - 10);
      mobileNumber = phoneNumber.substring(phoneNumber.length - 10);
    }

    // Message Central API endpoint for sending OTP
    const url = `https://cpaas.messagecentral.com/verification/v3/send?countryCode=${countryCode}&customerId=${customerId}&flowType=WHATSAPP&mobileNumber=${mobileNumber}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        authToken: authToken,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return res.status(400).json({
        Status: "Error",
        Details: `HTTP error! status: ${response.status}`,
      });
    }

    const data = await response.json();

    if (data.responseCode === 200 && data.message === "SUCCESS") {
      return res.json({
        Status: "Success",
        Details: data.data.verificationId, // Using verificationId as session ID equivalent
      });
    } else {
      return res.status(400).json({
        Status: "Error",
        Details: data.message || "Failed to send OTP",
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

// Replace the existing /api/verify-phone-otp endpoint with this corrected version:
app.post("/api/verify-phone-otp", async (req, res) => {
  try {
    const { sessionId, otp } = req.body; // sessionId is actually verificationId from Message Central

    console.log("Received verification request:", { sessionId, otp }); // Debug log

    if (!sessionId || !otp) {
      return res.status(400).json({
        Status: "Error",
        Details: "Verification ID and OTP are required",
      });
    }

    const authToken = process.env.MESSAGE_CENTRAL_AUTH_TOKEN;
    const customerId = process.env.MESSAGE_CENTRAL_CUSTOMER_ID;

    console.log("Environment check:", {
      hasAuthToken: !!authToken,
      hasCustomerId: !!customerId,
    }); // Debug log

    if (!authToken || !customerId) {
      return res.status(500).json({
        Status: "Error",
        Details: "Message Central API credentials not configured",
      });
    }

    // Message Central API endpoint for validating OTP
    const url = `https://cpaas.messagecentral.com/verification/v3/validateOtp?countryCode=91&customerId=${customerId}&verificationId=${sessionId}&code=${otp}`;

    console.log("Making request to:", url); // Debug log (remove in production)

    const response = await fetch(url, {
      method: "GET",
      headers: {
        authToken: authToken,
        "Content-Type": "application/json",
      },
    });

    console.log("Response status:", response.status); // Debug log

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText); // Debug log
      return res.status(400).json({
        Status: "Error",
        Details: `API error: ${response.status} - ${errorText}`,
      });
    }

    const data = await response.json();
    console.log("API Response:", data); // Debug log
    console.log("typeof responseCode:", typeof data.responseCode);
    console.log(
      "typeof verificationStatus:",
      typeof data.data?.verificationStatus
    );
    // FIXED: Check the correct response format from backend
    if (
      data.responseCode === 200 &&
      data.message === "SUCCESS" &&
      data.data &&
      data.data.verificationStatus === "VERIFICATION_COMPLETED"
    ) {
      console.log("Verification successful!");
      return res.status(200).json({
        Status: "Success",
        Details: "OTP verified successfully",
      });
    } else if (
      data.responseCode === 705 ||
      data.message === "VERIFICATION_EXPIRED"
    ) {
      return res.status(400).json({
        Status: "Error",
        Details: "OTP has expired. Please request a new one.",
      });
    } else {
      return res.status(400).json({
        Status: "Error",
        Details: data.message || data.data?.errorMessage || "Invalid OTP",
      });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({
      Status: "Error",
      Details: "Internal server error: " + error.message,
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
