// const jwt = require("jsonwebtoken");
// const User = require('../models/User');
// const csrf = require("csurf");

// // ===== CSRF Protection =====
// const csrfProtection = csrf({
//   cookie: true, // store CSRF token in cookie
// });

// // ===== Validation middlewares =====
// const validateSignup = (req, res, next) => {
//   const { name, email, phoneNumber, password } = req.body;
//   if (!name || !email || !phoneNumber || !password) {
//     return res.status(400).json({ message: 'All fields are required' });
//   }
//   if (!/\S+@\S+\.\S+/.test(email)) {
//     return res.status(400).json({ message: 'Invalid email format' });
//   }
//   if (password.length < 6) {
//     return res.status(400).json({ message: 'Password must be at least 6 characters' });
//   }
//   next();
// };

// const validateLogin = (req, res, next) => {
//   const { email, password } = req.body;
//   if (!email || !password) {
//     return res.status(400).json({ message: 'Email and password are required' });
//   }
//   next();
// };

// // ===== Authenticate logged-in user =====
// const authenticateUser = async (req, res, next) => {
//   try {
//     // 1️⃣ Try cookie first
//     const token = req.cookies?.token;

//     // 2️⃣ Fallback to header
//     const authHeader = req.headers.authorization;
//     const bearerToken = authHeader?.split(" ")[1];

//     if (!token && !bearerToken) {
//       return res.status(403).json({
//         success: false,
//         message: "Authentication required",
//       });
//     }

//     const decoded = jwt.verify(token || bearerToken, process.env.SECRET);

//     const user = await User.findById(decoded._id);
//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     req.user = user; // attach user to request
//     next();
//   } catch (err) {
//     console.error("Auth Error:", err.message);
//     return res.status(401).json({
//       success: false,
//       message: "Invalid or expired token",
//     });
//   }
// };

// // ===== Allow only admin =====
// const isAdmin = (req, res, next) => {
//   if (req.user.role === "admin") {
//     next();
//   } else {
//     return res.status(403).json({
//       success: false,
//       message: "Access denied: Admin only",
//     });
//   }
// };

// // ===== Export everything =====
// module.exports = {
//   validateSignup,
//   validateLogin,
//   authenticateUser,
//   isAdmin,
//   csrfProtection, // export CSRF middleware
// };



const jwt = require("jsonwebtoken");
const User = require('../models/User');
const csrf = require("csurf");

// ===== CSRF Protection =====
const csrfProtection = csrf({ cookie: true });

// ===== Validation middlewares =====
const validateSignup = (req, res, next) => {
  const { name, email, phoneNumber, password } = req.body;
  if (!name || !email || !phoneNumber || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  next();
};

// ===== Authenticate logged-in user =====
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.split(" ")[1];

    if (!token && !bearerToken) {
      return res.status(403).json({ success: false, message: "Authentication required" });
    }

    const decoded = jwt.verify(token || bearerToken, process.env.SECRET);
    const user = await User.findById(decoded._id);
    if (!user) return res.status(401).json({ success: false, message: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth Error:", err.message);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

// ===== Allow only admin =====
const isAdmin = (req, res, next) => {
  if (req.user.role === "admin") next();
  else return res.status(403).json({ success: false, message: "Access denied: Admin only" });
};

module.exports = {
  validateSignup,
  validateLogin,
  authenticateUser,
  isAdmin,
  csrfProtection,
};
