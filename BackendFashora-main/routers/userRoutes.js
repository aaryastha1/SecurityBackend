

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
router.post("/logout", logoutUser);

// Get profile (protected) → optional CSRF
router.get("/me", authenticateUser, getProfile);

// Update profile (protected)
router.put("/me", authenticateUser,  upload.single("profileImage"), updateProfile);

module.exports = router;


// const express = require("express");
// const router = express.Router();
// const cookieParser = require("cookie-parser");

// const {
//   registerUser,
//   loginUser,
//   getProfile,
//   updateProfile,
//   verifyOTP,
//   logoutUser,
// } = require("../controllers/UserController");

// const {
//   validateSignup,
//   validateLogin,
//   authenticateUser,
//   csrfProtection,
// } = require("../middlewares/authorizedUser");

// const { loginRateLimiter } = require("../middlewares/rateLimiter");
// const upload = require("../middlewares/fileupload");

// router.use(cookieParser());

// // ===== AUTH ROUTES =====

// // Registration → NO CSRF (no session yet)
// router.post("/register", validateSignup, registerUser);

// // ✅ Login → RATE LIMITED (no CSRF)
// router.post(
//   "/login",
//   loginRateLimiter,
//   validateLogin,
//   loginUser
// );


// router.post("/verify-otp", verifyOTP);


// router.post("/logout", authenticateUser, csrfProtection, logoutUser);


// router.get("/me", authenticateUser, getProfile);


// router.put(
//   "/me",
//   authenticateUser,
//   csrfProtection,
//   upload.single("profileImage"),
//   updateProfile
// );

// module.exports = router;

