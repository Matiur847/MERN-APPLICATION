const express = require("express");
const productRoute = require("./router/productRoute");
const userRoute = require("./router/userRoute");
const orderRoute = require("./router/orderRoute");
const payment = require("./router/paymentRoute");
const bodyParser = require("body-parser");
const cloudinary = require("cloudinary");
const fileUpload = require("express-fileupload");
const app = express();
require("./config/db");
const path = require("path");

const cors = require("cors");
const cookieParser = require("cookie-parser");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(fileUpload());

app.use("/api/v1", productRoute);
app.use("/api/v1", userRoute);
app.use("/api/v1", orderRoute);
app.use("/api/v1", payment);

app.use(express.static(path.join(__dirname + "/client/build")));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname + "/client/build/index.html"));
});

app.use((req, res) => {
  res.send("Route Not Found!");
});

// error handler

module.exports = app;
