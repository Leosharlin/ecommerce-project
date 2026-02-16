const Order = require("../models/Order");

// ✅ Place Order
exports.placeOrder = async (req, res) => {
  try {
    const { products, totalAmount } = req.body;

    const order = await Order.create({
      userId: req.user._id,
      products,
      totalAmount,
    });

    return res.status(201).json({ msg: "Order placed", order });
  } catch (err) {
    return res.status(500).json({ msg: "Order error" });
  }
};

// ✅ Get My Orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id });
    return res.json(orders);
  } catch (err) {
    return res.status(500).json({ msg: "Error fetching orders" });
  }
};

// ✅ Admin: Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("userId", "email");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching all orders" });
  }
};

// Order Status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    await Order.findByIdAndUpdate(req.params.id, { status });

    res.json({ msg: "Status updated" });
  } catch (err) {
    res.status(500).json({ msg: "Error updating status" });
  }
};

// Admin: Delete order
exports.deleteOrder = async (req, res) => {
  try {
    const deleted = await Order.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ msg: "Order not found" });
    }
    res.json({ msg: "Order deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Error deleting order" });
  }
};
