require("dotenv").config();

const configData = {
  port: process.env.PORT,
  dbUrl: process.env.DB_URL,
  jwtSec: process.env.JWT_SEC,
  jwtExp: process.env.JWT_EXP,
  smptMail: process.env.SMPT_MAIL,
  smptPassword: process.env.SMPT_PASSWORD,
  smptService: process.env.SMPT_SERVICE,
  cloudName: process.env.CLOUD_NAME,
  apiKey: process.env.API_KEY,
  apiSecret: process.env.API_SECRET,
  clientUrl: process.env.CLIENR_URL,
  stripeApiKey: process.env.STRIPE_API_KEY,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  nodeEnv: process.env.NODE_ENV,
};

module.exports = configData;
