import React, { useState } from 'react';
import { ChatState } from '../Context/chatProvider';
import './SingleChat.css';
import { getSender, getSenderFull } from '../config/ChatLogics';
import ProfileModal from '../components/Modals/Profile';
import UpdateGroupChatModel from '../components/Modals/UpdateGroupChatModel';
import { RxAvatar } from "react-icons/rx";
import { FiEdit } from "react-icons/fi";

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const { user, selectedChat } = ChatState();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  const handleProfileOpen = () => setIsProfileOpen(true);
  const handleProfileClose = () => setIsProfileOpen(false);

  const handleGroupModalOpen = () => setIsGroupModalOpen(true);
  const handleGroupModalClose = () => setIsGroupModalOpen(false);

  return (
    <div className="single-chat-container">
      {selectedChat ? (
        <>
          <div className="chat-header">
            <h2 className="chat-title">
              {selectedChat.isGroupChat
                ? selectedChat.chatName
                : getSender(user, selectedChat.users)}
            </h2>

            <div className="chat-actions">
              {!selectedChat.isGroupChat && (
                <button onClick={handleProfileOpen} className="profile-btn">
                  <RxAvatar />
                </button>
              )}

              {selectedChat.isGroupChat && (
                <button onClick={handleGroupModalOpen} className="profile-btn">
                  <FiEdit />
                </button>
              )}
            </div>
          </div>

          <div className="chat-messages">
            <p className="placeholder-text">Messages will appear here...</p>
          </div>

          <div className="chat-input-area">
            <input
              type="text"
              placeholder="Type a message..."
              className="chat-input"
            />
            <button className="send-button">Send</button>
          </div>

          {/* Profile Modal */}
          {isProfileOpen && (
            <ProfileModal
              userName={
                selectedChat.isGroupChat
                  ? selectedChat.chatName
                  : getSender(user, selectedChat.users)
              }
              userImage={
                selectedChat.isGroupChat
                  ? 'https://via.placeholder.com/150'
                  : getSenderFull(user, selectedChat.users).pic
              }
              onClose={handleProfileClose}
            />
          )}

          {/* Group Update Modal */}
          {isGroupModalOpen && selectedChat.isGroupChat && (
            <UpdateGroupChatModel
              fetchAgain={fetchAgain}
              setFetchAgain={setFetchAgain}
              onClose={handleGroupModalClose}
            />
          )}
        </>
      ) : (
        <div className="no-chat-selected">
          <p>Select a chat to start messaging</p>
        </div>
      )}
    </div>
  );
};

export default SingleChat;
