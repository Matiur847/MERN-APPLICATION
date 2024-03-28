const { jwtSec } = require("../config/config");
const Product = require("../models/productModel");
const {
  Types: { ObjectId },
} = require("mongoose");
const filterProduct = require("../utils/filterProduct");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const cloudinary = require("cloudinary");

// create product -- Admin
exports.createProduct = async (req, res) => {
  try {
    let images = [];

    if (typeof req.body.images === "string") {
      images.push(req.body.images);
    } else {
      images = req.body.images;
    }

    const imagesLink = [];

    for (let i = 0; i < images.length; i++) {
      const allImage = await cloudinary.v2.uploader.upload(images[i], {
        folder: "products",
      });
      imagesLink.push({
        public_id: allImage.public_id,
        url: allImage.secure_url,
      });
    }

    const { token } = req.cookies;
    const decodeData = jwt.verify(token, jwtSec);
    req.body.user = decodeData.id;

    req.body.images = imagesLink;
    const product = await Product.create(req.body);
    return res.status(201).json({
      success: true,
      message: "Product create successfully",
      product,
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
};

// Get All Products -- ADMIN
exports.getAllProductsAdmin = async (req, res) => {
  const products = await Product.find();

  res.status(200).json({
    success: true,
    products,
  });
};

// Get All Products
exports.getAllProducts = async (req, res) => {
  try {
    const allProduct = await Product.find();
    const totalProduct = await Product.countDocuments();

    res.status(200).json({
      success: true,
      message: totalProduct,
      allProduct,
    });
  } catch (error) {}
};

// Product Per Page
exports.productPerPage = async (req, res) => {
  try {
    const resultPerPage = 8;
    const totalProduct = await Product.countDocuments();

    const FilterProduct = new filterProduct(Product.find(), req.query)
      .search()
      .filter()
      .pagination(resultPerPage);
    const allProduct = await FilterProduct.query;
    res.status(200).json({
      message: `Total Product ${totalProduct}`,
      totalProduct,
      allProduct,
      resultPerPage,
    });
  } catch (error) {
    res.status(500).json({
      message: "Somthing Error",
      error: error.message,
    });
  }
};

// get product detail
exports.getProductDetail = async (req, res) => {
  try {
    const id = req.params.id;

    if (ObjectId.isValid(id)) {
      const product = await Product.findById(id);
      return res.status(200).json({
        success: true,
        product,
      });
    }
    return res.status(404).json({
      success: false,
      message: "Product Not Found!",
    });
  } catch (error) {
    res.send(error.message);
  }
};

// update product
exports.updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    let product = await Product.findById(id);

    if (ObjectId.isValid(id)) {
      // cloudinary images set
      let images = [];

      if (typeof req.body.images === "string") {
        images.push(req.body.images);
      } else {
        images = req.body.images;
      }

      if (images !== undefined) {
        for (let i = 0; i < product.images.length; i++) {
          await cloudinary.v2.uploader.destroy(product.images[i].public_id);
        }

        const imagesLink = [];

        for (let i = 0; i < images.length; i++) {
          const allImage = await cloudinary.v2.uploader.upload(images[i], {
            folder: "products",
          });
          imagesLink.push({
            public_id: allImage.public_id,
            url: allImage.secure_url,
          });
        }

        req.body.images = imagesLink;
      }

      product = await Product.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      return res.status(200).json({
        success: true,
        message: "Product Update Successfully",
        product,
      });
    }
    return res.status(400).json({
      success: false,
      message: "Product Not Found!",
    });
  } catch (error) {
    res.send(error.message);
  }
};

// delete product
exports.deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;
    if (ObjectId.isValid(id)) {
      const product = await Product.findById(id);

      // also delete product images from cloudinary
      for (let i = 0; i < product.images.length; i++) {
        await cloudinary.v2.uploader.destroy(product.images[i].public_id);
      }

      await product.deleteOne();

      return res.status(200).json({
        success: true,
        message: "Product Delete Successfully",
        product,
      });
    }
    return res.status(404).json({
      success: false,
      message: "Product Not Found!",
    });
  } catch (error) {
    res.send(error.message);
  }
};

exports.addUserReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const { token } = req.cookies;
    const decodeData = jwt.verify(token, jwtSec);
    const user = await User.findById(decodeData.id);
    const product = await Product.findById(productId);

    const review = {
      user: decodeData.id,
      name: user.name,
      rating: Number(rating),
      comment,
    };

    const isReviewed = product.reviews.find(
      (revi) => revi.user.toString() === decodeData.id.toString()
    );

    if (isReviewed) {
      product.reviews.forEach((revi) => {
        if (revi.user.toString() === decodeData.id.toString())
          (revi.rating = rating), (revi.comment = comment);
      });
    } else {
      product.reviews.push(review);
      product.numOfReview = product.reviews.length;
    }

    let averageRating = 0;
    product.reviews.forEach((revi) => {
      averageRating += revi.rating;
    });
    product.ratings = averageRating / product.reviews.length;

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "Review Added Successfully",
    });
  } catch (error) {
    res.send({
      success: false,
      message: "Enter your valid product id",
    });
  }
};

// get all product review
exports.getProductReview = async (req, res) => {
  const productId = req.query.id;

  try {
    if (ObjectId.isValid(productId)) {
      const product = await Product.findById(productId);

      return res.status(200).json({
        success: true,
        message: product.reviews,
      });
    }

    return res.status(404).json({
      success: false,
      message: "Product Not Found",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Product Review
exports.deleteProductReview = async (req, res) => {
  try {
    const productId = req.query.productId;

    if (ObjectId.isValid(productId)) {
      const product = await Product.findById(productId);

      const reviews = product.reviews.filter(
        (rev) => rev._id.toString() !== req.query.id.toString()
      );

      let avg = 0;

      reviews.forEach((rev) => {
        avg += rev.rating;
      });

      let ratings = 0;

      if (reviews.length === 0) {
        ratings = 0;
      } else {
        ratings = avg / reviews.length;
      }

      const numOfReviews = reviews.length;

      await Product.findByIdAndUpdate(
        productId,
        {
          reviews,
          ratings,
          numOfReviews,
        },
        {
          new: true,
        }
      );

      return res.status(200).json({
        success: true,
      });
    }

    return res.status(404).json({
      success: false,
      message: "Product Not Found!",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
