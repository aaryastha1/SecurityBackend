const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: true,
    },
    sellerId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    image: {
      type: String, // image file name or URL
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    stock: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

module.exports = mongoose.model('Product', ProductSchema);


