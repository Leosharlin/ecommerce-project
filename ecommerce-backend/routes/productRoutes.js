const express = require("express");
const router = express.Router();

const {
  addProduct,
  getProducts,
  deleteProduct,
  updateProduct,
} = require("../controllers/productController");

const { verifyToken, adminOnly } = require("../middleware/authMiddleware");

// Add product (admin)
router.post("/", verifyToken, adminOnly, addProduct);

// Get all products (public)
router.get("/", getProducts);

// Delete product (admin)
router.delete("/:id", verifyToken, adminOnly, deleteProduct);

// Update product (admin)
router.put("/:id", verifyToken, adminOnly, updateProduct);

module.exports = router;
