import React from "react";
import Navbar from "../components/Navbar";
import "../styles/landing.css";



const LandingPage = () => {
  return (
    <div className="landing-page">
      <Navbar />
      <div className="landing-content">
        <h1>Welcome to Friend Finder</h1>
        <p>Connect with people, build your network, and find new friends!</p>
        
      </div>
    </div>
  );
};

export default LandingPage;
