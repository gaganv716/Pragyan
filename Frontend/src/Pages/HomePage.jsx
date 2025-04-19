import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from '../components/Authentication/Login';
import Signup from '../components/Authentication/Signup';
import "../public/css/homePage.css";

const HomePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Login");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    if (user) navigate("/chats");
  }, [navigate]);

  return (
    <div className="container">
      <div className="header">
        <h1>Let-Out</h1>
      </div>
      <div className="tabs-container">
        <div className="tabs">
          <button 
            className={activeTab === "Login" ? "active" : ""}
            onClick={() => setActiveTab("Login")}
          >
            Login
          </button>
          <button 
            className={activeTab === "SignUp" ? "active" : ""}
            onClick={() => setActiveTab("SignUp")}
          >
            Sign Up
          </button>
        </div>
        <div className="tab-content">
          {activeTab === "Login" ? <Login /> : <Signup />}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
