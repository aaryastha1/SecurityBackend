


// const User = require("../models/User");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");

// // ========== REGISTER ==========
// exports.registerUser = async (req, res) => {
//   const { name, email, phoneNumber, password, role = "normal" } = req.body;

//   if (!name || !email || !phoneNumber || !password) {
//     return res.status(400).json({ success: false, message: "Missing fields" });
//   }

//   try {
//     const existingUser = await User.findOne({
//       $or: [{ email }, { phoneNumber }],
//     });

//     if (existingUser) {
//       return res.status(400).json({ success: false, message: "User already exists" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newUser = new User({
//       name,
//       email,
//       phoneNumber,
//       password: hashedPassword,
//       role,
//     });

//     await newUser.save();

//     return res.status(201).json({
//       success: true,
//       message: "User registered successfully",
//       data: {
//         id: newUser._id,
//         name: newUser.name,
//         email: newUser.email,
//         role: newUser.role,
//       },
//     });
//   } catch (err) {
//     console.error("Register error:", err);
//     return res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// // ========== LOGIN ==========
// exports.loginUser = async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({ success: false, message: "Missing fields" });
//   }

//   try {
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(403).json({ success: false, message: "User not found" });
//     }

//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       return res.status(403).json({ success: false, message: "Invalid credentials" });
//     }

//     const payload = {
//       _id: user._id,
//       email: user.email,
//       name: user.name,
//       role: user.role,
//     };

//     const token = jwt.sign(payload, process.env.SECRET || "defaultsecret", {
//       expiresIn: "7d",
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Login successful",
//       data: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       },
//       token,
//     });
//   } catch (err) {
//     console.error("Login error:", err);
//     return res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// // ========== GET MY PROFILE ==========
// exports.getProfile = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id).select("-password");
//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     return res.status(200).json({ success: true, data: user });
//   } catch (err) {
//     console.error("Get profile error:", err);
//     return res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// // ========== UPDATE MY PROFILE ==========
// exports.updateProfile = async (req, res) => {
//   try {
//     const updates = req.body;

//     // If password is being updated, hash it
//     if (updates.password) {
//       updates.password = await bcrypt.hash(updates.password, 10);
//     }

//     const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
//       new: true,
//       runValidators: true,
//     }).select("-password");

//     if (!updatedUser) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     // Optional: Generate new token with updated info
//     const payload = {
//       _id: updatedUser._id,
//       email: updatedUser.email,
//       name: updatedUser.name,
//       role: updatedUser.role,
//     };

//     const newToken = jwt.sign(payload, process.env.SECRET || "defaultsecret", {
//       expiresIn: "7d",
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Profile updated successfully",
//       data: updatedUser,
//       token: newToken, // Return new token if frontend wants to use it
//     });
//   } catch (err) {
//     console.error("Update profile error:", err);
//     return res.status(500).json({ success: false, message: "Server error" });
//   }
// };


const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const sendOTP = require("../utils/sendOTP");

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

// ===== Helper: Validate Password Complexity =====
function validatePassword(password) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return regex.test(password);
}

// ===== REGISTER =====
exports.registerUser = async (req, res) => {
  const { name, email, phoneNumber, password, role = "normal", captcha } = req.body;

  if (!captcha)
    return res.status(400).json({ success: false, message: "Captcha is required" });

  try {
    const secretKey = process.env.RECAPTCHA_SECRET;
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captcha}`
    );

    if (!response.data.success)
      return res.status(400).json({ success: false, message: "Captcha verification failed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Captcha verification error" });
  }

  if (!name || !email || !phoneNumber || !password)
    return res.status(400).json({ success: false, message: "Missing required fields" });

  if (!validatePassword(password))
    return res.status(400).json({
      success: false,
      message:
        "Password must be at least 8 characters, include uppercase, lowercase, number, and symbol",
    });

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { phoneNumber }] });
    if (existingUser)
      return res.status(400).json({ success: false, message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      phoneNumber,
      password: hashedPassword,
      role,
      recentPasswords: [hashedPassword],
      passwordLastChanged: Date.now(),
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: { id: newUser._id, name, email, role },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===== LOGIN =====
exports.loginUser = async (req, res) => {
  const { email, password, captcha } = req.body;

  if (!captcha)
    return res.status(400).json({ success: false, message: "Captcha is required" });

  try {
    // Verify reCAPTCHA
    const secretKey = process.env.RECAPTCHA_SECRET;
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captcha}`
    );
    if (!response.data.success)
      return res.status(400).json({ success: false, message: "Captcha verification failed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Captcha verification error" });
  }

  if (!email || !password)
    return res.status(400).json({ success: false, message: "Email and password are required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(403).json({ success: false, message: "User not found" });

    // Check lock status
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const minutes = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(403).json({
        success: false,
        message: `Account locked. Try again in ${minutes} minute(s).`,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      user.failedLoginAttempts += 1;

      if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        user.lockUntil = Date.now() + LOCK_TIME;
        await user.save();
        return res.status(403).json({
          success: false,
          message: "Account locked for 15 minutes due to multiple failed login attempts",
        });
      }

      await user.save();
      return res.status(403).json({
        success: false,
        message: `Invalid credentials. ${MAX_FAILED_ATTEMPTS - user.failedLoginAttempts} attempts left`,
      });
    }

    // Password correct → reset counters
    user.failedLoginAttempts = 0;
    user.lockUntil = null;

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
    await user.save();

    try {
      await sendOTP(user.email, otp);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Failed to send OTP. Try again." });
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email. Enter OTP to complete login.",
      data: { email: user.email },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===== VERIFY OTP =====
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp)
    return res.status(400).json({ success: false, message: "Email and OTP are required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (!user.otp || !user.otpExpiry || user.otpExpiry < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP expired. Please login again." });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // Clear OTP
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    const payload = { _id: user._id, email: user.email, name: user.name, role: user.role };
    const token = jwt.sign(payload, process.env.SECRET || "defaultsecret", { expiresIn: "7d" });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: payload,
      token,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===== GET PROFILE =====
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
// ===== UPDATE PROFILE =====
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Update text fields
    if (req.body.name) user.name = req.body.name;
    if (req.body.phoneNumber) user.phoneNumber = req.body.phoneNumber;

    // Update profile image
    if (req.file) {
      // Construct full URL dynamically
      const protocol = req.protocol; // http or https
      const host = req.get("host");  // localhost:5006
      user.profileImage = `${protocol}://${host}/uploads/${req.file.filename}`;
    }

    // Password update logic
    if (req.body.password) {
      const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
      if (!regex.test(req.body.password)) {
        return res.status(400).json({ success: false, message: "Invalid Password Format" });
      }

      const hashed = await bcrypt.hash(req.body.password, 10);
      user.password = hashed;
      user.recentPasswords = [hashed, ...user.recentPasswords.slice(0, 2)];
      user.passwordLastChanged = Date.now();
    }

    const savedUser = await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        _id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        phoneNumber: savedUser.phoneNumber,
        profileImage: savedUser.profileImage, // ✅ Full URL
        role: savedUser.role,
      },
    });
  } catch (err) {
    console.error("Update Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
