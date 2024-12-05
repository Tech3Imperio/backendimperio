const fs = require("fs");

const logHistory = (fileName) => {
  return (req, res, next) => {
    const log = `${new Date().toISOString()} ${req.method} ${req.path} ${
      req.ip
    } New Request Received\n`;

    // Write the log to the specified file
    fs.appendFile(fileName, log, (err) => {
      if (err) {
        console.error("Error writing to log file", err);
      }
      // Call next() after the log has been written
      next();
    });
  };
};

module.exports = logHistory;
