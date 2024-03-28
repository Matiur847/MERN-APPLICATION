const express = require("express");
const {
  createProduct,
  updateProduct,
  deleteProduct,
  getProductDetail,
  addUserReview,
  getProductReview,
  deleteProductReview,
  productPerPage,
  getAllProducts,
  getAllProductsAdmin,
} = require("../controllers/productController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const router = express.Router();

router.get("/products", getAllProducts);

router.get(
  "/admin/all/products",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  getAllProductsAdmin
);

router.get("/productPerPage", productPerPage);

router.post(
  "/product/new",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  createProduct
);
router.put(
  "/product/:id",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  updateProduct
);
router.delete(
  "/product/:id",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  deleteProduct
);
router.get("/product/:id", getProductDetail);
router.put("/review", isAuthenticatedUser, addUserReview);
router.get("/reviews", getProductReview);
router.delete("/reviews", isAuthenticatedUser, deleteProductReview);

module.exports = router;
