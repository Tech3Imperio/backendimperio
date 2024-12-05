// const { z } = require("zod");

// const registrationSchema = z.object({
//   username: z
//     .string({
//       required_error: "First name is required",
//       invalid_type_error: "First name must be a string",
//     })
//     .trim()
//     .min(3, { message: "First name must be at least 3 characters long" })
//     .max(255, { message: "First name cannot be more than 255 characters" }),

//   phone: z
//     .string({
//       required_error: "Phone number is required",
//       invalid_type_error: "Phone number must be a string",
//     })
//     .trim()
//     .min(10, { message: "Phone number must be at least 10 digits long" })
//     .regex(/^\d{10}$/, { message: "Phone number must contain only 10 digits" }),
//   gst: z
//     .string({
//       required_error: "GST No is required",
//       invalid_type_error: "GST No must be a string",
//     })
//     .trim()
//     .min(3, { message: "GST No must be at least 3 characters long" })
//     .max(255, { message: "GST No cannot be more than 255 characters" }),

//   email: z
//     .string({
//       required_error: "Email is required",
//       invalid_type_error: "Email must be a string",
//     })
//     .trim()
//     .email({ message: "Please enter a valid email format" })
//     .min(3, { message: "Email must be at least 3 characters long" })
//     .max(255, { message: "Email cannot be more than 255 characters" }),

//   password: z
//     .string({
//       required_error: "Password is required",
//       invalid_type_error: "Password must be a string",
//     })
//     .trim()
//     .min(6, { message: "Password must be at least 6 characters long" })
//     .max(15, { message: "Password cannot be more than 15 characters" }),
// });

// const loginSchema = z.object({
//   email: z
//     .string({
//       required_error: "Email is required",
//       invalid_type_error: "Email must be a string",
//     })
//     .trim()
//     .email({ message: "Please enter a valid email format" })
//     .min(3, { message: "Email must be at least 3 characters long" })
//     .max(255, { message: "Email cannot be more than 255 characters" }),
//   password: z
//     .string({
//       required_error: "Password is required",
//       invalid_type_error: "Password must be a string",
//     })
//     .trim()
//     .min(6, { message: "Password must be at least 6 characters long" })
//     .max(15, { message: "Password cannot be more than 15 characters" }),
// });

// module.exports = { registrationSchema, loginSchema };

const { z } = require("zod");

const registrationSchema = z.object({
  username: z
    .string({
      required_error: "Username is required",
      invalid_type_error: "Username must be a string",
    })
    .trim()
    .min(3, { message: "Username must be at least 3 characters long" })
    .max(255, { message: "Username cannot be more than 255 characters" }),

  phone: z
    .string({
      required_error: "Phone number is required",
      invalid_type_error: "Phone number must be a string",
    })
    .trim()
    .min(10, { message: "Phone number must be at least 10 digits long" })
    .regex(/^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}$/, {
      message: "Phone number must be a valid format",
    }),

  gst: z
    .string({
      required_error: "GST No is required",
      invalid_type_error: "GST No must be a string",
    })
    .trim()
    .min(3, { message: "GST No must be at least 3 characters long" })
    .max(255, { message: "GST No cannot be more than 255 characters" }),

  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    })
    .trim()
    .email({ message: "Please enter a valid email format" })
    .min(3, { message: "Email must be at least 3 characters long" })
    .max(255, { message: "Email cannot be more than 255 characters" }),

  password: z
    .string({
      required_error: "Password is required",
      invalid_type_error: "Password must be a string",
    })
    .trim()
    .min(6, { message: "Password must be at least 6 characters long" })
    .max(15, { message: "Password cannot be more than 15 characters" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
      message:
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    }),
});

const loginSchema = z.object({
  // email: z
  //   .string({
  //     required_error: "Email is required",
  //     invalid_type_error: "Email must be a string",
  //   })
  //   .trim()
  //   .email({ message: "Please enter a valid email format" })
  //   .min(3, { message: "Email must be at least 3 characters long" })
  //   .max(255, { message: "Email cannot be more than 255 characters" }),
  phone: z
    .string({
      required_error: "Phone number is required",
      invalid_type_error: "Phone number must be a string",
    })
    .trim()
    .min(10, { message: "Phone number must be at least 10 digits long" })
    .regex(/^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}$/, {
      message: "Phone number must be a valid format",
    }),

  password: z
    .string({
      required_error: "Password is required",
      invalid_type_error: "Password must be a string",
    })
    .trim()
    .min(6, { message: "Password must be at least 6 characters long" })
    .max(15, { message: "Password cannot be more than 15 characters" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
      message:
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    }),
});

module.exports = { registrationSchema, loginSchema };
