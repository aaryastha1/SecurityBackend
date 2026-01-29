


const express = require("express");
const router = express.Router();
const categoryController = require("../../controllers/admin/categorymanagement");
const upload = require("../../middlewares/fileupload");

const {
  authenticateUser,
  isAdmin
} = require("../../middlewares/authorizedUser");

// 🔒 CREATE CATEGORY (ADMIN ONLY)
router.post(
  "/",
  authenticateUser,
  isAdmin,
  upload.single("image"),
  categoryController.createCategory
);

// 🔓 GET ALL CATEGORIES (PUBLIC)
router.get("/", categoryController.getAllCategories);

// 🔓 GET CATEGORY BY ID (PUBLIC)
router.get("/:id", categoryController.getCategoryById);

// 🔒 UPDATE CATEGORY (ADMIN ONLY)
router.put(
  "/:id",
  authenticateUser,
  isAdmin,
  upload.single("image"),
  categoryController.updateCategory
);

// 🔒 DELETE CATEGORY (ADMIN ONLY)
router.delete(
  "/:id",
  authenticateUser,
  isAdmin,
  categoryController.deleteCategory
);

module.exports = router;
