import PropTypes from "prop-types";
import { useState } from "react";

export default function ChatSidebar({ resumes, selectedResumeId, onResumeSelect }) {
  const [selectedMode, setSelectedMode] = useState(0);

  const modes = [
    { name: "Resume Assistant", icon: "🧠", description: "General resume help" },
    { name: "ATS Optimizer", icon: "🎯", description: "Improve ATS compatibility" },
    { name: "Career Planner", icon: "📈", description: "Career guidance" }
  ];

  const quickActions = [
    "Improve my summary",
    "Add quantifiable achievements",
    "Optimize for tech roles",
    "Check grammar & spelling"
  ];

  return (
    <aside className="w-80 bg-gradient-to-b from-green-50 to-green-100 border-r border-green-200 p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Resume AI</h2>
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
      </div>

      {/* New Chat */}
      <button className="w-full mb-6 px-4 py-3 rounded-lg border border-green-300 hover:border-green-400 hover:bg-green-100 transition-all text-left text-gray-700 hover:text-gray-900 flex items-center gap-2 shadow-sm">
        <span className="text-lg">+</span>
        New Chat
      </button>

      {/* Chat History */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Recent Chats</h3>
        <div className="space-y-2">
          {["Resume optimization", "Tech job prep", "Interview tips"].map((chat) => (
            <button
              key={chat}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-green-100 transition text-gray-600 hover:text-gray-800 text-sm truncate"
            >
              💬 {chat}
            </button>
          ))}
        </div>
      </div>

      {/* AI Modes */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">AI Modes</h3>
        <div className="space-y-2">
          {modes.map((mode, index) => (
            <button
              key={mode.name}
              onClick={() => setSelectedMode(index)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                index === selectedMode
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                  : 'hover:bg-green-100 text-gray-700 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{mode.icon}</span>
                <div>
                  <div className="font-medium">{mode.name}</div>
                  <div className="text-xs opacity-75">{mode.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Quick Actions</h3>
        <div className="space-y-2">
          {quickActions.map((action) => (
            <button
              key={action}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-green-100 transition text-gray-600 hover:text-gray-800 text-sm"
            >
              ⚡ {action}
            </button>
          ))}
        </div>
      </div>

      {/* Active Resume */}
      <div>
        <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Active Resume</h3>
        <select
          value={selectedResumeId}
          onChange={(e) => onResumeSelect(e.target.value)}
          className="w-full p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white border-none outline-none hover:from-green-600 hover:to-emerald-600 transition-all cursor-pointer shadow-sm"
        >
          {resumes.map((resume) => (
            <option key={resume._id} value={resume._id} className="bg-gray-100 text-gray-900">
              {resume.title} - {resume.firstName} {resume.lastName}
            </option>
          ))}
        </select>
      </div>
    </aside>
  );
}

ChatSidebar.propTypes = {
  resumes: PropTypes.array,
  selectedResumeId: PropTypes.string,
  onResumeSelect: PropTypes.func,
};