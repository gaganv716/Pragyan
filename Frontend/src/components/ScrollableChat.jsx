import React, { useRef, useState, useEffect } from 'react';
import './ScrollableChat.css';

const AudioPlayer = ({ src }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (time) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  return (
    <div className="custom-audio">
      <button className="audio-btn" onClick={togglePlayPause}>
        {isPlaying ? '⏸️' : '▶️'}
      </button>
      <input
        type="range"
        min="0"
        max={duration || 0}
        step="0.1"
        value={currentTime}
        onChange={handleSeek}
        className="seek-bar"
      />
      <span className="audio-time">{formatTime(currentTime)} / {formatTime(duration)}</span>
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />
    </div>
  );
};

const ScrollableChat = ({ messages, currentUserId }) => {
  return (
    <div className="chat-container">
      {messages.map((msg) => (
        <div
          key={msg._id}
          className={`message-bubble ${msg.sender._id === currentUserId ? 'own-message' : 'other-message'}`}
        >
          {msg.chat.isGroupChat && msg.sender._id !== currentUserId && (
            <div className="sender-name">{msg.sender.name}</div>
          )}

          <div className="message-content">
            {msg.messageType === 'text' && <p>{msg.content}</p>}
            {msg.messageType === 'image' && <img src={msg.mediaUrl} alt="sent" className="media-image" />}
            {msg.messageType === 'video' && <video src={msg.mediaUrl} controls className="media-video" />}
            {msg.messageType === 'audio' && <AudioPlayer src={msg.mediaUrl} />}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ScrollableChat;
