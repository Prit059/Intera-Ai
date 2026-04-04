// backend/Admin/seedAdmin.js
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") }); // ✅ correct path

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../Models/User");

(async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("📡 Connected to MongoDB...");

    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const firstname = process.env.ADMIN_FIRSTNAME || "Intera";
    const lastname = process.env.ADMIN_LASTNAME || "Admin";

    if (!email || !password) {
      throw new Error("ADMIN_EMAIL or ADMIN_PASSWORD not set in .env");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if admin already exists
    let admin = await User.findOne({ email });

    if (admin) {
      // Update existing user to admin role
      admin.role = "admin";
      admin.password = hashedPassword;
      admin.firstname = firstname;
      admin.lastname = lastname;
      admin.emailverified = true;
      admin.isActive = true;
      await admin.save();
    } else {
      // Create new admin user
      await User.create({
        firstname: firstname,
        lastname: lastname,
        email: email,
        password: hashedPassword,
        role: "admin",
        emailverified: true, // Admin email is pre-verified
        isActive: true,
      });

    }
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
})();