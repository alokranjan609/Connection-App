//Requiring Packages
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const app = express();



dotenv.config();  // Load environment variables


//Requiring Routes
const authRoutes = require("./routes/authRoutes");
const friendRoutes = require("./routes/friendRoutes");



//Database Connection
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => {
    console.log("MongoDB connected!");
  }).catch((err) => {
    console.log("MongoDB connection failed", err);
  });



//Middlewares
app.use(cors());
app.use(express.json());  // For parsing JSON requests
app.use("/auth", authRoutes);
app.use("/friends", friendRoutes);





const PORT = process.env.PORT || 5000;
app.get("/", (req, res) => {
  res.send("Backend is up and running!");
});


//Checking Connection
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
