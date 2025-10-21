import { useState, useRef, useEffect } from 'react';
import { Search, Mic, Sparkles, TrendingUp, Package, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AISearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Sample AI suggestions - can be dynamic from API
  const suggestions = [
    { 
      icon: Package, 
      text: "Show me products low in stock", 
      color: "text-amber-500",
      action: () => navigate('/inventory?filter=low-stock')
    },
    { 
      icon: TrendingUp, 
      text: "What's my inventory value trend?", 
      color: "text-green-500",
      action: () => navigate('/analytics')
    },
    { 
      icon: AlertCircle, 
      text: "Which items are out of stock?", 
      color: "text-red-500",
      action: () => navigate('/inventory?filter=out-of-stock')
    },
    { 
      icon: Sparkles, 
      text: "Get AI insights about my inventory", 
      color: "text-purple-500",
      action: () => navigate('/chat')
    },
  ];

  // Voice recording simulation (you can integrate real speech recognition)
  const handleVoiceInput = () => {
    setIsListening(!isListening);
    if (!isListening) {
      // Simulate voice input
      setTimeout(() => {
        setQuery("Show me low stock items");
        setIsListening(false);
      }, 2000);
    }
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    if (query.trim()) {
      if (onSearch) {
        onSearch(query);
      }
      // Navigate to chat with query
      navigate(`/chat?query=${encodeURIComponent(query)}`);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.text);
    setShowSuggestions(false);
    if (suggestion.action) {
      suggestion.action();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-4xl mx-auto mb-8 animate-fade-in-up">
      {/* AI Badge */}
      <div className="flex items-center justify-center mb-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyber-cyan/10 to-cyber-purple/10 border border-cyber-cyan/20 rounded-full backdrop-blur-sm">
          <Sparkles className="h-4 w-4 text-cyber-cyan animate-pulse-slow" />
          <span className="text-sm font-medium bg-gradient-to-r from-cyber-cyan to-cyber-purple bg-clip-text text-transparent">
            AI-Powered Natural Language Search
          </span>
        </div>
      </div>

      {/* Search Bar Container */}
      <div 
        ref={inputRef}
        className={`
          relative group
          transition-all duration-500 ease-smooth
          ${isFocused ? 'scale-[1.02]' : 'scale-100'}
        `}
      >
        {/* Glassmorphic Search Bar */}
        <form onSubmit={handleSearch} className="relative">
          <div 
            className={`
              relative
              bg-white/10 dark:bg-gray-900/50
              backdrop-blur-xl
              border-2 
              ${isFocused ? 'border-cyber-cyan shadow-glow-cyan' : 'border-white/20 dark:border-gray-700/50'}
              rounded-2xl
              overflow-hidden
              transition-all duration-300
            `}
          >
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyber-cyan/5 via-cyber-purple/5 to-cyber-teal/5 pointer-events-none" />
            
            {/* Input Container */}
            <div className="relative flex items-center px-6 py-4">
              {/* Search Icon */}
              <Search className={`
                h-6 w-6 mr-4 transition-colors duration-300
                ${isFocused ? 'text-cyber-cyan' : 'text-gray-400 dark:text-gray-500'}
              `} />

              {/* Input Field */}
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => {
                  setIsFocused(true);
                  setShowSuggestions(true);
                }}
                placeholder="Ask anything about your inventory..."
                className="
                  flex-1 bg-transparent
                  text-gray-900 dark:text-white
                  placeholder-gray-500 dark:placeholder-gray-400
                  text-lg font-medium
                  outline-none
                  transition-all duration-300
                "
              />

              {/* Voice Input Button */}
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`
                  ml-4 p-3 rounded-xl
                  transition-all duration-300
                  ${isListening 
                    ? 'bg-red-500 text-white shadow-glow-pink' 
                    : 'bg-cyber-cyan/10 text-cyber-cyan hover:bg-cyber-cyan/20'
                  }
                `}
              >
                <Mic className={`h-5 w-5 ${isListening ? 'animate-pulse' : ''}`} />
              </button>
            </div>

            {/* Voice Wave Animation */}
            {isListening && (
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-1 px-6 pb-2">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-gradient-to-t from-cyber-cyan to-cyber-purple rounded-full animate-wave"
                    style={{
                      height: `${Math.random() * 20 + 10}px`,
                      animationDelay: `${i * 0.05}s`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </form>

        {/* AI Suggestions Dropdown */}
        {showSuggestions && !isListening && (
          <div className="
            absolute top-full mt-2 left-0 right-0
            bg-white/10 dark:bg-gray-900/90
            backdrop-blur-xl
            border border-white/20 dark:border-gray-700/50
            rounded-2xl
            shadow-glass
            overflow-hidden
            animate-slide-down
            z-50
          ">
            <div className="p-4">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
                💡 Try asking:
              </p>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="
                      w-full flex items-center gap-3 px-4 py-3
                      bg-white/5 hover:bg-white/10
                      dark:bg-gray-800/50 dark:hover:bg-gray-800/80
                      border border-white/10 dark:border-gray-700/50
                      rounded-xl
                      transition-all duration-300
                      group
                    "
                  >
                    <div className={`p-2 rounded-lg bg-gradient-to-br from-${suggestion.color.split('-')[1]}-500/20 to-${suggestion.color.split('-')[1]}-600/20`}>
                      <suggestion.icon className={`h-5 w-5 ${suggestion.color}`} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                      {suggestion.text}
                    </span>
                    <Sparkles className="h-4 w-4 ml-auto text-cyber-cyan opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Helper Text */}
      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
        <span className="inline-flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-cyber-cyan" />
          Powered by AI • Natural language supported • Try using voice input
        </span>
      </p>
    </div>
  );
};

export default AISearchBar;
