import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { Send, MessageSquare, Sparkles, Trash2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatHistory = async () => {
    try {
      setInitialLoading(true);
      const response = await api.get('/chat/history/default');
      if (response.success && response.messages) {
        setMessages(response.messages);
      }
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message to UI immediately
    const newUserMessage = {
      role: 'user',
      message: userMessage,
      timestamp: new Date().toISOString(),
      _id: Date.now().toString(),
    };
    setMessages(prev => [...prev, newUserMessage]);

    setLoading(true);

    try {
      const response = await api.post('/chat/message', {
        message: userMessage,
      });

      if (response.success) {
        // Add AI response to UI
        const aiMessage = {
          role: 'assistant',
          message: response.message,
          timestamp: new Date().toISOString(),
          _id: (Date.now() + 1).toString(),
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error(error.response?.data?.message || 'Failed to send message');
      
      // Add error message to chat
      const errorMessage = {
        role: 'assistant',
        message: error.response?.data?.message || 'Sorry, I encountered an error. Please make sure the AI service is running.',
        timestamp: new Date().toISOString(),
        _id: (Date.now() + 1).toString(),
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = async () => {
    if (!confirm('Are you sure you want to clear all chat history?')) return;

    try {
      await api.delete('/chat/session/default');
      setMessages([]);
      toast.success('Chat history cleared');
    } catch (error) {
      toast.error('Failed to clear chat history');
      console.error(error);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (initialLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading chat...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-120px)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                AI Assistant
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                Ask questions about your inventory
              </p>
            </div>
          </div>
          
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="btn-secondary flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Clear Chat</span>
            </button>
          )}
        </div>

        {/* Chat Container */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-full mb-4">
                  <MessageSquare className="h-12 w-12 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Start a conversation
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md">
                  Ask me anything about your inventory, stock levels, or get insights and recommendations.
                </p>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                  <button
                    onClick={() => setInput("What's in my inventory?")}
                    className="p-3 text-left bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      What's in my inventory?
                    </p>
                  </button>
                  <button
                    onClick={() => setInput("Show me low stock items")}
                    className="p-3 text-left bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Show me low stock items
                    </p>
                  </button>
                  <button
                    onClick={() => setInput("What's my total inventory value?")}
                    className="p-3 text-left bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      What's my total inventory value?
                    </p>
                  </button>
                  <button
                    onClick={() => setInput("Which categories need restocking?")}
                    className="p-3 text-left bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Which categories need restocking?
                    </p>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] sm:max-w-[70%] ${
                        msg.role === 'user'
                          ? 'bg-primary-600 text-white'
                          : msg.isError
                          ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      } rounded-2xl px-4 py-3 shadow-sm`}
                    >
                      <div className="flex items-start gap-2">
                        {msg.role === 'assistant' && (
                          <div className={`p-1 rounded-full ${
                            msg.isError 
                              ? 'bg-red-200 dark:bg-red-800' 
                              : 'bg-primary-100 dark:bg-primary-900'
                          } flex-shrink-0`}>
                            <Sparkles className={`h-4 w-4 ${
                              msg.isError 
                                ? 'text-red-600 dark:text-red-400' 
                                : 'text-primary-600 dark:text-primary-400'
                            }`} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {msg.message || '(Empty response)'}
                          </p>
                          <p
                            className={`text-xs mt-2 ${
                              msg.role === 'user'
                                ? 'text-primary-100'
                                : msg.isError
                                ? 'text-red-500 dark:text-red-400'
                                : 'text-gray-500 dark:text-gray-400'
                            }`}
                          >
                            {formatTime(msg.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3 flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your inventory..."
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 disabled:opacity-50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="btn-primary px-6 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              AI can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Chat;
