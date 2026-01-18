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


const Order = require("../models/Order");
const axios = require("axios");
exports.placeOrder = async (req, res) => {
  try {
    const { fullName, address, phone, paymentMethod, items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }

    // Calculate totalAmount based on items
    // Each item should have price in frontend
    const totalAmount = items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    // COD orders → success immediately
    const paymentStatus = paymentMethod === "cod" ? "success" : "pending";

    const order = await Order.create({
      fullName,
      address,
      phone,
      paymentMethod,
      paymentStatus,
      items,
      totalAmount,
    });

    if (paymentMethod === "cod") {
      return res.status(201).json({
        success: true,
        message: "Order placed with Cash on Delivery",
        order,
      });
    }

    // eSewa → pending until payment verified
    return res.status(201).json({
      success: true,
      message: "Order created. Proceed to eSewa payment",
      orderId: order._id,
      amount: totalAmount,
    });
  } catch (err) {
    console.error("Error placing order:", err);
    res.status(500).json({ message: "Failed to place order" });
  }
};


// 2️⃣ Initiate eSewa
exports.initiateEsewa = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const payload = {
      amt: order.totalAmount,
      psc: 0,
      pdc: 0,
      tAmt: order.totalAmount,
      pid: order._id.toString(),
      scd: process.env.ESEWA_PRODUCT_CODE,
      su: `http://localhost:3000/payment/success?oid=${order._id}`,
      fu: `http://localhost:3000/payment/failure?oid=${order._id}`,
    };

    res.json({
      paymentUrl: process.env.ESEWA_PAYMENT_URL,
      payload,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to initiate eSewa payment" });
  }
};

// 3️⃣ Verify eSewa Payment
exports.verifyEsewa = async (req, res) => {
  try {
    const { oid, amt, refId } = req.query;

    const order = await Order.findById(oid);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const params = new URLSearchParams();
    params.append("amt", amt);
    params.append("scd", process.env.ESEWA_PRODUCT_CODE);
    params.append("pid", oid);
    params.append("rid", refId);

    const response = await axios.post(process.env.ESEWA_VERIFY_URL, params.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    // eSewa returns XML. Basic check for success
    if (response.data.includes("<responseCode>Success</responseCode>")) {
      order.paymentStatus = "success";
      order.esewaRefId = refId;
      await order.save();

      return res.json({ success: true, message: "Payment verified", order });
    }

    order.paymentStatus = "failed";
    await order.save();
    return res.status(400).json({ success: false, message: "Payment verification failed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Verification error" });
  }
};
