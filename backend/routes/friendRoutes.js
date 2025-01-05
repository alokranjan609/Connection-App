const express = require("express");
const User = require("../models/User");
const authenticateToken = require("../middleware/authToken");
const redisClient = require("../redis");

const router = express.Router();

// Search Users
router.post("/search", async (req, res) => {
    const { query } = req.body; // Extract query from the request body
    try {
      const users = await User.find({
        username: { $regex: query, $options: "i" },
      }).select("username email");
      res.json(users); // Send the found users as the response
    } catch (error) {
      res.status(500).json({ message: "Server Error" });
    }
  });





//fetch users 
  router.get("/fetch", authenticateToken, async (req, res) => {
    const userId = req.user.id; // Get user ID from the authenticated token
    const cacheKey = `friends:${userId}`; // Create a unique key for caching
  
    try {
      // Check if data is cached
      const cachedFriends = await redisClient.get(cacheKey);
  
      if (cachedFriends) {
        console.log("Cache hit");
        return res.status(200).json(JSON.parse(cachedFriends)); // Serve cached data
      }
  
      console.log("Cache miss");
      // If not in cache, fetch from the database
      const user = await User.findById(userId).populate("friends", "username email");
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const friends = user.friends;
  
      // Cache the result with a TTL of 60 seconds (or your desired value)
      await redisClient.set(cacheKey, JSON.stringify(friends), {
        EX: 60, // Cache expires in 60 seconds
      });
  
      return res.status(200).json(friends);
    } catch (error) {
      console.error("Error fetching friends:", error);
      return res.status(500).json({ message: "Server error", error });
    }
  });
  
  




// Send Friend Request
router.post("/send-request",authenticateToken, async (req, res) => {
  const { recipientId } = req.body;
  const userId = req.user.id
  

  try {
    const sender = await User.findById(userId);
    const recipient = await User.findById(recipientId);

    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    if (sender.sentRequests.includes(recipientId) || recipient.receivedRequests.includes(userId)) {
      return res.status(400).json({ message: "Friend request already sent" });
    }

    sender.sentRequests.push(recipientId);
    recipient.receivedRequests.push(userId);

    await sender.save();
    await recipient.save();

    res.status(200).json({ message: "Friend request sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});








//Accept Friend Request
router.post("/accept", authenticateToken, async (req, res) => {
  const { senderId } = req.body;
  const userId = req.user.id;

  try {
    const sender = await User.findById(senderId);
    const recipient = await User.findById(userId);

    if (!sender || !recipient) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!recipient.receivedRequests.includes(senderId)) {
      return res.status(400).json({ message: "No friend request from this user" });
    }

    // Remove from request lists
    recipient.receivedRequests = recipient.receivedRequests.filter((id) => id.toString() !== senderId);
    sender.sentRequests = sender.sentRequests.filter((id) => id.toString() !== userId);

    // Add to friends list
    sender.friends.push(userId);
    recipient.friends.push(senderId);

    await sender.save();
    await recipient.save();

    // Invalidate cached friends list for both users
    await redisClient.del(`friends:${senderId}`);
    await redisClient.del(`friends:${userId}`);

    res.status(200).json({ message: "Friend request accepted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});






// Reject Friend Request
router.delete("/remove/:friendId", authenticateToken, async (req, res) => {
  const { friendId } = req.params; // The friend ID to remove
  const userId = req.user.id; // Logged-in user's ID

  try {
    // Find both users
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove friendId from user's friends list
    user.friends = user.friends.filter((id) => id.toString() !== friendId);

    // Remove userId from friend's friends list
    friend.friends = friend.friends.filter((id) => id.toString() !== userId);

    // Save the updated documents
    await user.save();
    await friend.save();

    // Invalidate cached friends list for both users
    await redisClient.del(`friends:${userId}`);
    await redisClient.del(`friends:${friendId}`);

    return res.status(200).json({ message: "Friend removed successfully" });
  } catch (error) {
    console.error("Error removing friend:", error);
    return res.status(500).json({ message: "Failed to remove friend", error });
  }
});







//Pending Request
router.get("/pending-requests",authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId).populate("receivedRequests", "username email");
    res.status(200).json(user.receivedRequests);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});







// Friend Suggestion Route
router.get("/suggestions", authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    // Check if suggestions are already cached
    const cachedSuggestions = await redisClient.get(`suggestions:${userId}`);
    if (cachedSuggestions) {
      console.log("Returning cached suggestions");
      return res.status(200).json(JSON.parse(cachedSuggestions));
    }

    // Fetch the logged-in user
    const user = await User.findById(userId).populate("friends", "friends username email");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get IDs of current user's friends
    const userFriends = user.friends.map((friend) => friend._id.toString());

    // Collect friends of friends
    const suggestions = new Set();
    user.friends.forEach((friend) => {
      friend.friends.forEach((friendOfFriend) => {
        if (
          friendOfFriend.toString() !== userId && // Exclude the user themself
          !userFriends.includes(friendOfFriend.toString()) && // Exclude existing friends
          !suggestions.has(friendOfFriend.toString()) // Avoid duplicates
        ) {
          suggestions.add(friendOfFriend.toString());
        }
      });
    });

    // Fetch full details of suggested users
    const suggestedUsers = await User.find({ _id: { $in: Array.from(suggestions) } })
      .select("username email");

    // Cache the suggestions with a TTL (e.g., 3600 seconds = 1 hour)
    await redisClient.setEx(`suggestions:${userId}`, 3600, JSON.stringify(suggestedUsers));

    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
});









//Remove Friends
router.delete("/remove/:friendId", authenticateToken, async (req, res) => {
  const { friendId } = req.params; // The friend ID to remove
  const userId = req.user.id; // Logged-in user's ID

  try {
    // Find both users
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove friendId from user's friends list
    user.friends = user.friends.filter((id) => id.toString() !== friendId);

    // Remove userId from friend's friends list
    friend.friends = friend.friends.filter((id) => id.toString() !== userId);

    // Save the updated documents
    await user.save();
    await friend.save();

    return res.status(200).json({ message: "Friend removed successfully" });
  } catch (error) {
    console.error("Error removing friend:", error);
    return res.status(500).json({ message: "Failed to remove friend", error });
  }
});



module.exports = router;
