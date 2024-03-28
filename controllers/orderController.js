const { jwtSec } = require("../config/config");
const jwt = require("jsonwebtoken");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const {
  Types: { ObjectId },
} = require("mongoose");

// create new order
exports.createOrder = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    const decodeData = jwt.verify(token, jwtSec);
    const {
      shippingInfo,
      orderItems,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    const order = await Order.create({
      shippingInfo,
      orderItems,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      paidAt: Date.now(),
      user: decodeData.id,
    });

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    return res.status(200).json({
      success: false,
      message: error.message,
    });
  }
};

// get specific order details
exports.getSingleOrder = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (ObjectId.isValid(id)) {
      const order = await Order.findById(id).populate("user", "name email");

      return res.status(200).json({
        success: true,
        order,
      });
    }

    return res.status(404).json({
      success: false,
      message: "Product Not Found, invalid id",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// get current logged in user orders
exports.myOrders = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    const decodeData = jwt.verify(token, jwtSec);
    const orders = await Order.find({ user: decodeData.id });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// get all order -- ADMIN
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();

    let totalAmount = 0;

    orders.forEach((order) => {
      totalAmount += order.totalPrice;
    });

    return res.status(200).json({
      success: true,
      totalAmount,
      orders,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// order status update -- ADMIN
exports.updateOrder = async (req, res) => {
  try {
    const id = req.params.id;
    if (ObjectId.isValid(id)) {
      const order = await Order.findById(id);

      if (order.orderStatus === "Delivered") {
        return res.status(200).json({
          success: false,
          message: "Order has been already delivered",
        });
      }

      if (order.orderStatus === "Shipped") {
        order.orderItems.forEach(async (order) => {
          await updateStock(order.id, order.quantity);
        });
      }

      order.orderStatus = req.body.status;

      if (req.body.status === "Delivered") {
        order.deliveredAt = Date.now();
      }

      await order.save({ validateBeforeSave: false });

      return res.status(200).json({
        success: true,
        message: order.orderStatus,
      });
    }
    return res.status(400).json({
      success: false,
      message: "Enter Valid Order ID",
    });
  } catch (error) {
    return res.status(200).json({
      success: false,
      message: error.message,
    });
  }
};

async function updateStock(id, quantity) {
  const product = await Product.findById(id);

  product.stock -= quantity;

  product.save({ validateBeforeSave: false });
}

// delete order
exports.deleteOrder = async (req, res) => {
  try {
    const id = req.params.id;
    if (ObjectId.isValid(id)) {
      const order = await Order.findByIdAndDelete(id);

      return res.status(200).json({
        success: true,
        message: "Order has been delete successfully",
        order,
      });
    }
    return res.send({
      success: false,
      message: "Error: invalid order ID",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
