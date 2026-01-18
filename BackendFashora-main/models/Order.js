// const mongoose = require("mongoose");

// const orderSchema = new mongoose.Schema({
//   fullName: {
//     type: String,
//     required: true
//   },
//   address: {
//     type: String,
//     required: true
//   },
//   phone: {
//     type: String,
//     required: true
//   },
//   paymentMethod: {
//     type: String,
//     enum: ['cod', 'esewa'],
//     default: 'cod'
//   },
//   items: [
//     {
//       productId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Product",
//         required: true
//       },
//       quantity: {
//         type: Number,
//         required: true,
//         min: 1
//       }
//     }
//   ],
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// module.exports = mongoose.model("Order", orderSchema);


const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },

  paymentMethod: {
    type: String,
    enum: ["cod", "esewa"],
    default: "cod",
  },

  paymentStatus: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "pending",
  },

  esewaRefId: String,

  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: { type: Number, required: true, min: 1 },
    },
  ],

  totalAmount: { type: Number, required: true },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
