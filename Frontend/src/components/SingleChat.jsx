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
import io from 'socket.io-client';
import Lottie from 'react-lottie';
import animationData from '../animations/typing.json'

const ENDPOINT = "http://localhost:3000/";
var socket, selectedChatCompare;


const SingleChat = ({ fetchAgain, setFetchAgain }) => {

    const { showToast } = useCustomToast();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);


  const { user, selectedChat, setSelectedChat, notification, setNotification } = ChatState();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const handleProfileOpen = () => setIsProfileOpen(true);
  const handleProfileClose = () => setIsProfileOpen(false);

  const handleGroupModalOpen = () => setIsGroupModalOpen(true);
  const handleGroupModalClose = () => setIsGroupModalOpen(false);

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => {
      setSocketConnected(true);
    });

    socket.on("typing",()=>setIsTyping(true));
    socket.on("stop typing",()=>setIsTyping(false));

  },[]);

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append('upload_preset', 'Chat_App');
    formData.append('cloud_name', 'djqdchjjo');
  
    try {
      setUploading(true);
      const { data } = await axios.post(
        "https://api.cloudinary.com/v1_1/djqdchjjo/auto/upload", // auto will auto-detect the type
        formData
      );
      setUploading(false);
      return data.secure_url;
    } catch (error) {
      setUploading(false);
      showToast({
        title: "Upload Failed",
        description: "Could not upload media file",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      return null;
    }
  };
  

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
      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);

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
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message received", (newMessageReceived) => {
      if (!selectedChatCompare || selectedChatCompare._id !== newMessageReceived.chat._id) {
        if(!notification.includes(newMessageReceived)){
          setNotification([newMessageReceived,...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages( [...messages, newMessageReceived]);
      }
    });
  }); 



const handleSendMessage = async () => {
    socket.emit("stop typing", selectedChat._id);
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
  
      let mediaUrl = null;
      let messageType = "text";
  
      if (selectedFile) {
        mediaUrl = await uploadToCloudinary(selectedFile);
        if (!mediaUrl) return;
  
        const fileType = selectedFile.type.split("/")[0]; // image, audio, video
        messageType = fileType;
      }
  
      const { data } = await axios.post(
        "http://localhost:3000/api/message",
        {
          content: messageType === "text" ? newMessage : "",
          chatId: selectedChat,
          mediaUrl,
          messageType,
        },
        config
      );
  
      socket.emit("new message", data);
      setMessages([...messages, data]);
      setNewMessage("");
      setSelectedFile(null);
    } catch (error) {
      showToast({
        title: "Error Occurred!",
        description: "Failed to send the message to user",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
    }
  };
  

  let lastTypingTime = 0; 

const typingHandler = (e) => {  
  setNewMessage(e.target.value);

  if (!socketConnected) return;

  if (!typing) {
    setTyping(true);
    socket.emit("typing", selectedChat._id);
  }

  lastTypingTime = new Date().getTime(); 
  let timerLength = 3000;

  setTimeout(() => {
    let timeNow = new Date().getTime();
    let timeDiff = timeNow - lastTypingTime;
    if (timeDiff >= timerLength && typing) {
      socket.emit("stop typing", selectedChat._id);
      setTyping(false);
    }
  }, timerLength);
};

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
                <button onClick={handleProfileOpen} className="profile-btn ">
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
            {isTyping && (<div className="typing-indicator">
              <Lottie 
              options={defaultOptions}
              width={40}
              style={{marginBottom:15,marginLeft:0}}
              />
            </div>)}
            <div className="chat-input-area">
  <input
    type="text"
    placeholder="Type a message..."
    className="chat-input"
    value={newMessage}
    onChange={typingHandler}
    disabled={uploading}
  />

  <label className="upload-icon">
    +
    <input
      type="file"
      accept="image/*,audio/*,video/*"
      style={{ display: "none" }}
      onChange={(e) => setSelectedFile(e.target.files[0])}
    />
  </label>

  <button className="send-button" onClick={handleSendMessage} disabled={uploading}>
    {uploading ? "Sending..." : "Send"}
  </button>
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