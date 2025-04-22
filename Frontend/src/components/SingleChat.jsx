import React, { useState,useEffect } from 'react';
import { ChatState } from '../Context/chatProvider';
import './SingleChat.css';
import { getSender, getSenderFull } from '../config/ChatLogics';
import ProfileModal from '../components/Modals/Profile';
import UpdateGroupChatModel from '../components/Modals/UpdateGroupChatModel';
import { RxAvatar } from "react-icons/rx";
import { FiEdit } from "react-icons/fi";
import Spinner from './Spinner';
import axios from 'axios';
import ScrollableChat from './ScrollableChat';
import { useCustomToast } from "../components/Miscellaneous/Toast";

const SingleChat = ({ fetchAgain, setFetchAgain }) => {

    const { showToast } = useCustomToast();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  const { user, selectedChat } = ChatState();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  const handleProfileOpen = () => setIsProfileOpen(true);
  const handleProfileClose = () => setIsProfileOpen(false);

  const handleGroupModalOpen = () => setIsGroupModalOpen(true);
  const handleGroupModalClose = () => setIsGroupModalOpen(false);

  var socket, selectedChatCompare;

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(
        `http://localhost:3000/api/message/${selectedChat._id}`,
        config
      );
      console.log(data);
      setMessages(data);
      setLoading(false);

    } catch (error) {
      showToast({
        title: "Error Occurred!",
        description: "Failed to load users earlier messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
    }
  };

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
    // eslint-disable-next-line
  }, [selectedChat]);

  const handleSendMessage = async (e) => {
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      setNewMessage("");
      const { data } = await axios.post(
        "http://localhost:3000/api/message",
        {
          content: newMessage,
          chatId: selectedChat,
        },
        config
      );

      setMessages([...messages, data]);
    } catch (error){
      showToast({
        title: "Error Occurred!",
        description: "Failed to send the message to user",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
    }
  }

  const typingHandler = (e) => {  
    setNewMessage(e.target.value);
  }

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
            {/* <p className="placeholder-text">Messages will appear here...</p> */}
            {
              loading ? (
                <Spinner />
              ) : messages.length > 0 ? (
                <ScrollableChat messages={messages} currentUserId={user._id} />
                // messages.map((message) => (
                //   <div key={message._id} className="message">
                //     <p className="message-text">{message.content}</p>
                //   </div>
                // ))
              ) : (
                <p className="no-messages">No messages yet</p>
              )
            }
          </div>

          <div className="chat-input-area">
            <input
              type="text"
              placeholder="Type a message..."
              className="chat-input"
              value={newMessage}
              onChange={typingHandler}
            />
            <button className="send-button" onClick={handleSendMessage}>Send</button>
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
