


const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  verifyOTP
} = require("../controllers/UserController");

const {
  validateSignup,
  validateLogin,
  authenticateUser
} = require("../middlewares/authorizedUser");

const upload = require("../middlewares/fileupload");

// Registration route
router.post("/register", validateSignup, registerUser);

// Login route
router.post("/login", validateLogin, loginUser);

// Get profile (protected)
router.get("/me", authenticateUser, getProfile);

// Update profile (protected)
router.put("/me", authenticateUser,  upload.single("profileImage"), updateProfile);


router.post("/verify-otp", verifyOTP);


module.exports = router;
