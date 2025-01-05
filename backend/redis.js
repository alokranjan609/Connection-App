const redis = require("redis");

// Create a Redis client
const redisClient = redis.createClient({
  url: "redis://localhost:6379", // Replace with your Redis server URL if different
});

// Handle connection events
redisClient.on("connect", () => {
  console.log("Connected to Redis");
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

// Connect the client
redisClient.connect();



module.exports = redisClient;
