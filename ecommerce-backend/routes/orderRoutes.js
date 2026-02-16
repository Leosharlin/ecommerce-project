const express = require("express");
const router = express.Router();
const {
  placeOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} = require("../controllers/orderController");

const { verifyToken, adminOnly } = require("../middleware/authMiddleware");

router.post("/", verifyToken, placeOrder);
router.get("/my", verifyToken, getMyOrders);

// Admin only
router.get("/all", verifyToken, adminOnly, getAllOrders);
router.put("/:id", verifyToken, adminOnly, updateOrderStatus);
router.delete("/:id", verifyToken, adminOnly, deleteOrder);

module.exports = router;
