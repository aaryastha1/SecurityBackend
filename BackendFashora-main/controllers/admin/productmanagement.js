

const mongoose = require("mongoose");
const Product = require("../../models/Product");

// Create product
exports.createProduct = async (req, res) => {
  const { name, price, categoryId, userId, description } = req.body;
  const imageFile = req.file;

  if (!name || !price || !categoryId || !userId || !description) {
    return res.status(403).json({
      success: false,
      message: "Missing field",
    });
  }

  // Validate ObjectIds
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    return res.status(400).json({ success: false, message: "Invalid categoryId" });
  }
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ success: false, message: "Invalid userId" });
  }

  try {
    const product = new Product({
      name,
      price,
      categoryId,
      description,
      sellerId: userId,
      image: imageFile ? imageFile.filename : '',
    });

    await product.save();

    return res.status(200).json({
      success: true,
      data: product,
      message: "New Product Created",
    });
  } catch (err) {
    console.error("createProduct error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ✅ Get all products
exports.getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    let filter = {};
    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const skips = (page - 1) * limit;

    const products = await Product.find(filter)
      .populate("categoryId", "name")
      .populate("sellerId", "firstName email")
      .skip(skips)
      .limit(Number(limit));

    const total = await Product.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      products,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("getProducts error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ✅ Get single product (used in view page)
exports.getOneProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("categoryId", "name")
      .populate("sellerId", "firstName email");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (err) {
    console.error("getOneProduct error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ✅ Update product
exports.updateProduct = async (req, res) => {
  try {
    const imageFile = req.file?.filename;
    const { name, price, categoryId, userId, description} = req.body;

    // Validate ObjectIds if present
    if (categoryId && !mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ success: false, message: "Invalid categoryId" });
    }
    if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid userId" });
    }

    const updateData = {
      ...(name && { name }),
      ...(price && { price }),
      ...(categoryId && { categoryId }),
      ...(description && {description}),
      ...(userId && { sellerId: userId }),
      
    };

    if (imageFile) {
      updateData.image = imageFile;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
      message: "Product updated",
    });
  } catch (err) {
    console.error("updateProduct error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ✅ Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const result = await Product.findByIdAndDelete(req.params.id);
    if (!result)
      return res.status(404).json({ success: false, message: "Product not found" });

    return res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};


// const mongoose = require("mongoose");
// const Product = require("../../models/Product");

// // ✅ Create a new product
// exports.createProduct = async (req, res) => {
//   const { name, price, categoryId, userId, description } = req.body;
//   const imageFile = req.file;

//   // Validate required fields
//   if (!name || !price || !categoryId || !userId || !description) {
//     return res.status(403).json({
//       success: false,
//       message: "Missing required field(s)",
//     });
//   }

//   // Validate MongoDB IDs
//   if (!mongoose.Types.ObjectId.isValid(categoryId)) {
//     return res.status(400).json({ success: false, message: "Invalid categoryId" });
//   }
//   if (!mongoose.Types.ObjectId.isValid(userId)) {
//     return res.status(400).json({ success: false, message: "Invalid userId" });
//   }

//   try {
//     const product = new Product({
//       name,
//       price: price.trim(), // Safe for string inputs
//       categoryId,
//       description,
//       sellerId: userId,
//       image: imageFile ? imageFile.filename : '',
//     });

//     await product.save();

//     return res.status(200).json({
//       success: true,
//       data: product,
//       message: "New product created successfully",
//     });
//   } catch (err) {
//     console.error("createProduct error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };



// // ✅ Get all products (with search + pagination)
// exports.getProducts = async (req, res) => {
//   try {
//     const { page = 1, limit = 10, search = "" } = req.query;
//     const skip = (page - 1) * limit;

//     const filter = search
//       ? {
//           name: { $regex: search, $options: "i" }
//         }
//       : {};

//     const products = await Product.find(filter)
//       .populate("categoryId", "name")
//       .populate("sellerId", "firstName email")
//       .skip(skip)
//       .limit(Number(limit));

//     const total = await Product.countDocuments(filter);

//     return res.status(200).json({
//       success: true,
//       message: "Products fetched successfully",
//       products,
//       pagination: {
//         total,
//         page: Number(page),
//         limit: Number(limit),
//         totalPages: Math.ceil(total / limit),
//       },
//     });
//   } catch (err) {
//     console.error("getProducts error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };



// // ✅ Get one product by ID
// exports.getOneProduct = async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id)
//       .populate("categoryId", "name")
//       .populate("sellerId", "firstName email");

//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         message: "Product not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: product,
//     });
//   } catch (err) {
//     console.error("getOneProduct error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };



// // ✅ Update product
// exports.updateProduct = async (req, res) => {
//   try {
//     const { name, price, categoryId, userId, description } = req.body;
//     const imageFile = req.file?.filename;

//     // Validate optional MongoDB IDs
//     if (categoryId && !mongoose.Types.ObjectId.isValid(categoryId)) {
//       return res.status(400).json({ success: false, message: "Invalid categoryId" });
//     }
//     if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({ success: false, message: "Invalid userId" });
//     }

//     const updateData = {
//       ...(name && { name }),
//       ...(price && { price: price.trim() }), // accept text like "Rs. 1500" or "20%OFF"
//       ...(categoryId && { categoryId }),
//       ...(description && { description }),
//       ...(userId && { sellerId: userId }),
//     };

//     if (imageFile) updateData.image = imageFile;

//     const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
//       new: true,
//     });

//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         message: "Product not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: product,
//       message: "Product updated successfully",
//     });
//   } catch (err) {
//     console.error("updateProduct error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };



// // ✅ Delete product
// exports.deleteProduct = async (req, res) => {
//   try {
//     const result = await Product.findByIdAndDelete(req.params.id);

//     if (!result) {
//       return res.status(404).json({
//         success: false,
//         message: "Product not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Product deleted successfully",
//     });
//   } catch (err) {
//     console.error("deleteProduct error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };
