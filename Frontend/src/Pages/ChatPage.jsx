import React, { useEffect,useState } from 'react';
import axios from 'axios';
import { ChatState } from '../Context/chatProvider';
import SideDrawer from '../components/Miscellaneous/SideDrawer';
import MyChats from '../components/MyChats';
import ChatBox from '../components/ChatBox';
import "../public/css/ChatPage.css";

const ChatPage = () => {
  const user = ChatState();
  const [fetchAgain, setFetchAgain] = useState(false);
  return (
    <div className="chatpage-container">
      {user && <SideDrawer />}

      <div className="chatpage-content">
        {user && <MyChats fetchAgain={fetchAgain} />}
        {user && (
          <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain}/>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
