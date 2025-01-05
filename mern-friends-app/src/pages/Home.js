import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/home.css";
import API from "../services/api";



const Home = () => {
  const navigate = useNavigate();


  const [friends, setFriends] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [showPendingRequests, setShowPendingRequests] = useState(false);
  const [friendSuggestions, setFriendSuggestions] = useState([]);


  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userName");
    navigate("/login");
  };




  const fetchPendingRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await API.get("/friends/pending-requests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPendingRequests(response.data);
    } catch (error) {
      console.error("Error fetching pending requests:", error);
    } finally {
      setLoading(false);
    }
  };




  useEffect(() => {
    const fetchUserFriends = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        const response = await API.get("/friends/fetch", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFriends(response.data);
      } catch (error) {
        console.error("Error fetching user's friends:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserFriends();
  }, []);



  const fetchFriendSuggestions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await API.get("/friends/suggestions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFriendSuggestions(response.data);
    } catch (error) {
      console.error("Error fetching friend suggestions:", error);
    } finally {
      setLoading(false);
    }
  };




  useEffect(() => {
    fetchFriendSuggestions();
  }, []);

  const fetchFriends = async () => {
    if (!searchQuery.trim()) {
      alert("Please enter a search query.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await API.post(
        "/friends/search",
        { query: searchQuery },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSearchResults(response.data);
    } catch (error) {
      console.error("Error searching for friends:", error);
    } finally {
      setLoading(false);
    }
  };




  const sendFriendRequest = async (recipientId) => {
    try {
      const token = localStorage.getItem("authToken");
      await API.post(
        "/friends/send-request",
        { recipientId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Friend request sent!");
    } catch (error) {
      console.error("Error sending friend request:", error);
      alert("Failed to send friend request");
    }
  };






  const removeFriend = async (friendId) => {
    try {
      const token = localStorage.getItem("authToken");
      await API.delete(`/friends/remove/${friendId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Friend removed successfully!");
      setFriends((prev) => prev.filter((friend) => friend._id !== friendId));
    } catch (error) {
      console.error("Error removing friend:", error);
      alert("Failed to remove friend");
    }
  };





  const acceptFriendRequest = async (senderId) => {
    try {
      const token = localStorage.getItem("authToken");
      await API.post(
        "/friends/accept",
        { senderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Friend request accepted!");
      setPendingRequests((prev) =>
        prev.filter((request) => request._id !== senderId)
      );
    } catch (error) {
      console.error("Error accepting friend request:", error);
      alert("Failed to accept friend request");
    }
  };






  const rejectFriendRequest = async (senderId) => {
    try {
      const token = localStorage.getItem("authToken");
      await API.post(
        "/friends/reject",
        { senderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Friend request rejected!");
      setPendingRequests((prev) =>
        prev.filter((request) => request._id !== senderId)
      );
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      alert("Failed to reject friend request");
    }
  };




  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim() === "") {
      setSearchResults([]);
    }
  };





  const togglePendingRequests = () => {
    if (!showPendingRequests) {
      fetchPendingRequests();
    }
    setShowPendingRequests((prev) => !prev);
  };



  
  return (
    <div className="home-page">
      <nav className="home-navbar">
        <h2>Welcome {localStorage.getItem("userName")}</h2>
        <div className="buttons">
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
          <button
            className="pending-requests-button"
            onClick={togglePendingRequests}
          >
            Pending Requests
          </button>
        </div>
      </nav>

      {showPendingRequests && (
        <div className="pending-requests-container">
          <h2>Pending Friend Requests</h2>
          {loading ? (
            <p>Loading...</p>
          ) : pendingRequests.length > 0 ? (
            pendingRequests.map((request) => (
              <div key={request._id} className="card">
                <p>
                  <strong>{request.username}</strong> <br />
                  {request.email}
                </p>
                <div className="card-actions">
                  <button
                    onClick={() => acceptFriendRequest(request._id)}
                    className="accept-button"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => rejectFriendRequest(request._id)}
                    className="reject-button"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No pending requests</p>
          )}
        </div>
      )}

      <div className="home-container">
        <section className="friends-section">
          <h1>Your Friends</h1>
          <div className="friends-list">
            {loading ? (
              <p>Loading...</p>
            ) : friends.length > 0 ? (
              friends.map((friend) => (
                <div key={friend._id} className="card">
                  <p>
                    <strong>{friend.username}</strong> <br />
                    {friend.email}
                  </p>
                  <button
                    onClick={() => removeFriend(friend._id)}
                    className="remove-friend-button"
                  >
                    Remove
                  </button>
                </div>
              ))
            ) : (
              <p>You have no friends yet!</p>
            )}
          </div>
        </section>

        <section className="search-section">
          <h1>Find Friends</h1>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search friends..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <button onClick={fetchFriends} className="search-button">
              Search
            </button>
          </div>
          <div className="search-results">
            {loading ? (
              <p>Loading...</p>
            ) : searchResults.length > 0 ? (
              searchResults.map((friend) => (
                <div key={friend._id} className="card">
                  <p>
                    <strong>{friend.username}</strong> <br />
                    {friend.email}
                  </p>
                  <button
                    onClick={() => sendFriendRequest(friend._id)}
                    className="send-request-button"
                  >
                    Send Request
                  </button>
                </div>
              ))
            ) : (
              <p>No search results found</p>
            )}
          </div>
        </section>

        <section className="suggestions-section">
          <h1>Friend Suggestions</h1>
          <div className="friend-suggestions">
            {loading ? (
              <p>Loading...</p>
            ) : friendSuggestions.length > 0 ? (
              friendSuggestions.map((suggestion) => (
                <div key={suggestion._id} className="card">
                  <p>
                    <strong>{suggestion.username}</strong> <br />
                    {suggestion.email}
                  </p>
                  <button
                    onClick={() => sendFriendRequest(suggestion._id)}
                    className="send-request-button"
                  >
                    Send Request
                  </button>
                </div>
              ))
            ) : (
              <p>No suggestions available</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
