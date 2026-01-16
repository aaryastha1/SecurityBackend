

// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   phoneNumber: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   role: { type: String, default: "normal" },
//   filepath: { type: String },

//   // 🆕 Favorites field
//   favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
// });

// module.exports = mongoose.model('User', userSchema);



const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "normal" },
  filepath: { type: String },

  // Favorites
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],

  // 🔒 Security enhancements
  recentPasswords: [{ type: String }],           // Store last 3 password hashes
  passwordLastChanged: { type: Date, default: Date.now }, // Track expiry

  // 🛡️ Brute-force prevention
  failedLoginAttempts: { type: Number, default: 0 }, 
  lockUntil: { type: Date },

  // 📝 OTP for multi-factor auth
otp: { type: String },
otpExpiry: { type: Date },
});

module.exports = mongoose.model('User', userSchema);
