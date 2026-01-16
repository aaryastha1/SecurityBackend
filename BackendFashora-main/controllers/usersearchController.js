const Product = require('../models/Product');
const Category = require('../models/Category');

exports.searchProducts = async (req, res) => {
  try {
    const searchQuery = req.query.q?.trim();
    if (!searchQuery) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    // Find matching categories
    const matchingCategory = await Category.findOne({
      name: { $regex: searchQuery, $options: 'i' },
    });

    // Find matching products by name or categoryId
    const filter = {
      $or: [
        { name: { $regex: searchQuery, $options: 'i' } },
        matchingCategory ? { categoryId: matchingCategory._id } : null,
      ].filter(Boolean),
    };

    const products = await Product.find(filter)
      .populate('categoryId', 'name')
      .populate('sellerId', 'firstName');

    return res.status(200).json({ success: true, products });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
