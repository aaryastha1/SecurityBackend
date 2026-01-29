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


const crypto = require("crypto");
const axios = require("axios");
const Order = require("../models/Order");

// 1️⃣ PLACE ORDER
exports.placeOrder = async (req, res) => {
  try {
    const { fullName, address, phone, paymentMethod, items } = req.body;

    if (!items || items.length === 0)
      return res.status(400).json({ message: "Cart is empty" });

    const shipping = 150;
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalAmount = subtotal + shipping;

    const order = await Order.create({
      fullName,
      address,
      phone,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "success" : "pending",
      items: items.map(i => ({
        productId: i.productId,
        quantity: i.quantity,
      })),
      totalAmount,
    });

    if (paymentMethod === "cod") {
      return res.json({
        success: true,
        message: "Order placed (COD)",
        order,
      });
    }

    // eSewa → send orderId and total
    res.json({
      success: true,
      orderId: order._id,
      amount: totalAmount,
    });
  } catch (err) {
    console.error("PLACE_ORDER_ERROR:", err);
    res.status(500).json({ message: "Order failed", error: err.message });
  }
};

// 2️⃣ INITIATE ESEWA PAYMENT
exports.initiateEsewa = async (req, res) => {
  const { orderId } = req.body;
  const order = await Order.findById(orderId);
  const payload = {
    amt: order.totalAmount.toFixed(2),
    psc: "0",
    pdc: "0",
    tAmt: order.totalAmount.toFixed(2),
    pid: order._id.toString(),
    scd: process.env.ESEWA_PRODUCT_CODE,
    su: `${process.env.FRONTEND_URL}/payment-success?oid=${order._id}`,
    fu: `${process.env.FRONTEND_URL}/payment-failure?oid=${order._id}`,
  };
  res.json({
    paymentUrl: process.env.ESEWA_PAYMENT_URL,
    payload,
  });
};


// 3️⃣ VERIFY PAYMENT
exports.verifyEsewa = async (req, res) => {
  try {
    const { oid, amt, refId } = req.query;

    const order = await Order.findById(oid);
    if (!order) return res.redirect(`${process.env.FRONTEND_URL}/payment-failure`);

    const params = new URLSearchParams();
    params.append("amt", amt);
    params.append("scd", process.env.ESEWA_PRODUCT_CODE);
    params.append("pid", oid);
    params.append("rid", refId);

    const response = await axios.post(process.env.ESEWA_VERIFY_URL, params.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    // eSewa returns XML → basic check
    if (response.data.includes("<responseCode>Success</responseCode>")) {
      order.paymentStatus = "success";
      order.esewaRefId = refId;
      await order.save();
      return res.redirect(`${process.env.FRONTEND_URL}/order-success`);
    }

    order.paymentStatus = "failed";
    await order.save();
    res.redirect(`${process.env.FRONTEND_URL}/payment-failure`);
  } catch (err) {
    console.error("VERIFY_ERROR:", err);
    res.redirect(`${process.env.FRONTEND_URL}/payment-failure`);
  }
};
