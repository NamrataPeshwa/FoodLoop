import React, { useState, useRef, useEffect } from "react";

import { gsap } from "gsap";

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const iconRef = useRef(null);
  const chatRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      gsap.fromTo(
        chatRef.current,
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }
      );
    }
  }, [isOpen]);

  

  

  const toggleChat = () => {
    setIsOpen(prev => !prev);
    gsap.to(iconRef.current, {
      y: isOpen ? 0 : -10,
      duration: 0.2,
    });
  };

  return (
    <>
      {/* Chat Icon Button */}
      <button
        ref={iconRef}
        className="fixed bottom-6 right-6 z-50 w-24 h-24 bg-transparent  flex items-center justify-center  "
        onClick={toggleChat}
        
        aria-label="Open Chatbot"
      >
        <img src="./mas1.png"></img>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          ref={chatRef}
          className="fixed bottom-24 right-6 w-80 h-96 bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden z-40"
        >
          <div className="bg-purple-600 text-white p-4 text-lg font-semibold">
            🤖 FoodLoop AI Chat
          </div>
          <div className="flex-1 p-3 overflow-y-auto text-sm text-gray-700">
            <p>Hello! 👋 How can I help you today?</p>
            <p className="mt-2 text-gray-500">
              Ask me anything about donations, FoodLoop features, or getting started.
            </p>
          </div>
          <div className="p-2 border-t flex">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border rounded-l-md outline-none text-sm"
            />
            <button className="bg-purple-600 px-4 text-white rounded-r-md text-sm">
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;
