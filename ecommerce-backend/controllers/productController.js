const Product = require("../models/Product");

// Admin add product
exports.addProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ msg: "Error adding product" });
  }
};

// Get all products (user)
exports.getProducts = async (req, res) => {
  const products = await Product.find();
  res.json(products);
};

// ✅ Delete product (admin)
exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ msg: "Product deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Error deleting product" });
  }
};

// Update product (admin)
exports.updateProduct = async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return res.status(404).json({ msg: "Product not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ msg: "Error updating product" });
  }
};
