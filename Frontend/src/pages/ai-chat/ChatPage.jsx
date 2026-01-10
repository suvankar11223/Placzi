import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ChatSidebar from "./ChatSidebar";
import ChatMessage from "./ChatMessage";
import ChatInput from "@/components/ai/ChatInput";
import TypingDots from "@/components/ui/TypingDots";
import { getAllResumeData } from "@/Services/resumeAPI";
import { VITE_APP_URL } from "@/config/config";
import "./chat.css";

export default function ChatPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "👋 Hi! I've analyzed your resume. Want to improve ATS score or rewrite experience bullets?",
      timestamp: new Date()
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [selectedResume, setSelectedResume] = useState(null);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const response = await getAllResumeData();
        if (response.statusCode === 200) {
          setResumes(response.data);
          if (response.data.length > 0) {
            setSelectedResumeId(response.data[0]._id);
            setSelectedResume(response.data[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching resumes:", error);
      }
    };
    fetchResumes();
  }, []);

  const sendMessage = useCallback(async (message) => {
    if (!message.trim() || !selectedResumeId) return;

    const userMsg = { role: "user", content: message, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch(`${VITE_APP_URL}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          resumeId: selectedResumeId,
          message: message,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response, timestamp: new Date() },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, there was an error processing your request. Please try again.", timestamp: new Date() },
      ]);
    }

    setLoading(false);
  }, [selectedResumeId]);

  // Listen for revert button clicks
  useEffect(() => {
    const handleRevertEvent = (event) => {
      sendMessage(event.detail.message);
    };

    window.addEventListener('sendMessage', handleRevertEvent);
    return () => window.removeEventListener('sendMessage', handleRevertEvent);
  }, [sendMessage]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-green-50 to-green-100 text-gray-900">
      <ChatSidebar
        resumes={resumes}
        selectedResumeId={selectedResumeId}
        onResumeSelect={(id) => {
          setSelectedResumeId(id);
          setSelectedResume(resumes.find(r => r._id === id));
        }}
      />

      <main className="flex-1 flex flex-col">
        {/* TOP BAR */}
        <div className="p-4 border-b border-green-200 flex justify-between items-center bg-white/50 backdrop-blur-sm">
          <span className="text-sm text-gray-600">
            Chatting with: <b className="text-gray-900">{selectedResume ? `${selectedResume.title} - ${selectedResume.firstName} ${selectedResume.lastName}` : 'No resume selected'}</b>
          </span>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full border border-green-200">
              AI Ready
            </span>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center text-gray-600 hover:text-gray-900"
              title="Exit Chat"
            >
              ✕
            </button>
          </div>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, i) => (
            <ChatMessage key={i} message={msg} />
          ))}
          {loading && (
            <div className="message">
              <div className="assistant-bubble">
                <TypingDots />
              </div>
            </div>
          )}
        </div>

        {/* INPUT BAR */}
        <ChatInput onSend={sendMessage} loading={loading} />
      </main>
    </div>
  );
}