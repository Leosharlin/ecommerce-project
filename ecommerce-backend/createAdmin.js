require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

mongoose.connect(process.env.MONGO_URI);

const createAdmin = async () => {
  try {
    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    await User.create({
      firstName: "Admin",
      lastName: "",
      email: "admin@shop.com",
      password: hashedPassword,
      role: "admin",
      isVerified: true,
    });

    console.log("Admin created successfully ✅");
    process.exit();
  } catch (err) {
    console.log(err);
    process.exit();
  }
};

createAdmin();
