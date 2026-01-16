// createAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('./models/Admin/AdminAuth'); // adjust path if needed

mongoose.connect('mongodb://localhost:27017/fashora', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

(async () => {
  try {
    const hashedPassword = await bcrypt.hash('fashora@08', 10);

    await Admin.create({
      email: 'admin@fashora.com'.toLowerCase(),
      password: hashedPassword,
    });

    console.log('Admin created successfully');
  } catch (err) {
    console.error('Error creating admin:', err);
  } finally {
    mongoose.connection.close();
  }
})();