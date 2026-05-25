import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles, Bot, ArrowRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const ChatbotWidget = () => {
  const { products, currency, navigate } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(true); // Unread dot initially
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hello! 👋 I'm VMS Assistant, your AI shopping concierge. How can I help you shop at VMS Super Mart today?",
      time: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // Suggestions pills for shopper quick triggers
  const suggestionPills = [
    { text: "Fresh grocery in stock?", label: "Groceries" },
    { text: "What are your delivery fees?", label: "Delivery" },
    { text: "What is your return policy?", label: "Returns" },
    { text: "Store location and hours?", label: "Timings" }
  ];

  // Auto scroll chat feed on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    // Add user message to state
    const userMsg = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: query,
      time: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/chatbot/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query })
      });

      if (!res.ok) throw new Error('API request failed');
      const data = await res.json();

      // Add AI reply to state
      const aiMsg = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: data.reply,
        time: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      // Fallback greeting if network failure
      const errorMsg = {
        id: `ai_err_${Date.now()}`,
        sender: 'ai',
        text: "I'm having a bit of trouble connecting to our server right now. VMS Super Mart delivers to Akuressa & Matara daily. What groceries or electronics are you searching for?",
        time: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Helper to extract product card markup [PRODUCT_CARD:id] from message text
  const renderMessageContent = (msg) => {
    const text = msg.text;
    const cardRegex = /\[PRODUCT_CARD:(\d+)\]/g;
    
    // Clean text by stripping card codes
    const cleanText = text.replace(cardRegex, '').trim();
    
    // Find all referenced product IDs
    const matches = [...text.matchAll(cardRegex)];
    const referencedProducts = matches
      .map(m => {
        const id = parseInt(m[1]);
        return products.find(p => p.id === id);
      })
      .filter(Boolean);

    return (
      <div className="space-y-3">
        {cleanText && <p className="leading-relaxed whitespace-pre-line">{cleanText}</p>}
        
        {/* Render interactive dynamic product cards */}
        {referencedProducts.length > 0 && (
          <div className="space-y-2 mt-2 pt-2 border-t border-white/10">
            {referencedProducts.map(product => (
              <div 
                key={product.id}
                className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 flex items-center gap-3 hover:border-[#00FF33]/50 transition-colors shadow-lg"
              >
                {product.images && product.images.length > 0 ? (
                  <img 
                    src={`${import.meta.env.VITE_API_URL || ''}${product.images[0]}`} 
                    alt={product.name}
                    className="w-12 h-12 rounded-lg object-cover bg-slate-900 border border-slate-800"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-slate-600" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-[#00FF33] font-bold uppercase tracking-wider">In Stock</p>
                  <h4 className="text-xs font-bold text-white truncate mt-0.5">{product.name}</h4>
                  <p className="text-xs font-black text-[#00FF33] font-mono mt-0.5">Rs.{product.price.toLocaleString()}</p>
                </div>
                
                <button 
                  onClick={() => {
                    setIsOpen(false);
                    navigate(`/product/${product.slug}`);
                  }}
                  className="p-2 bg-[#00FF33] hover:bg-[#00FF33]/80 text-slate-950 rounded-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="non-printable select-none">
      {/* Floating Chat Bubble Button */}
      <motion.div 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsOpen(!isOpen);
          setHasNewMessage(false);
        }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-tr from-[#00CC29] to-[#00FF33] text-slate-950 rounded-full flex items-center justify-center shadow-2xl cursor-pointer z-50 border-2 border-white/20 hover:shadow-[#00FF33]/20 shadow-lg"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-slate-950" />
        ) : (
          <div className="relative">
            <MessageCircle className="w-6 h-6 text-slate-950" />
            {hasNewMessage && (
              <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-slate-950 animate-pulse" />
            )}
          </div>
        )}
      </motion.div>

      {/* Slide-in Chat Panel Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 w-[360px] h-[520px] bg-slate-900/95 backdrop-blur-xl border border-slate-800 shadow-2xl flex flex-col justify-between z-50 rounded-2xl overflow-hidden"
          >
            {/* Top Glowing Trim */}
            <div className="h-[3px] bg-gradient-to-r from-[#00CC29] via-[#00FF33] to-[#00FF33] w-full" />
            
            {/* Header HUD */}
            <div className="p-4 border-b border-slate-800 bg-slate-950/65 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-[#00CC29] to-[#00FF33] flex items-center justify-center border border-white/10">
                  <Bot className="w-4.5 h-4.5 text-slate-950" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#00FF33] rounded-full border-2 border-slate-950 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">VMS AI Assistant</h3>
                  <p className="text-[9px] text-[#00FF33] font-bold uppercase tracking-widest font-mono">Shopping Concierge</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Message Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map(msg => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-xs shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-[#00FF33] text-slate-950 font-black rounded-tr-none'
                      : 'bg-slate-800/90 text-slate-100 border border-slate-700/40 rounded-tl-none'
                  }`}>
                    {renderMessageContent(msg)}
                  </div>
                </div>
              ))}
              
              {/* Dynamic Animated Typing Indicator */}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 rounded-2xl rounded-tl-none px-4 py-3 border border-slate-700/40 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#00FF33] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#00FF33] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#00FF33] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>

            {/* Suggestion Quick Chips */}
            {messages.length === 1 && !loading && (
              <div className="px-4 py-2 flex flex-wrap gap-1.5 border-t border-slate-800/60 bg-slate-950/20">
                {suggestionPills.map(pill => (
                  <button
                    key={pill.label}
                    onClick={() => handleSendMessage(pill.text)}
                    className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-[#00FF33] hover:text-white rounded-none transition-colors"
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 border-t border-slate-800 bg-slate-950/50 flex gap-2"
            >
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask VMS Assistant..."
                disabled={loading}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00FF33] transition-colors"
              />
              <button 
                type="submit"
                disabled={loading || !input.trim()}
                className="p-2.5 bg-gradient-to-tr from-[#00CC29] to-[#00FF33] hover:brightness-110 text-slate-950 rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center cursor-pointer"
              >
                <Send className="w-4 h-4 text-slate-950" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatbotWidget;
