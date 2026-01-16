


const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getProfile,
  updateProfile
} = require("../controllers/UserController");

const {
  validateSignup,
  validateLogin,
  authenticateUser
} = require("../middlewares/authorizedUser");

// Registration route
router.post("/register", validateSignup, registerUser);

// Login route
router.post("/login", validateLogin, loginUser);

// Get profile (protected)
router.get("/me", authenticateUser, getProfile);

// Update profile (protected)
router.put("/me", authenticateUser, updateProfile);

module.exports = router;
