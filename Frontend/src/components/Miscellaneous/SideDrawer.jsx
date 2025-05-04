import React, { useState } from 'react';
import ProfileModal from '../Modals/Profile';
import "../../public/css/components/sideDrawer.css";
import { useNavigate } from 'react-router-dom';
import { ChatState } from '../../Context/chatProvider';
import axios from 'axios';
import { useCustomToast } from "../Miscellaneous/Toast";

const SideDrawer = () => {
  

  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSearchDrawer, setShowSearchDrawer] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const {showToast} = useCustomToast();
  const {
    setSelectedChat,
    user,
    notification,
    setNotification,
    chats,
    setChats,
  } = ChatState();


  // Dummy user data for now
  const userName = 'Pareekshit Sawant';
  const userImage = 'https://images.pexels.com/photos/709552/pexels-photo-709552.jpeg?auto=compress&cs=tinysrgb&w=600';

  const handleSearch = async () => {
    if (!search) {
      
      showToast({
        title: "Error Occurred!",
        description: "Please enter a search term",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }

    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`http://localhost:3000/api/users?search=${search}`, config);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      
      showToast({
        title: "Error Occurred!",
        description: "Failed to load the search results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
    }

  };

  const onClose = () =>{
    setShowSearchDrawer(false);
    setSearch('');
  }

  const accessChat = async (userId) => {
    console.log(userId);

    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(`http://localhost:3000/api/chats`, { userId }, config);

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
    
      showToast({
        title: "Error Occurred!",
        description: "Error fetching the chat",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      console.log(error);
    }
  };


  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  return (
    <>
      <div className="navbar">
        {/* Left: Search */}
        <div className="navbar-left">
          <input className='st-draw-button' onClick={()=>setShowSearchDrawer(true)}
            type="button"
            value={"🔍Search Users"}
          />
        </div>

        {/* Middle: Title */}
        <div className="navbar-title">Pragyan</div>

        {/* Right: Notifications and Profile */}
        <div className="navbar-right">
        <div className="notification-container">
  <span
    className="notification-icon"
    onClick={() => setShowNotifications((prev) => !prev)}
  >
    🔔 {notification.length > 0 && <span className="badge">{notification.length}</span>}
  </span>

  {showNotifications && (
    <div className="notification-dropdown">
      {notification.length === 0 ? (
        <div className="notification-item">No new messages</div>
      ) : (
        notification.map((notif, index) => {
          const chat = notif.chat;
        
          // Safety check
          if (!chat || !chat.users) return null;
        
          const sender = !chat.isGroupChat
            ? chat.users.find((u) => u._id !== user._id)
            : null;
        
          return (
            <div
              key={index}
              className="notification-item"
              onClick={() => {
                setSelectedChat(chat);
                setNotification(notification.filter((n) => n !== notif));
                setShowNotifications(false);
              }}
            >
              New message from{" "}
              {chat.isGroupChat
                ? chat.chatName
                : sender?.name || "Unknown"}
            </div>
          );
        })
      )}
    </div>
  )}
</div>

          <div className="profile-menu-container">
            <span
              className="profile-icon"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <img src={user.pic} alt="" />
            </span>

            {showProfileMenu && (
              <div className="profile-dropdown">
                <button onClick={() => setShowProfileModal(true)}>Profile</button>
                <button onClick={logoutHandler}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          userName={user.name}
          userImage={user.pic}
          onClose={() => setShowProfileModal(false)}
        />
      )}
      {/* Search Sidebar */}
     
  <div className={`search-drawer ${showSearchDrawer ? 'open' : ''}`}>
    <div className="search-drawer-header">
      <h3>Search Users</h3>
      <button onClick={() => setShowSearchDrawer(false)}>❌</button>
    </div>

    <div className="search-drawer-body">
      <input
        type="text"
        placeholder="Type to search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />
      <button onClick={handleSearch} className="search-button">🔍 Search</button>
    </div>

    {loading ? (
      <p className="loading-text">Still Loading...</p>
    ) : (
      <div className="search-result-list">
        {searchResult.length > 0 ? (
          searchResult.map((user) => (
            <div key={user._id} className="search-result-item" onClick={()=>accessChat(user._id)} >
              <img src={user.pic} alt={user.name} className="user-avatar" />
              <div className="user-info">
                <div className="user-name">{user.name}</div>
                <div className="user-email">{user.email}</div>
              </div>
            </div>
          ))
        ) : (
          <p className="no-result-text">No results found</p>
        )}
        {loadingChat && <p className="loading-text">Loading Chat...</p>}
      </div>
    )}
  </div>

    </>
  );
};

export default SideDrawer;
