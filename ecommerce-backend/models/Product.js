const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true },
    description: String,
    descriptionMode: {
      type: String,
      enum: ["text", "points"],
      default: "text",
    },
    image: String,
    images: [{ type: String }],
    category: {
      type: String,
      enum: ["mouse", "keyboard", "mousepad"],
      default: "mouse",
    },
    stock: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
