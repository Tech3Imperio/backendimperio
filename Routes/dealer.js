// const express = require("express");
// const {
//   dealerRegisterationHandeler,
//   logindealers,
//   acceptDealerRegistration,
//   declineDealerRegistration,
// } = require("../Controllers/dealer");

// const {
//   registrationSchema,
//   loginSchema,
// } = require("../validators/dealervalidate.js");
// const validate = require("../Middleware/dealervalidates.js");

// const router = express.Router();

// router.post(
//   "/dealerregistration",
//   validate(registrationSchema),
//   dealerRegisterationHandeler
// );
// router.post("/dealerlogin", validate(loginSchema), logindealers);
// router.get("/dealer/accept/:email", acceptDealerRegistration);

// // Route to decline a dealer registration (admin action)
// router.get("/dealer/decline/:email", declineDealerRegistration);

// module.exports = router;

const express = require("express");
const {
  dealerRegistrationHandler,
  loginDealers,
  acceptDealerRegistration,
  declineDealerRegistration,
} = require("../Controllers/dealer.js");

const {
  registrationSchema,
  loginSchema,
} = require("../validators/dealervalidate.js");
const validate = require("../Middleware/dealervalidates.js");

const router = express.Router();

router.post(
  "/dealerregistration",
  validate(registrationSchema),
  dealerRegistrationHandler
);
router.post("/dealerlogin", validate(loginSchema), loginDealers);
router.get("/admin/accept-dealer/:email", acceptDealerRegistration); // Admin route to accept
router.get("/admin/decline-dealer/:email", declineDealerRegistration); // Admin route to decline

module.exports = router;
