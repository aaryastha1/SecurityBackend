const express = require("express");
const router = express.Router();
const {
  placeOrder,
  initiateEsewa,
  verifyEsewa,
} = require("../controllers/esewaController");

router.post("/place", placeOrder);
router.post("/initiate", initiateEsewa);
router.get("/verify", verifyEsewa);

module.exports = router;
