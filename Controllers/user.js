// const Dealertdata = require("../Models/user");

// const handelPostData = async (req, res) => {
//   const {
//     fullName,
//     organizationName,
//     email,
//     phone,
//     streetAddress,
//     website,
//     city,
//     stateProvince,
//     zipPostalCode,
//     typeOfProductsOrIndustry,
//     numberOfYearsInBusiness,
//   } = req.body;

//   if (
//     !fullName ||
//     !organizationName ||
//     !email ||
//     !phone ||
//     !streetAddress ||
//     !website ||
//     !city ||
//     !stateProvince ||
//     !zipPostalCode ||
//     !typeOfProductsOrIndustry ||
//     !numberOfYearsInBusiness
//   ) {
//     return res.status(400).json({ error: "All fields are required" });
//   }

//   try {
//     const result = await Dealertdata.create({
//       fullName,
//       organizationName,
//       email,
//       phone,
//       streetAddress,
//       website,
//       city,
//       stateProvince,
//       zipPostalCode,
//       typeOfProductsOrIndustry,
//       numberOfYearsInBusiness,
//     });

//     console.log(result);
//     console.log("dealership page");
//     return res
//       .status(201)
//       .json({ message: "Data Submitted Successfully", data: result });
//   } catch (error) {
//     console.error("Error submitting data:", error);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// const handleGetJsonData = async (req, res) => {
//   const allDb = await Dealertdata.find({});
//   return res.status(200).json(allDb);
// };

// module.exports = { handelPostData, handleGetJsonData }; // Ensure it's exported as an object

const Dealertdata = require("../Models/user");
const nodemailer = require("nodemailer");
require("dotenv").config();

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail email
    pass: process.env.EMAIL_PASS, // Your Gmail app password
  },
});

// Function to send email notification
const sendEmailNotification = async (formData) => {
  const mailOptions = {
    from: process.env.EMAIL_USER, // Sender's email
    to: "sales@imperiorailing.com", // Receiver's email
    subject: "New Dealer Details Submitted",
    text: `A new dealer has submitted their details. Here are the details:\n
      Full Name: ${formData.fullName}
      Organization: ${formData.organizationName}
      Email: ${formData.email}
      Phone: ${formData.phone}
      Address: ${formData.streetAddress}, ${formData.city}, ${formData.stateProvince}, ${formData.zipPostalCode}
      Website: ${formData.website}
      Industry: ${formData.typeOfProductsOrIndustry}
      Years in Business: ${formData.numberOfYearsInBusiness}
      How Much AMT Invest : ${formData.HowMuchAmountcanyouinvestindealership}
      How Much Area Display : ${formData.Howmuchareacanyouprovidefordisplay}
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

// POST Handler
const handelPostData = async (req, res) => {
  const {
    fullName,
    organizationName,
    email,
    phone,
    streetAddress,
    city,
    stateProvince,
    zipPostalCode,
    typeOfProductsOrIndustry,
    numberOfYearsInBusiness,
    HowMuchAmountcanyouinvestindealership,
    Howmuchareacanyouprovidefordisplay,
    website,
  } = req.body;

  // Validate required fields
  if (
    !fullName ||
    !organizationName ||
    !email ||
    !phone ||
    !streetAddress ||
    !city ||
    !stateProvince ||
    !zipPostalCode ||
    !typeOfProductsOrIndustry ||
    !numberOfYearsInBusiness

  ) {
    return res
      .status(400)
      .json({ error: "All required fields must be provided" });
  }

  try {
    // Save form data to MongoDB
    const result = await Dealertdata.create({
      fullName,
      organizationName,
      email,
      phone,
      streetAddress,
      city,
      stateProvince,
      zipPostalCode,
      typeOfProductsOrIndustry,
      numberOfYearsInBusiness,
      HowMuchAmountcanyouinvestindealership,
      Howmuchareacanyouprovidefordisplay,
      website,
    });

    // Send email notification
    await sendEmailNotification(req.body);

    console.log(result);
    console.log("dealership page");
    return res
      .status(201)
      .json({ message: "Data Submitted Successfully", data: result });
  } catch (error) {
    console.error("Error submitting data:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// GET Handler
const handleGetJsonData = async (req, res) => {
  try {
    const allDb = await Dealertdata.find({});
    return res.status(200).json(allDb);
  } catch (error) {
    return res.status(500).json({ error: "Error fetching data" });
  }
};

module.exports = { handelPostData, handleGetJsonData };
