const errorhandeler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "backend credential error";
  const extraDetails = err.extraDetails || "Server creashed";

  return res.status(status).json({ message, extraDetails });
};

module.exports = errorhandeler;
