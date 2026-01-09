import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { Send, Loader2 } from "lucide-react";

export default function ChatInput({ onSend, loading }) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef(null);

  // Auto-resize textarea height
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
    }
  }, [message]);

  const handleSend = () => {
    if (!message.trim() || loading) return;
    onSend(message);
    setMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full px-6 py-6 bg-transparent">
      <div className="max-w-4xl ml-8">
        {/* Modern Integrated Input Container */}
        <div className="relative flex items-end gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-[26px] p-2 pr-3 shadow-sm focus-within:shadow-lg focus-within:shadow-green-200/50 focus-within:border-green-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-green-200 transition-all duration-300">
          
          <textarea
            ref={textareaRef}
            rows={1}
            className="flex-1 bg-transparent border-none px-4 py-3 outline-none text-[15px] text-gray-700 resize-none overflow-y-auto max-h-40"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          {/* Elegant Circular Send Button */}
          <button
            onClick={handleSend}
            disabled={loading || !message.trim()}
            className={`h-10 w-10 flex items-center justify-center rounded-full transition-all duration-300 shrink-0 mb-0.5
              ${
                loading || !message.trim()
                  ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                  : "bg-green-700 text-white shadow-lg shadow-green-200 hover:bg-green-800 active:scale-90"
              }`}
            aria-label="Send message"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-4.5 w-4.5 translate-x-0.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

ChatInput.propTypes = {
  onSend: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};