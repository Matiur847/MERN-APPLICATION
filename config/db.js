const mongoose = require("mongoose");
const { dbUrl } = require("../config/config");

mongoose
  .connect(dbUrl)
  .then(() => {
    console.log("DB is Connected!");
  })
  .catch((error) => {
    console.log("error---------------", error.message);
    process.exit(1);
  });
