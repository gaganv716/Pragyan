import React, { useEffect } from 'react';
import axios from 'axios';
import { ChatState } from '../Context/chatProvider';
import SideDrawer from '../components/Miscellaneous/SideDrawer';
import MyChats from '../components/MyChats';
import ChatBox from '../components/ChatBox';
import "../public/css/ChatPage.css";

const ChatPage = () => {
  const user = ChatState();
  console.log("user is: ", user);
  console.log("hi chats is working");
 
  return (
    <div className="chatpage-container">
      {user && <SideDrawer />}

      <div className="chatpage-content">
        {user && <MyChats/>}
        {user && (
          <ChatBox />
        )}
      </div>
    </div>
  );
};

export default ChatPage;
