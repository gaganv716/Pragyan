import React, { useState } from 'react';
import { ChatState } from '../../Context/chatProvider';
import './UpdateGroupChatModel.css';
import axios from 'axios';
import { useCustomToast } from "../Miscellaneous/Toast";

const Backend = import.meta.env.VITE_BACKEND_URL;
const Cloudinary = import.meta.env.VITE_CLOUDINARY_URL ;

const UpdateGroupChatModel = ({ fetchAgain, setFetchAgain, onClose, fetchMessages }) => {
  const [groupChatName, setGroupChatName] = useState("");
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);

  const { showToast } = useCustomToast();
  const { selectedChat, setSelectedChat, user } = ChatState();

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) return;

    const config = {
      headers: { Authorization: `Bearer ${user.token}` },
    };

    try {
      const { data } = await axios.get(`${Backend}/api/users?search=${query}`, config);
      setSearchResult(data);
    } catch (error) {
      showToast({
        title: "Failed to search users!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const handleRename = async () => {
    if (!groupChatName) return;

    const config = {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
    };

    try {
      const { data } = await axios.put(`${Backend}/api/chats/rename`, {
        chatId: selectedChat._id,
        chatName: groupChatName
      }, config);

      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setGroupChatName("");
    } catch (error) {
      showToast({
        title: "Failed to rename group!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const handleRemove = async (user1) => {
    if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id) {
      showToast({
        title: "Only admins can remove someone!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
      };

      const { data } = await axios.put(`${Backend}/api/chats/groupremove`, {
        chatId: selectedChat._id,
        userId: user1._id
      }, config);

      user1._id === user._id ? setSelectedChat() : setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      if (fetchMessages) fetchMessages();
      setLoading(false);
    } catch (error) {
      showToast({
        title: "Error Occured!",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
      setLoading(false);
    }
    setGroupChatName("");
  };

  const handleAdd = async (userToAdd) => {
    const config = {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
    };

    try {
      const { data } = await axios.put(`${Backend}/api/chats/groupadd`, {
        chatId: selectedChat._id,
        userId: userToAdd._id,
      }, config);

      setSelectedChat(data); // Update the selected chat with new data
      setFetchAgain(!fetchAgain); // Trigger a re-fetch
      setSearch(""); // Clear the search field after adding user
      setSearchResult([]); // Clear search results
    } catch (error) {
      showToast({
        title: "Failed to add user!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Manage Group: {selectedChat.chatName}</h2>
        <div className="users-list">
          {selectedChat.users.map((u) => (
            <div className="user-item" key={u._id}>
              <div className="user-info">
                <img src={u.pic} alt={u.name} className="user-avatar" />
                <span className="user-name">{u.name}</span>
              </div>
              <button
                onClick={() => handleRemove(u)}
                className="user-action-btn"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <input
          type="text"
          value={groupChatName}
          onChange={(e) => setGroupChatName(e.target.value)}
          placeholder="New Group Name"
          className="input-box"
        />
        <button onClick={handleRename} className="btn primary">Rename</button>

        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search Users to Add"
          className="input-box"
        />
        <div className="search-result">
          {searchResult.map((u) => (
            <div className="search-item" key={u._id}>
              <img src={u.pic} alt={u.name} />
              <span>{u.name}</span>
              <button 
                className="btn small" 
                onClick={() => handleAdd(u)} // Add functionality here
              >
                Add
              </button>
            </div>
          ))}
        </div>

        <button onClick={onClose} className="btn secondary">Close</button>
      </div>
    </div>
  );
};

export default UpdateGroupChatModel;
