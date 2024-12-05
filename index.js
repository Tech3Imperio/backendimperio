const express = require("express");
const errorhandeler = require("./Middleware/errorHandeler");
const userRouter = require("./Routes/user");
const dealerRouter = require("./Routes/dealer");
const Dbconnector = require("./DatabaseConnection/user");
const logHistory = require("./Middleware/user");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
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

// Test route
app.get("/test", (req, res) => {
  res.send("Test route is working");
});

app.use(errorhandeler);
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
