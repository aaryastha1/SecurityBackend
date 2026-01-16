// const express = require('express');
// const router = express.Router();
// const categoryController = require('../../controllers/admin/categorymanagement');
// const upload = require('../../middlewares/fileupload'); // multer setup

// router.post(
//     '/', 
//     upload.single("image"),
//     // req.file, req.files from next function
//     // get image, file metadata
//     categoryController.createCategory
// );
// router.get('/', categoryController.getAllCategories);
// router.get('/:id', categoryController.getCategoryById);
// router.put('/:id', 
//     upload.single("image"),
//     categoryController.updateCategory);
// router.delete('/:id', categoryController.deleteCategory);

// module.exports = router;



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
