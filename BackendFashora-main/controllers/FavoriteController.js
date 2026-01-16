const User = require('../models/User');
const Product = require('../models/Product');

// Toggle favorite (add/remove)
exports.toggleFavorite = async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.body;

  try {
    const user = await User.findById(userId);
    const alreadyFavorite = user.favorites.includes(productId);

    if (alreadyFavorite) {
      user.favorites = user.favorites.filter(
        (id) => id.toString() !== productId
      );
    } else {
      user.favorites.push(productId);
    }

    await user.save();
    res.status(200).json({ success: true, isFavorite: !alreadyFavorite });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all favorites
exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    res.status(200).json({ success: true, favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

