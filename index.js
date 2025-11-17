// index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/shoe-store", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once("open", () => {
  console.log("✅ MongoDB connected");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err);
});

// Routes
const authRoutes = require("./routes/auth");
app.use("/api", authRoutes); // ✅ Use /api to match frontend

// Start server
app.listen(5000, () => {
  console.log("🚀 Server running at http://localhost:5000");
});
