import React, { useState } from 'react';
import axios from 'axios';
import './GroupChatModal.css';
import { ChatState } from "../../Context/chatProvider";
import { useCustomToast } from "../Miscellaneous/Toast";


const Backend = import.meta.env.VITE_BACKEND_URL;
const Cloudinary = import.meta.env.VITE_CLOUDINARY_URL ;

const GroupChatModal = ({ isOpen, onClose }) => {

  const { showToast } = useCustomToast();

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
      const { data } = await axios.get(`${Backend}/api/users?search=${query}`, config);
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
      showToast({
        title: "Error Occurred!",
        description: "Please fill all the fields",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        `${Backend}/api/chats/group`,
        {
          name: groupName,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        config
      );
      console.log("the data is",data);
      setChats([data, ...chats]);
      // onClose();
      showToast({
        title: "Success!",
        description: "New Group Created!",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
    } catch (error) {
      showToast({
        title: "Error Occurred!",
        description: "Failed to create group",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
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
