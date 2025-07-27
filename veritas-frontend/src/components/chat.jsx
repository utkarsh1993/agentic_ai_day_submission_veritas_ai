import React from 'react';
import '../App.css';

const ChatButton = () => {
  const handleClick = () => {
    window.location.href = '/ask';
  };

  return (
    <button
      className="chat-button"
      onClick={handleClick}
      title="Ask Me Anything"
    >
      Ask💬
    </button>
  );
};

export default ChatButton;
