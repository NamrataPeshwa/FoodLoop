import React, { useState, useRef, useEffect } from "react";

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const iconRef = useRef(null);
  const chatRef = useRef(null);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hello! 👋 How can I help you today?" },
  ]);
  const [input, setInput] = useState("");

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

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { from: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    const sessionId = localStorage.getItem("df_session_id") || (() => {
      const id = crypto.randomUUID(); // or uuidv4()
      localStorage.setItem("df_session_id", id);
      return id;
    })();

    try {
      const res = await fetch(
        `https://dialogflow.googleapis.com/v2/projects/YOUR_PROJECT_ID/agent/sessions/${sessionId}:detectIntent`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer YOUR_SERVICE_ACCOUNT_TOKEN`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            queryInput: {
              text: {
                text: input,
                languageCode: "en", // Or "hi", "ta", etc.
              },
            },
          }),
        }
      );

      const data = await res.json();
      const botMessage = {
        from: "bot",
        text: data.queryResult?.fulfillmentText || "🤖 Sorry, I didn't get that.",
      };

      setMessages((prev) => [...prev, botMessage]);
      setInput("");
    } catch (error) {
      console.error("Dialogflow Error:", error);
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "⚠️ Failed to reach assistant." },
      ]);
    }
  };

  return (
    <>
      {/* Chat Icon Button */}
      <button
        ref={iconRef}
        className="fixed bottom-6 right-6 z-50 w-24 h-24 bg-transparent flex items-center justify-center"
        onClick={toggleChat}
        aria-label="Open Chatbot"
      >
        <img src="./mas1.png" alt="Chat icon" />
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
          
          {/* Messages display area - replaced static content with dynamic messages */}
          <div className="flex-1 p-3 overflow-y-auto text-sm text-gray-700 space-y-2">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`px-3 py-2 rounded-lg max-w-xs ${
                    msg.from === "user" ? "bg-amber-100 text-right" : "bg-gray-100 text-left"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-2 border-t flex">
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-l-md outline-none text-sm"
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="bg-amber-500 hover:bg-amber-700 px-4 text-white rounded-r-md text-sm transition-all duration-75"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;