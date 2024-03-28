const express = require("express");
const router = express.Router();
const { isAuthenticatedUser } = require("../middleware/auth");
const { processPayment, sendStripeKey } = require("../controllers/paymentController");

router.post('/payment/process', isAuthenticatedUser, processPayment)
router.get('/stripeApiKey', isAuthenticatedUser, sendStripeKey)

module.exports = router;
