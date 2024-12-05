const mongoose = require("mongoose");

const Dbconnector = (url) => {
  return mongoose.connect(url);
};

module.exports = Dbconnector;
