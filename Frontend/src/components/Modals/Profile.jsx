import React from 'react';
import './ProfileModal.css';

const ProfileModal = ({ userName, userImage, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <img src={userImage} alt={userName} className="profile-image" />
        <h2 className="profile-name">{userName}</h2>
        <button onClick={onClose} className="close-btn">Close</button>
      </div>
    </div>
  );
};

export default ProfileModal;
