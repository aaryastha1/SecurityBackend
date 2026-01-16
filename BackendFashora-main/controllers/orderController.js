// const Order = require("../models/Order");

// const placeOrder = async (req, res) => {
//   try {
//     const { fullName, address, phone, paymentMethod, items } = req.body;

//     const newOrder = new Order({
//       fullName,
//       address,
//       phone,
//       paymentMethod,
//       items
//     });

//     const savedOrder = await newOrder.save();
//     res.status(201).json(savedOrder);  // ✅ Respond with saved order
//   } catch (error) {
//     console.error("Order Error:", error);
//     res.status(500).json({ message: "Failed to place order" });
//   }
// };

// module.exports = { placeOrder };
