// const express = require("express");
// const router = express.Router();
// const Order = require("../../models/Order");

// // POST /api/orders/place
// router.post("/place", async (req, res) => {
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
//     res.status(201).json(savedOrder);
//   } catch (err) {
//     console.error("Error placing order:", err);
//     res.status(400).json({ success: false, message: err.message });
//   }


// });




// router.get("/", async (req, res) => {
//   try {
//     const orders = await Order.find()
//       .sort({ createdAt: -1 })
//       .populate("items.productId", "name image price");

//     res.json(orders); // ✅ correct: sends an array directly
//   } catch (err) {
//     console.error("Error fetching orders:", err);
//     res.status(500).json({ success: false, message: "Failed to fetch orders" });
//   }
// });



// module.exports = router;



const express = require("express");
const router = express.Router();
const Order = require("../../models/Order");

// POST /api/orders/place
router.post("/place", async (req, res) => {
  try {
    const { fullName, address, phone, paymentMethod, items } = req.body;

    // Basic validation: required fields and items array non-empty
    if (
      !fullName ||
      !address ||
      !phone ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields or items" });
    }

    const newOrder = new Order({
      fullName,
      address,
      phone,
      paymentMethod,
      items,
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (err) {
    console.error("Error placing order:", err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET all orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("items.productId", "name image price");

    res.json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
});

module.exports = router;
