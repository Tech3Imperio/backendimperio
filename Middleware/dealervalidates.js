const validate = (schema) => async (req, res, next) => {
  try {
    const passBody = await schema.parseAsync(req.body);
    req.body = passBody;
    next();
  } catch (err) {
    const status = 404;
    const message = "Input filed error";
    const extraDetails = err.errors[0].message;
    const error = {
      status,
      message,
      extraDetails,
    };
    next(error);
  }
};

module.exports = validate;
// const validate = (schema) => async (req, res, next) => {
//   try {
//     // Log the schema and incoming request data for debugging
//     console.log("Schema:", schema);
//     console.log("Request Body:", req.body);

//     // Parse the request body using Zod schema
//     const parsedBody = await schema.parseAsync(req.body);
//     req.body = parsedBody; // Save the validated data in the request body
//     next(); // Proceed to the next middleware or route handler
//   } catch (err) {
//     // Log the error for debugging
//     console.error("Validation Error:", err);

//     const status = 400; // Validation errors typically return status 400
//     const message = "Input validation error";
//     let extraDetails = "Unknown error"; // Default message in case no specific error is found

//     // Check if the error has a list of validation issues (Zod error format)
//     if (err.errors && Array.isArray(err.errors) && err.errors.length > 0) {
//       // If errors exist, grab the first validation error message
//       extraDetails = err.errors.map((error) => error.message).join(", ");
//     } else {
//       // If no specific validation message is found, log the full error for debugging
//       console.error("Zod Validation Error:", err);
//     }

//     // Construct the error response
//     const error = {
//       status,
//       message,
//       extraDetails,
//     };

//     // Pass the error to the next middleware (e.g., error handler)
//     next(error);
//   }
// };

// module.exports = validate;
