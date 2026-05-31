import React, { useState, useEffect } from 'react';
import { Mail, Search, MessageSquare, Send, ArrowLeft, ShieldCheck, User } from 'lucide-react';
import { useAppContext } from '../App';
import { motion, AnimatePresence } from 'motion/react';

// Mock chat profiles
const MOCK_CHATS = [
  {
    id: 'chat-1',
    participantId: 'user-2',
    name: 'Samuel Koroma',
    role: 'Agent',
    avatarInfo: 'S',
    lastMessage: 'Yes, the apartment is still available. Would you like to schedule a viewing?',
    timestamp: '10:42 AM',
    unread: 2,
    online: true,
    listingId: 'listing-102'
  },
  {
    id: 'chat-2',
    participantId: 'user-3',
    name: 'Aminata Kamara',
    role: 'Service Provider',
    avatarInfo: 'A',
    lastMessage: 'I can come over and fix the plumbing issue tomorrow morning.',
    timestamp: 'Yesterday',
    unread: 0,
    online: false,
    listingId: 'listing-205'
  }
];

export default function MessagesView() {
  const { currentView, setCurrentView } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChat, setActiveChat] = useState<typeof MOCK_CHATS[0] | null>(null);
  const [messages, setMessages] = useState<{id: string, text: string, sender: 'me'|'them', time: string}[]>([]);
  const [newMessage, setNewMessage] = useState('');

  // Load mock messages when opening a chat
  useEffect(() => {
    if (activeChat) {
      setMessages([
        { id: '1', text: `Hi ${activeChat.name}, I am interested in your services.`, sender: 'me', time: '10:30 AM' },
        { id: '2', text: activeChat.lastMessage, sender: 'them', time: activeChat.timestamp }
      ]);
    }
  }, [activeChat]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim()) return;
    
    setMessages([...messages, {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'me',
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    }]);
    setNewMessage('');

    // Auto reply for demonstration
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: "Thanks for your message. This is a secure channel. I will review and get back to you shortly.",
        sender: 'them',
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }]);
    }, 1500);
  };

  const filteredChats = MOCK_CHATS.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // If a chat is open, render the chat thread view
  if (activeChat) {
    return (
      <div className="flex flex-col h-[100dvh] absolute inset-0 z-[100] bg-slate-50">
        {/* Chat Header */}
        <div className="bg-white/90 backdrop-blur-md px-4 pt-12 md:pt-6 pb-4 flex items-center shadow-sm sticky top-0 z-20">
          <button 
            onClick={() => setActiveChat(null)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-700 active:bg-slate-100 transition-colors mr-2 -ml-2"
          >
            <ArrowLeft size={22} />
          </button>
          
          <div className="relative shrink-0 mr-3">
             <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-600 font-bold flex items-center justify-center">
               {activeChat.avatarInfo}
             </div>
             {activeChat.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>}
          </div>
          
          <div className="flex-1 min-w-0">
             <h2 className="font-bold text-slate-800 leading-tight truncate">{activeChat.name}</h2>
             <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                {activeChat.role}
                <ShieldCheck size={12} className="text-emerald-500" />
             </p>
          </div>
        </div>

        {/* Secure End-to-End Encryption Banner */}
        <div className="bg-sky-50 py-2 px-4 flex items-center justify-center gap-2 border-b border-sky-100 shadow-inner">
           <ShieldCheck size={14} className="text-emerald-500" />
           <p className="text-xs font-semibold text-slate-500 text-center">Messages are securely encrypted</p>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
           {messages.map((msg) => {
             const isMe = msg.sender === 'me';
             return (
               <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className={`flex ${isMe ? 'justify-end' : 'justify-start'}`} 
                 key={msg.id}
               >
                 <div className={`max-w-[80%] rounded-2xl p-3 ${isMe ? 'bg-sky-500 text-white rounded-tr-sm shadow-md shadow-sky-500/20' : 'bg-white text-slate-800 rounded-tl-sm shadow-sm border border-slate-100'}`}>
                    <p className="text-[15px] leading-relaxed mb-1">{msg.text}</p>
                    <p className={`text-[10px] font-medium text-right ${isMe ? 'text-sky-100' : 'text-slate-400'}`}>
                      {msg.time}
                    </p>
                 </div>
               </motion.div>
             )
           })}
        </div>

        {/* Message Input Container */}
        <div className="bg-white p-3 border-t border-slate-200 shadow-[0_-4px_10px_rgba(0,0,0,0.03)] pb-safe-bottom z-20 relative">
           <form onSubmit={handleSendMessage} className="flex items-center gap-2 max-w-3xl mx-auto w-full">
              <input 
                type="text"
                placeholder="Type your message securely..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 h-12 bg-slate-100 rounded-full px-5 text-[15px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all font-medium placeholder:text-slate-400"
              />
              <button 
                type="submit"
                disabled={!newMessage.trim()}
                className="w-12 h-12 bg-sky-500 text-white rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-50 disabled:bg-slate-300 transition-all"
              >
                <Send size={20} className="ml-1" />
              </button>
           </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white pt-10 md:pt-6 pb-6 px-4 shadow-sm relative z-10">
         <div className="flex justify-between items-center mb-6">
           <h1 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
             <MessageSquare className="text-sky-500" />
             Messages
           </h1>
           <div 
              className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center cursor-pointer border-2 border-white shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:opacity-80 transition-opacity ml-auto active:scale-95"
              onClick={() => setCurrentView('profile')}
              title="View Profile"
           >
              <User size={20} className="text-sky-600" />
           </div>
         </div>
         
         <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
               <Search size={18} />
            </div>
            <input 
               type="text"
               placeholder="Search conversations..."
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
               className="w-full bg-slate-100 text-slate-800 placeholder:text-slate-500 rounded-2xl py-3.5 pl-11 pr-4 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 transition-shadow"
            />
         </div>
      </div>

      <div className="flex-1 overflow-y-auto w-full">
         {filteredChats.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-400">
             <MessageSquare size={48} className="mb-4 text-slate-300" strokeWidth={1.5} />
             <p className="font-medium text-[15px]">No secure conversations found.</p>
           </div>
         ) : (
           <div className="flex flex-col">
             <AnimatePresence>
               {filteredChats.map(chat => (
                 <motion.div
                   key={chat.id}
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   onClick={() => setActiveChat(chat)}
                   className="flex items-center gap-4 p-4 bg-white border-b border-slate-100 cursor-pointer hover:bg-slate-50 active:bg-slate-100 transition-colors"
                 >
                   <div className="relative shrink-0">
                      <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 text-sky-600 font-bold flex items-center justify-center text-xl shadow-sm">
                        {chat.avatarInfo}
                      </div>
                      {chat.online && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>}
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                         <h3 className="font-bold text-slate-800 truncate">{chat.name}</h3>
                         <span className="text-xs font-semibold text-slate-400 shrink-0">{chat.timestamp}</span>
                      </div>
                      <p className="text-xs text-sky-600 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                        {chat.role}
                        {chat.role === 'Agent' && <ShieldCheck size={12} className="text-emerald-500" />}
                      </p>
                      <p className={`text-sm truncate ${chat.unread > 0 ? 'text-slate-800 font-semibold' : 'text-slate-500'}`}>
                        {chat.lastMessage}
                      </p>
                   </div>
                   {chat.unread > 0 && (
                     <div className="w-6 h-6 rounded-full bg-sky-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-sm shadow-sky-500/30">
                        {chat.unread}
                     </div>
                   )}
                 </motion.div>
               ))}
             </AnimatePresence>
           </div>
         )}
      </div>
    </div>
  );
}
