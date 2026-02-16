require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));



app.get("/", (req, res) => {
  res.send("API running");
});

app.listen(process.env.PORT, () => {
  console.log("Server started on port " + process.env.PORT);
});
const { verifyToken, adminOnly } = require("./middleware/authMiddleware");

app.get("/api/test/user", verifyToken, (req, res) => {
  res.json({ msg: "User route accessed", user: req.user });
});

app.get("/api/test/admin", verifyToken, adminOnly, (req, res) => {
  res.json({ msg: "Admin route accessed" });
});
