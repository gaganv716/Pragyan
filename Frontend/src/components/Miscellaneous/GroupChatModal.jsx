import React, { useState } from 'react';
import axios from 'axios';
import './GroupChatModal.css';
import { ChatState } from "../../Context/chatProvider";

const GroupChatModal = ({ isOpen, onClose }) => {
  const [groupName, setGroupName] = useState('');
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const { user,chats,setChats } = ChatState();

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      setSearchResult([]);
      return;
    }
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`http://localhost:3000/api/users?search=${query}`, config);
      setSearchResult(data);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const handleAddUser = (userToAdd) => {
    if (selectedUsers.find((u) => u._id === userToAdd._id)) return;
    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  const handleRemoveUser = (userToRemove) => {
    setSelectedUsers(selectedUsers.filter((u) => u._id !== userToRemove._id));
  };

  const handleSubmit = async () => {
    if (!groupName || !selectedUsers) {
      alert("Please fill all the fields");
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        `http://localhost:3000/api/chats/group`,
        {
          name: groupName,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        config
      );
      console.log("the data is",data);
      setChats([data, ...chats]);
      // onClose();
      alert("New Group Created!");
    } catch (error) {
      alert("fialed to create group");
      console.error("Error creating group chat:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Group Chat</h2>
        <button className="close-button" onClick={onClose}>×</button>

        <input
          type="text"
          placeholder="Enter Chat Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="input-field"
        />

        <div className="selected-users">
          {selectedUsers.map((user) => (
            <div key={user._id} className="user-tag">
              {user.name}
              <span className="remove-btn" onClick={() => handleRemoveUser(user)}>×</span>
            </div>
          ))}
        </div>

        <input
          type="text"
          placeholder="Add Users"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="input-field"
        />

        <div className="search-results">
          {searchResult.map((user) => (
            <div
              key={user._id}
              className="search-item"
              onClick={() => handleAddUser(user)}
            >
              <strong>{user.name}</strong> ({user.email})
            </div>
          ))}
        </div>

        <button className="create-btn" onClick={handleSubmit}>
          Create Group
        </button>
      </div>
    </div>
  );
};

export default GroupChatModal;
