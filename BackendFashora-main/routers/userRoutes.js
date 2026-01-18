// const express = require("express");
// const router = express.Router();
// const cookieParser = require("cookie-parser");

// const {
//   registerUser,
//   loginUser,
//   getProfile,
//   updateProfile,
//   verifyOTP,
//   logoutUser, // NEW
// } = require("../controllers/UserController");

// const {
//   validateSignup,
//   validateLogin,
//   authenticateUser
// } = require("../middlewares/authorizedUser");

// const upload = require("../middlewares/fileupload");

// // Use cookie parser middleware
// router.use(cookieParser());

// // ===== AUTH ROUTES =====

// // Registration
// router.post("/register", validateSignup, registerUser);

// // Login → sets cookie
// router.post("/login", validateLogin, loginUser);

// // Verify OTP → sets cookie
// router.post("/verify-otp", verifyOTP);

// // Logout → clears cookie
// router.post("/logout", logoutUser);

// // Get profile (protected)
// router.get("/me", authenticateUser, getProfile);

// // Update profile (protected)
// router.put("/me", authenticateUser, upload.single("profileImage"), updateProfile);

// module.exports = router;

const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser");

const {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  verifyOTP,
  logoutUser,
} = require("../controllers/UserController");

const {
  validateSignup,
  validateLogin,
  authenticateUser,
  csrfProtection, // CSRF middleware
} = require("../middlewares/authorizedUser");

const upload = require("../middlewares/fileupload");

// Use cookie parser middleware
router.use(cookieParser());

// ===== AUTH ROUTES =====

// Registration → NO CSRF
router.post("/register", validateSignup, registerUser);

// Login → NO CSRF
router.post("/login", validateLogin, loginUser);

// Verify OTP → NO CSRF
router.post("/verify-otp", verifyOTP);

// Logout → YES CSRF
router.post("/logout", csrfProtection, logoutUser);

// Get profile (protected) → optional CSRF
router.get("/me", authenticateUser, getProfile);

// Update profile (protected)
router.put("/me", authenticateUser,  upload.single("profileImage"), updateProfile);

module.exports = router;
