import PropTypes from 'prop-types';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

export default function ChatMessage({ message }) {
  const [copied, setCopied] = useState(false);
  const [reaction, setReaction] = useState(null);
  const [inserted, setInserted] = useState(false);
  const navigate = useNavigate();

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleReaction = (type) => {
    setReaction(reaction === type ? null : type);
  };

  const insertToResume = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setInserted(true);
      setTimeout(() => setInserted(false), 2000);
      // Navigate to resume editor (assuming the route exists)
      navigate('/dashboard/edit-resume');
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const hasResumeContent = message.role === 'assistant' && (
    message.content.toLowerCase().includes('resume') ||
    message.content.toLowerCase().includes('summary') ||
    message.content.toLowerCase().includes('experience') ||
    message.content.toLowerCase().includes('skills') ||
    message.content.includes('•') ||
    message.content.includes('- ')
  );

  const hasActionLinks = message.role === 'assistant' && (
    message.content.includes('[View Resume](view)') ||
    message.content.includes('[Revert Changes](revert)')
  );

  const isUser = message.role === "user";

  return (
    <div className={`message ${isUser ? 'ml-auto' : ''}`}>
      <div className={`message-bubble ${isUser ? 'user-bubble' : 'assistant-bubble'}`}>
        <div className="message-content">
          {isUser ? (
            typeof message.content === 'string' ? message.content : JSON.stringify(message.content)
          ) : (
            <div className="prose prose-sm prose-emerald max-w-none text-gray-700">
              <ReactMarkdown
                components={{
                  h3: ({ ...props }) => (
                    <h3 className="text-emerald-700 font-bold text-sm uppercase tracking-wider mb-3 mt-4 first:mt-0 flex items-center gap-2" {...props} />
                  ),
                  ul: ({ ...props }) => (
                    <ul className="space-y-2 mb-4 list-none p-0" {...props} />
                  ),
                  li: ({ children, ...props }) => (
                    <li className="flex items-start gap-2 text-[14px] leading-relaxed" {...props}>
                      <span className="text-emerald-500 mt-1.5">•</span>
                      <span>{children}</span>
                    </li>
                  ),
                  strong: ({ ...props }) => (
                    <strong className="font-semibold text-gray-900 bg-emerald-50 px-1 rounded" {...props} />
                  )
                }}
              >
                {typeof message.content === 'string' ? message.content : JSON.stringify(message.content)}
              </ReactMarkdown>
            </div>
          )}
        </div>

        <div className="message-footer">
          <span className="message-time">{formatTime(message.timestamp)}</span>
          <div className="message-actions">
            {message.role === 'assistant' && (
              <div className="reaction-buttons">
                <button
                  onClick={() => handleReaction('thumbs-up')}
                  className={`reaction-btn ${reaction === 'thumbs-up' ? 'active' : ''}`}
                  title="Helpful"
                >
                  👍
                </button>
                <button
                  onClick={() => handleReaction('thumbs-down')}
                  className={`reaction-btn ${reaction === 'thumbs-down' ? 'active' : ''}`}
                  title="Not helpful"
                >
                  👎
                </button>
              </div>
            )}
            <button
              onClick={copyToClipboard}
              className="copy-button"
              title="Copy message"
            >
              {copied ? '✓' : '📋'}
            </button>
            {hasResumeContent && (
              <button
                onClick={insertToResume}
                className="insert-button"
                title="Insert to Resume"
              >
                {inserted ? '✓' : '📝'}
              </button>
            )}
            {hasActionLinks && (
              <div className="action-buttons">
                {message.content.includes('[View Resume](view)') && (
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="view-button"
                    title="View Updated Resume"
                  >
                    👁️ View
                  </button>
                )}
                {message.content.includes('[Revert Changes](revert)') && (
                  <button
                    onClick={() => {
                      // Send revert message
                      const event = new CustomEvent('sendMessage', {
                        detail: { message: 'revert changes' }
                      });
                      window.dispatchEvent(event);
                    }}
                    className="revert-button"
                    title="Revert Changes"
                  >
                    ↩️ Revert
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

ChatMessage.propTypes = {
  message: PropTypes.shape({
    role: PropTypes.string.isRequired,
    content: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        agentDecision: PropTypes.string,
        result: PropTypes.shape({
          before: PropTypes.string,
          after: PropTypes.string,
        }),
      }),
    ]).isRequired,
    timestamp: PropTypes.instanceOf(Date),
  }).isRequired,
};