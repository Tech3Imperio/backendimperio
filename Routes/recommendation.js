const express = require("express");
import { spawn } from "child_process";
import path from "path";
app.post("/recommend", (req, res) => {
  const pythonProcess = spawn("python", [
    path.join(__dirname, "ml_model.py"),
    JSON.stringify(req.body),
  ]);

  let result = "";

  pythonProcess.stdout.on("data", (data) => {
    result += data.toString();
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  pythonProcess.on("close", (code) => {
    if (code !== 0) {
      res
        .status(500)
        .json({ error: "An error occurred while processing the request." });
    } else {
      try {
        const recommendation = JSON.parse(result);
        res.status(200).json(recommendation);
      } catch (error) {
        res.status(500).json({ error: "Failed to parse the recommendation." });
      }
    }
  });
});
