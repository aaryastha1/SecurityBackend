
const express = require("express");
const router = express.Router();
const productController = require("../../controllers/admin/productmanagement");
const upload = require("../../middlewares/fileupload");

const {
  authenticateUser,
  isAdmin
} = require("../../middlewares/authorizedUser");

// 🔒 CREATE PRODUCT (ADMIN ONLY)
router.post(
  "/",
  authenticateUser,
  isAdmin,
  upload.single("image"),
  productController.createProduct
);

// 🔓 GET ALL PRODUCTS (PUBLIC)
router.get("/", productController.getProducts);

// 🔓 GET ONE PRODUCT (PUBLIC)
router.get("/:id", productController.getOneProduct);

// 🔒 UPDATE PRODUCT (ADMIN ONLY)
router.put(
  "/:id",
  authenticateUser,
  isAdmin,
  upload.single("image"),
  productController.updateProduct
);

// 🔒 DELETE PRODUCT (ADMIN ONLY)
router.delete(
  "/:id",
  authenticateUser,
  isAdmin,
  productController.deleteProduct
);

module.exports = router;
