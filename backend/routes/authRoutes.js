//Requirung Packages
const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const rateLimit = require('express-rate-limit');

const router = express.Router();



// Define the rate limit for the route
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 100 requests per windowMs
  message: {
    status: 429,
    message: "Too many requests. Please try again later."
  },
});






// User Signup
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: "Username or Email already exists!" });
    }

    const newUser = new User({ username, email, password });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});




// User Login
router.post("/login",limiter, async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) {
      
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ message: "Login successful!", token,username });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});



module.exports = router;
