// const express = require("express");
// const router = express.Router();
// const productController = require("../../controllers/admin/productmanagement");
// const upload = require('../../middlewares/fileupload');

// // Create a new product
// router.post("/",  upload.single('image'), productController.createProduct);

// router.get("/:id", productController.getOneProduct);

// // Get all products (with pagination + search)
// router.get("/", productController.getProducts);

// // ✅ Create a new product (with image upload)
// router.post("/", upload.single('image'), productController.createProduct);

// // ✅ Get all products with pagination and search
// router.get("/", productController.getProducts);

// router.put('/:id', upload.single('image'), productController.updateProduct);

// router.delete('/:id', productController.deleteProduct);





// module.exports = router;



// // const express = require("express");
// // const router = express.Router();
// // const productController = require("../../controllers/admin/productmanagement");
// // const upload = require('../../middlewares/fileupload');

// // // ✅ Create product
// // router.post("/", upload.single('image'), productController.createProduct);

// // // ✅ Get all products (with pagination + search)
// // router.get("/", productController.getProducts);

// // // ✅ Get single product by ID
// // router.get("/:id", productController.getOneProduct);

// // // ✅ Update product
// // router.put("/:id", upload.single('image'), productController.updateProduct);

// // // ✅ Delete product
// // router.delete("/:id", productController.deleteProduct);

// // module.exports = router;




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
