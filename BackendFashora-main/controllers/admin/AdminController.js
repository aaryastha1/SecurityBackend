const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../../models/Admin/Admin');

exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Normalize email
    const normalizedEmail = email.toLowerCase();

    // Check if admin exists
    const admin = await Admin.findOne({ email: normalizedEmail });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Sign JWT token
    const token = jwt.sign(
      { id: admin._id, role: 'admin' },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1d' }
    );

    // Send response
    return res.status(200).json({
      message: 'Login successful',
      user: {
        _id: admin._id,
        email: admin.email,
        role: 'admin',
      },
      token,
    });

  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};