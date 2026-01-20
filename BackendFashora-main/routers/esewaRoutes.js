const express = require("express");
const crypto = require("crypto");
const Order = require("../models/Order");
const { authenticateUser } = require("../middlewares/authorizedUser"); // your auth middleware

const router = express.Router();

// Helper: generate eSewa signature
function generateSignature(message) {
  const secret = process.env.ESEWA_SECRET_KEY;
  return crypto.createHmac("sha256", secret).update(message).digest("base64");
}

// ----------------- INITIATE ESEWA PAYMENT -----------------
router.post("/initiate", authenticateUser, async (req, res) => {
  try {
    const { items, subtotal, shipping, fullName, address, phone } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const totalAmount = Number(subtotal) + Number(shipping);

    // Save order in DB
    const order = await Order.create({
      fullName,
      address,
      phone,
      items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
      totalAmount,
      paymentMethod: "esewa",
      paymentStatus: "pending",
      user: req.user._id, // associate order with logged-in user
    });

    const transaction_uuid = order._id.toString();
    const product_code = process.env.ESEWA_PRODUCT_CODE;

    const amt = Number(subtotal).toFixed(2);
    const delivery = Number(shipping).toFixed(2);
    const tax = "0.00";
    const service = "0.00";
    const total_amt = (Number(amt) + Number(delivery) + Number(tax) + Number(service)).toFixed(2);

    const signatureMessage = `total_amount=${total_amt},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
    const signature = generateSignature(signatureMessage);

    const esewaFormData = {
      amount: amt,
      total_amount: total_amt,
      transaction_uuid,
      product_code,
      signature,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      tax_amount: tax,
      product_delivery_charge: delivery,
      product_service_charge: service,
      success_url: `${process.env.FRONTEND_URL}/payment-success`,
      failure_url: `${process.env.FRONTEND_URL}/payment-failure`,
    };

    return res.json({
      paymentUrl: process.env.ESEWA_URL,
      payload: esewaFormData,
      orderId: order._id, // send orderId for frontend reference
    });
  } catch (err) {
    console.error("ESEWA_INIT_ERROR:", err);
    res.status(500).json({ message: "Failed to initiate eSewa payment" });
  }
});

// ----------------- SUCCESS CALLBACK -----------------
router.get("/success", async (req, res) => {
  try {
    const { data } = req.query; // eSewa v2 response
    const decoded = JSON.parse(Buffer.from(data, "base64").toString("utf-8"));

    if (decoded.status === "COMPLETE") {
      await Order.findByIdAndUpdate(decoded.transaction_uuid, {
        paymentStatus: "success",
        esewaRefId: decoded.transaction_code,
      });
      return res.redirect(`${process.env.FRONTEND_URL}/order-success`);
    }

    res.redirect(`${process.env.FRONTEND_URL}/payment-failure`);
  } catch (err) {
    console.error("ESEWA_SUCCESS_ERROR:", err);
    res.redirect(`${process.env.FRONTEND_URL}/payment-failure`);
  }
});

module.exports = router;
