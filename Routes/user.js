const express = require("express");
const { handelPostData, handleGetJsonData } = require("../Controllers/user.js");

const router = express.Router();

router.post("/dealerships", handelPostData);
router.get("/api", handleGetJsonData);

module.exports = router;
