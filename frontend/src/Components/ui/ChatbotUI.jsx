// ChatbotWidget.jsx
import React, { useState, useRef, useEffect } from "react";
import { MessageCircle } from "lucide-react";
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

  const handleMouseEnter = () => {
    gsap.to(iconRef.current, {
      scale: 1.2,
      boxShadow: "0 0 20px #7e22ce",
      duration: 0.3,
    });
  };

  const handleMouseLeave = () => {
    gsap.to(iconRef.current, {
      scale: 1,
      boxShadow: "0 0 0px transparent",
      duration: 0.3,
    });
  };

  return (
    <>
      {/* Chatbot Icon */}
      <div
        ref={iconRef}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-purple-600 text-white flex items-center justify-center rounded-full cursor-pointer shadow-lg"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <MessageCircle className="w-6 h-6" />
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div
          ref={chatRef}
          className="fixed bottom-20 left-6 z-40 w-80 h-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col"
        >
          <div className="bg-purple-600 text-white p-4 text-lg font-semibold">🤖 FoodLoop AI Chat</div>
          <div className="flex-1 p-3 overflow-y-auto text-sm text-gray-700">
            <p>Hello! 👋 How can I help you today?</p>
            <p className="mt-2 text-gray-500">Ask me anything about donations, FoodLoop features, or getting started.</p>
          </div>
          <div className="p-2 border-t flex">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border rounded-l-md outline-none text-sm"
            />
            <button className="bg-purple-600 px-4 text-white rounded-r-md text-sm">Send</button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;
