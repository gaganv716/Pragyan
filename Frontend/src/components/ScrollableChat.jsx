import React from 'react';
import './ScrollableChat.css';

const ScrollableChat = ({ messages, currentUserId }) => {
  return (
    <div className="chat-container">
      {messages.map((msg) => (
        <div
          key={msg._id}
          className={`message-bubble ${
            msg.sender._id === currentUserId ? 'own-message' : 'other-message'
          }`}
        >
          {msg.chat.isGroupChat && msg.sender._id !== currentUserId && (
            <div className="sender-name">{msg.sender.name}</div>
          )}
          <div className="message-content">{msg.content}</div>
        </div>
      ))}
    </div>
  );
};

export default ScrollableChat;
