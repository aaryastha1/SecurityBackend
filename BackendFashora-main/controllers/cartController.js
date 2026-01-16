// const Cart = require('../models/cart');

// exports.getCart = async (req, res) => {
//   const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
//   res.json(cart || { user: req.user._id, items: [] });
// };

// exports.addToCart = async (req, res) => {
//   const { productId } = req.body;

//   let cart = await Cart.findOne({ user: req.user._id });

//   if (!cart) {
//     cart = new Cart({ user: req.user._id, items: [{ product: productId, quantity: 1 }] });
//   } else {
//     const existingItem = cart.items.find(item => item.product.toString() === productId);
//     if (existingItem) {
//       existingItem.quantity += 1;
//     } else {
//       cart.items.push({ product: productId, quantity: 1 });
//     }
//   }

//   await cart.save();
//   res.status(200).json(cart);
// };

// exports.removeFromCart = async (req, res) => {
//   const { productId } = req.params;

//   const cart = await Cart.findOne({ user: req.user._id });
//   if (!cart) return res.status(404).json({ message: 'Cart not found' });

//   cart.items = cart.items.filter(item => item.product.toString() !== productId);
//   await cart.save();
//   res.status(200).json(cart);
// };

// exports.updateQuantity = async (req, res) => {
//   const { productId, quantity } = req.body;

//   const cart = await Cart.findOne({ user: req.user._id });
//   if (!cart) return res.status(404).json({ message: 'Cart not found' });

//   const item = cart.items.find(item => item.product.toString() === productId);
//   if (!item) return res.status(404).json({ message: 'Item not found in cart' });

//   item.quantity = quantity;
//   await cart.save();

//   res.status(200).json(cart);
// };

// exports.clearCart = async (req, res) => {
//   await Cart.findOneAndDelete({ user: req.user._id });
//   res.status(200).json({ message: 'Cart cleared' });
// };



const Cart = require('../models/cart');

exports.getCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  res.json(cart || { user: req.user._id, items: [] });
};

exports.addToCart = async (req, res) => {
  const { productId } = req.body;

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [{ product: productId, quantity: 1 }] });
  } else {
    const existingItem = cart.items.find(item => item.product.toString() === productId);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.items.push({ product: productId, quantity: 1 });
    }
  }

  await cart.save();

  // Populate product info before sending
  cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

  res.status(200).json(cart);
};

exports.removeFromCart = async (req, res) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: 'Cart not found' });

  cart.items = cart.items.filter(item => item.product.toString() !== productId);
  await cart.save();

  // Populate product info before sending
  const updatedCart = await Cart.findOne({ user: req.user._id }).populate('items.product');

  res.status(200).json(updatedCart);
};

exports.updateQuantity = async (req, res) => {
  const { productId, quantity } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: 'Cart not found' });

  const item = cart.items.find(item => item.product.toString() === productId);
  if (!item) return res.status(404).json({ message: 'Item not found in cart' });

  item.quantity = quantity;
  await cart.save();

  // Populate product info before sending
  const updatedCart = await Cart.findOne({ user: req.user._id }).populate('items.product');

  res.status(200).json(updatedCart);
};

exports.clearCart = async (req, res) => {
  await Cart.findOneAndDelete({ user: req.user._id });
  res.status(200).json({ message: 'Cart cleared' });
};
