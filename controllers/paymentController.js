const { stripeSecretKey, stripeApiKey } = require("../config/config");
const stirpe = require("stripe")(stripeSecretKey);

exports.processPayment = async (req, res, next) => {
  try {
    const payment = await stirpe.paymentIntents.create({
      amount: req.body.amount,
      currency: "BDT",
      metadata: {
        company: "Ecommerce",
      },
    });

    res.status(200).json({
      success: true,
      message: "Payment Success",
      client_secret: payment.client_secret,
    });
  } catch (error) {
    console.log(error.message);
    res.send({
      success: false,
      message: error.message,
    });
  }
};

exports.sendStripeKey = (req, res) => {
  try {
    res.status(200).json({
      success: true,
      stripeApiKey: stripeApiKey,
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
};
