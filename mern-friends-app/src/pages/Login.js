import React, { useState } from "react";
import "../styles/login.css";
import API from "../services/api";



const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [message, setMessage] = useState(null);




  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post("/auth/login", formData);
      const { token, username } = response.data;
      
      // Save token and username in localStorage
      localStorage.setItem("authToken", token);
      localStorage.setItem("userName", username);

      // Set success message
      setMessage({ type: "success", text: "Login successful!" });

      // Redirect to home
      window.location.href = "/home";
    } catch (error) {
      // Set error message
      setMessage({ type: "error", text: "Login failed. Please try again." });
    }
  };



  
  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Login</h1>
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />
          <button type="submit">Login</button>
        </form>
        {message && (
          <p
            className={message.type === "error" ? "error-message" : "success-message"}
          >
            {message.text}
          </p>
        )}
        <div className="form-footer">
          <p>
            Don't have an account? <a href="/signup">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
