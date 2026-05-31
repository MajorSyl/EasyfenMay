import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, MessageCircle, Loader as Loader2, User } from 'lucide-react';
import { Conversation, Message, Profile } from '../types';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';

export default function MessagesView() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsLoading(false); return; }
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (profile) setCurrentUser(profile as Profile);
      await fetchConversations(user.id);
    };
    init();
  }, []);

  const fetchConversations = async (userId: string) => {
    setIsLoading(true);
    const { data } = await supabase
      .from('conversations')
      .select(`
        *,
        listing:listings(id, title, images, price, location_name),
        buyer:profiles!conversations_buyer_id_fkey(id, full_name, avatar_url),
        agent:profiles!conversations_agent_id_fkey(id, full_name, avatar_url)
      `)
      .or(`buyer_id.eq.${userId},agent_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });
    if (data) setConversations(data as any as Conversation[]);
    setIsLoading(false);
  };

  if (selected && currentUser) {
    return (
      <ChatThread
        conversation={selected}
        currentUser={currentUser}
        onBack={() => setSelected(null)}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white px-4 pt-12 md:pt-6 pb-4 shadow-sm sticky top-0 z-10">
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Messages</h1>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center flex-1 text-slate-400">
          <Loader2 className="animate-spin mr-2" size={22} /> Loading chats...
        </div>
      ) : conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-slate-400 px-8 text-center">
          <MessageCircle size={44} className="mb-4 opacity-20" />
          <p className="font-bold text-base text-slate-600">No messages yet</p>
          <p className="text-sm mt-1">Start a conversation from any listing page</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {conversations.map(conv => (
            <ConversationRow
              key={conv.id}
              conversation={conv}
              currentUserId={currentUser?.id ?? ''}
              onClick={() => setSelected(conv)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ConversationRow({ conversation: c, currentUserId, onClick }: {
  conversation: Conversation;
  currentUserId: string;
  onClick: () => void;
}) {
  const other = currentUserId === c.buyer_id ? c.agent : c.buyer;
  const listingImg = (c.listing as any)?.images?.[0];
  const listingTitle = (c.listing as any)?.title ?? 'Unknown listing';

  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-4 px-4 py-4 hover:bg-slate-50 active:bg-slate-100 transition-colors border-b border-slate-100 text-left">
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="w-12 h-12 rounded-full bg-sky-100 overflow-hidden flex items-center justify-center">
          {(other as any)?.avatar_url
            ? <img src={(other as any).avatar_url} className="w-full h-full object-cover" alt="" />
            : <span className="font-black text-sky-600">{(other as any)?.full_name?.charAt(0) ?? '?'}</span>}
        </div>
        {listingImg && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white overflow-hidden bg-slate-200">
            <img src={listingImg} className="w-full h-full object-cover" alt="" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <p className="font-bold text-slate-800 text-sm truncate">{(other as any)?.full_name ?? 'Unknown'}</p>
          <p className="text-[11px] text-slate-400 shrink-0 ml-2">
            {new Date(c.last_message_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </p>
        </div>
        <p className="text-xs text-slate-500 truncate">{listingTitle}</p>
      </div>
    </button>
  );
}

function ChatThread({ conversation, currentUser, onBack }: {
  conversation: Conversation;
  currentUser: Profile;
  onBack: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const other = currentUser.id === conversation.buyer_id ? conversation.agent : conversation.buyer;

  useEffect(() => {
    fetchMessages();
    // Realtime subscription
    const channel = supabase
      .channel(`conv:${conversation.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversation.id}`,
      }, payload => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversation.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true });
    if (data) setMessages(data as Message[]);
    setIsLoading(false);
  };

  const sendMessage = async () => {
    const body = input.trim();
    if (!body || sending) return;
    setSending(true);
    setInput('');
    const { error } = await supabase.from('messages').insert({
      conversation_id: conversation.id,
      sender_id: currentUser.id,
      body,
    });
    if (!error) {
      await supabase.from('conversations').update({ last_message_at: new Date().toISOString() })
        .eq('id', conversation.id);
    }
    setSending(false);
  };

  const listingTitle = (conversation.listing as any)?.title ?? 'Listing';
  const listingImg = (conversation.listing as any)?.images?.[0];

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white px-4 pt-12 md:pt-4 pb-3 shadow-sm sticky top-0 z-10 flex items-center gap-3">
        <button onClick={onBack} className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="w-10 h-10 rounded-full bg-sky-100 overflow-hidden flex items-center justify-center shrink-0">
          {(other as any)?.avatar_url
            ? <img src={(other as any).avatar_url} className="w-full h-full object-cover" alt="" />
            : <span className="font-black text-sky-600 text-sm">{(other as any)?.full_name?.charAt(0) ?? '?'}</span>}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-800 text-sm truncate">{(other as any)?.full_name ?? 'Unknown'}</p>
          <p className="text-xs text-slate-400 truncate">{listingTitle}</p>
        </div>
        {listingImg && (
          <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
            <img src={listingImg} className="w-full h-full object-cover" alt="" />
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 no-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 className="animate-spin mr-2" size={18} /> Loading...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 text-center">
            <MessageCircle size={32} className="mb-2 opacity-20" />
            <p className="text-sm font-medium">No messages yet. Say hello!</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map(msg => {
              const isMine = msg.sender_id === currentUser.id;
              return (
                <motion.div key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMine
                      ? 'bg-sky-500 text-white rounded-br-sm'
                      : 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-bl-sm'
                  }`}>
                    <p>{msg.body}</p>
                    <p className={`text-[10px] mt-1 ${isMine ? 'text-sky-200' : 'text-slate-400'}`}>
                      {new Date(msg.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-slate-100 px-4 py-3 pb-safe flex items-center gap-3">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder="Type a message..."
          className="flex-1 bg-slate-100 rounded-2xl px-4 py-3 text-sm text-slate-800 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
        />
        <button onClick={sendMessage} disabled={!input.trim() || sending}
          className="w-11 h-11 bg-sky-500 hover:bg-sky-600 disabled:opacity-40 rounded-full flex items-center justify-center text-white transition-colors shrink-0">
          {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>
    </div>
  );
}

// Exported helper to start or open a conversation from listing detail
export async function openConversation(
  listingId: string,
  agentId: string,
  currentUserId: string
): Promise<string | null> {
  // Find existing or create new
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('listing_id', listingId)
    .eq('buyer_id', currentUserId)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from('conversations')
    .insert({ listing_id: listingId, buyer_id: currentUserId, agent_id: agentId })
    .select('id')
    .maybeSingle();

  if (error || !created) return null;
  return created.id;
}
