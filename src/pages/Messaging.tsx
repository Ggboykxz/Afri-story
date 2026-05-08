import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Search, MessageCircle, Lock, MoreVertical, Phone, Video, 
  Image, Paperclip, Smile, Check, CheckCheck, ArrowLeft, X,
  MessageSquare, Users, Star, Trash2, Bell, BellOff, Pin, Archive,
  FileText, Download, Copy, Reply, Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/common/Skeleton';
import { messagingService, Conversation, Message, TypingStatus } from '@/lib/messagingService';
import cloudinaryService from '@/lib/cloudinaryService';

const EMOJI_LIST = ['👍', '❤️', '😂', '😮', '😢', '😡', '🔥', '✨', '👏', '🎉'];

export const Messaging = () => {
  const { user, profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingStatus[]>([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showConvMenu, setShowConvMenu] = useState(false);
  const [convMenuPosition, setConvMenuPosition] = useState({ x: 0, y: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;

    const unsub = messagingService.subscribeToConversations(user.uid, (convs) => {
      setConversations(convs);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!selectedConv || !user) return;

    const unsub = messagingService.subscribeToMessages(selectedConv.id, (msgs) => {
      setMessages(msgs);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });

    const unsubTyping = messagingService.subscribeToTyping(selectedConv.id, user.uid, (typing) => {
      setTypingUsers(typing);
    });

    messagingService.markAsRead(selectedConv.id, user.uid);

    return () => {
      unsub();
      unsubTyping();
    };
  }, [selectedConv, user]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConv) return;

    const content = messageInput.trim();
    setMessageInput('');
    setShowEmoji(false);

    await messagingService.sendMessage(selectedConv.id, content, 'text');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTypingStart = () => {
    if (!selectedConv || isTyping) return;
    
    setIsTyping(true);
    messagingService.startTyping(selectedConv.id);
  };

  const handleTypingStop = () => {
    if (!selectedConv) return;
    
    setIsTyping(false);
    messagingService.stopTyping(selectedConv.id);
  };

  const handleTypingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (e.target.value) {
      handleTypingStart();
      typingTimeoutRef.current = setTimeout(() => {
        handleTypingStop();
      }, 3000);
    } else {
      handleTypingStop();
    }
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }

    const results = await messagingService.searchUsers(term, user?.uid);
    setSearchResults(results);
  };

  const handleStartConversation = async (userId: string, userName: string) => {
    const convId = await messagingService.createConversation([user!.uid, userId], 'private');
    if (convId) {
      const conv = await messagingService.getConversation(convId);
      if (conv) {
        setSelectedConv(conv);
      }
    }
    setShowSearch(false);
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConv) return;

    try {
      let url = '';
      const isImage = file.type.startsWith('image/');
      
      if (isImage) {
        url = await cloudinaryService.uploadImage(file, `afristory/chat/${selectedConv.id}`) || '';
      }

      if (url) {
        await messagingService.sendMessage(
          selectedConv.id, 
          isImage ? '📷 Image' : `📎 ${file.name}`,
          isImage ? 'image' : 'file',
          url,
          file.name,
          file.size
        );
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!selectedConv || !user) return;
    
    const message = messages.find(m => m.id === messageId);
    const hasReacted = message?.reactions?.[emoji]?.includes(user.uid);
    
    if (hasReacted) {
      await messagingService.removeReaction(selectedConv.id, messageId, emoji, user.uid);
    } else {
      await messagingService.addReaction(selectedConv.id, messageId, emoji, user.uid);
    }
  };

  const handleDeleteConversation = async () => {
    if (!selectedConv || !user) return;
    if (confirm('Supprimer cette conversation ?')) {
      await messagingService.deleteConversation(selectedConv.id, user.uid);
      setSelectedConv(null);
      setShowConvMenu(false);
    }
  };

  const handlePinConversation = async () => {
    if (!selectedConv) return;
    await messagingService.pinConversation(selectedConv.id, !selectedConv.isPinned);
    setShowConvMenu(false);
  };

  const handleMuteConversation = async () => {
    if (!selectedConv) return;
    await messagingService.muteConversation(selectedConv.id, !selectedConv.isMuted);
    setShowConvMenu(false);
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const formatTime = (timestamp: any): string => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return "À l'instant";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}min`;
    if (diff < 86400000) return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const formatConvTime = (timestamp: any): string => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 3600000) return `${Math.floor(diff / 60000)}min`;
    if (diff < 86400000) return "aujourd'hui";
    if (diff < 604800000) return date.toLocaleDateString('fr-FR', { weekday: 'short' });
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const getOtherParticipant = (conv: Conversation) => {
    if (!user) return { name: 'Unknown', photo: '' };
    const otherId = conv.participants.find(p => p !== user.uid);
    return {
      name: conv.participantNames?.[otherId || ''] || 'Unknown',
      photo: conv.participantPhotos?.[otherId || ''] || '',
    };
  };

  const getUnreadCount = (conv: Conversation): number => {
    return conv.unreadCount?.[user?.uid || ''] || 0;
  };

  const getMessageStatus = (msg: Message) => {
    if (msg.senderId !== user?.uid) return null;
    const allRead = selectedConv?.participants.every(p => msg.readBy?.includes(p));
    return allRead ? (
      <CheckCheck className="w-3 h-3 text-brand-gold" />
    ) : (
      <Check className="w-3 h-3 text-gray-500" />
    );
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <MessageCircle className="w-16 h-16 text-gray-600 mx-auto" />
          <h2 className="text-2xl font-display font-bold">Connectez-vous</h2>
          <p className="text-gray-500">Veuillez vous connecter pour accéder à vos messages</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 h-[calc(100vh-80px)]">
      <div className="flex h-full glass-card overflow-hidden">
        <aside className={`${selectedConv ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-col border-r border-white/10`}>
          <div className="p-4 border-b border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-bold">Messages</h2>
              <button 
                onClick={() => setShowSearch(true)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <MessageSquare className="w-5 h-5 text-brand-gold" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Rechercher..." 
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:border-brand-gold/50 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="p-4 flex items-center gap-3 border-b border-white/5">
                  <Skeleton variant="circle" className="w-12 h-12" />
                  <div className="flex-1 space-y-2">
                    <Skeleton variant="text" className="w-24 h-4" />
                    <Skeleton variant="text" className="w-full h-3" />
                  </div>
                </div>
              ))
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">Aucune conversation</p>
                <button 
                  onClick={() => setShowSearch(true)}
                  className="mt-4 text-brand-gold text-sm font-bold hover:underline"
                >
                  Démarrer une conversation
                </button>
              </div>
            ) : (
              conversations.map(conv => {
                const other = getOtherParticipant(conv);
                const unread = getUnreadCount(conv);
                return (
                  <div 
                    key={conv.id}
                    onClick={() => setSelectedConv(conv)}
                    className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-all border-b border-white/5 relative ${
                      selectedConv?.id === conv.id ? 'bg-white/5' : ''
                    } ${conv.isPinned ? 'border-l-4 border-l-brand-gold' : ''}`}
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-brand-brown overflow-hidden flex items-center justify-center font-display font-bold text-lg">
                        {other.photo ? (
                          <img src={other.photo} alt={other.name} className="w-full h-full object-cover" />
                        ) : (
                          other.name[0]?.toUpperCase()
                        )}
                      </div>
                      {conv.type === 'collab' && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-brand-gold rounded-full flex items-center justify-center">
                          <Users className="w-3 h-3 text-brand-black" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className={`font-bold text-sm truncate ${unread > 0 ? 'text-white' : 'text-gray-300'}`}>
                          {other.name}
                        </h4>
                        <span className="text-[10px] text-gray-500 flex-shrink-0">
                          {formatConvTime(conv.lastMessageAt)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {conv.lastMessage || 'Aucun message'}
                      </p>
                    </div>
                    {unread > 0 && (
                      <div className="absolute top-4 right-4 min-w-[20px] h-5 bg-brand-red rounded-full flex items-center justify-center text-[10px] font-black text-white px-1.5">
                        {unread > 99 ? '99+' : unread}
                      </div>
                    )}
                    {conv.isMuted && (
                      <BellOff className="absolute top-4 right-4 w-3 h-3 text-gray-600" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </aside>

        <main className={`${selectedConv ? 'flex' : 'hidden md:hidden'} flex-1 flex-col bg-brand-black/20`}>
          {selectedConv ? (
            <>
              <header className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setSelectedConv(null)}
                    className="md:hidden p-2 hover:bg-white/5 rounded-lg"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-brand-brown overflow-hidden flex items-center justify-center font-display font-bold">
                    {getOtherParticipant(selectedConv).photo ? (
                      <img src={getOtherParticipant(selectedConv).photo} alt="" className="w-full h-full object-cover" />
                    ) : (
                      getOtherParticipant(selectedConv).name[0]?.toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="font-display font-bold">{getOtherParticipant(selectedConv).name}</h3>
                    <p className="text-[10px] text-brand-green font-bold uppercase tracking-widest">En ligne</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedConv.type === 'collab' && (
                    <div className="bg-brand-gold/10 text-brand-gold px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border border-brand-gold/20">
                      <Lock className="w-3 h-3" />
                      Collab
                    </div>
                  )}
                  <button 
                    onClick={(e) => {
                      setShowConvMenu(true);
                      setConvMenuPosition({ x: e.clientX, y: e.clientY });
                    }}
                    className="p-2 hover:bg-white/5 rounded-lg"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, i) => {
                  const isOwn = msg.senderId === user?.uid;
                  const showAvatar = !isOwn && (!messages[i-1] || messages[i-1].senderId !== msg.senderId);
                  
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} gap-2 group`}
                    >
                      {!isOwn && (
                        <div className="w-8 h-8 rounded-full bg-brand-brown overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-xs">
                          {msg.senderPhoto ? (
                            <img src={msg.senderPhoto} alt="" className="w-full h-full object-cover" />
                          ) : (
                            msg.senderName[0]?.toUpperCase()
                          )}
                        </div>
                      )}
                      
                      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                        <div className={`relative px-4 py-2 rounded-2xl ${
                          msg.type === 'system' 
                            ? 'bg-gray-800/50 text-gray-400 text-sm italic text-center'
                            : isOwn 
                              ? 'bg-brand-gold/20 border border-brand-gold/30 text-white rounded-tr-none' 
                              : 'bg-white/10 border border-white/10 text-white rounded-tl-none'
                        }`}>
                          {msg.type === 'image' && msg.fileUrl && (
                            <img src={msg.fileUrl} alt="" className="rounded-lg mb-2 max-w-[250px]" />
                          )}
                          {msg.type === 'file' && (
                            <div className="flex items-center gap-2 mb-2 p-2 bg-white/10 rounded-lg">
                              <FileText className="w-5 h-5" />
                              <span className="text-sm truncate flex-1">{msg.fileName}</span>
                              <a href={msg.fileUrl} download><Download className="w-4 h-4" /></a>
                            </div>
                          )}
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                          
                          <div className={`absolute -bottom-1 ${isOwn ? '-left-1' : '-right-1'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                            <div className="flex items-center gap-1 bg-brand-black/80 rounded-full p-1">
                              <button 
                                onClick={() => setShowEmoji(!showEmoji)}
                                className="p-1 hover:bg-white/20 rounded-full"
                              >
                                <Smile className="w-3 h-3" />
                              </button>
                              <button 
                                onClick={() => copyMessage(msg.content)}
                                className="p-1 hover:bg-white/20 rounded-full"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        {msg.reactions && Object.entries(msg.reactions).length > 0 && (
                          <div className="flex gap-1">
                            {Object.entries(msg.reactions).map(([emoji, users]) => (
                              <div key={emoji} className="px-2 py-0.5 bg-white/10 rounded-full text-xs flex items-center gap-1">
                                <span>{emoji}</span>
                                <span className="text-[10px]">{(users as string[]).length}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1 text-[10px] text-gray-500">
                          <span>{formatTime(msg.createdAt)}</span>
                          {getMessageStatus(msg)}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                
                {typingUsers.length > 0 && (
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                    </div>
                    <span className="text-xs">
                      {typingUsers[0].userName} tape...
                    </span>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              <footer className="p-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <Paperclip className="w-5 h-5 text-gray-400" />
                  </button>
                  <input 
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  
                  <div className="relative flex-1">
                    <input 
                      ref={inputRef}
                      type="text"
                      value={messageInput}
                      onChange={handleTypingChange}
                      onKeyDown={handleKeyPress}
                      placeholder="Écrire un message..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:border-brand-gold/50 transition-all"
                    />
                    
                    <AnimatePresence>
                      {showEmoji && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute bottom-full left-0 mb-2 p-2 bg-brand-black/90 border border-white/10 rounded-xl flex gap-1"
                        >
                          {EMOJI_LIST.map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => {
                                setMessageInput(prev => prev + emoji);
                                inputRef.current?.focus();
                              }}
                              className="p-1 hover:bg-white/10 rounded-lg text-lg"
                            >
                              {emoji}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <button 
                    onClick={() => setShowEmoji(!showEmoji)}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <Smile className="w-5 h-5 text-gray-400" />
                  </button>
                  
                  <button 
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                    className="p-3 bg-brand-gold text-brand-black rounded-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </footer>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-brand-gold/10 rounded-[2rem] flex items-center justify-center">
                <MessageCircle className="w-10 h-10 text-brand-gold" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-display font-black">Votre Messagerie</h3>
                <p className="text-gray-400 max-w-sm">Sélectionnez une conversation ou démarrez une nouvelle discussion.</p>
              </div>
              <button 
                onClick={() => setShowSearch(true)}
                className="px-6 py-3 bg-brand-gold text-brand-black rounded-xl font-bold hover:scale-105 transition-transform"
              >
                Nouveau Message
              </button>
            </div>
          )}
        </main>

        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center pt-20"
              onClick={() => setShowSearch(false)}
            >
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full max-w-lg bg-brand-black border border-white/10 rounded-3xl p-6 space-y-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-display font-bold">Nouveau Message</h3>
                  <button onClick={() => setShowSearch(false)} className="p-2 hover:bg-white/5 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input 
                    type="text" 
                    placeholder="Rechercher un utilisateur..." 
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm outline-none focus:border-brand-gold/50"
                    autoFocus
                  />
                </div>
                
                <div className="max-h-80 overflow-y-auto space-y-2">
                  {searchResults.length > 0 ? (
                    searchResults.map(user => (
                      <button
                        key={user.uid}
                        onClick={() => handleStartConversation(user.uid, user.displayName)}
                        className="w-full p-4 flex items-center gap-4 hover:bg-white/5 rounded-xl transition-colors text-left"
                      >
                        <div className="w-12 h-12 rounded-full bg-brand-brown overflow-hidden flex items-center justify-center font-display font-bold">
                          {user.photoURL ? (
                            <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                          ) : (
                            user.displayName[0]?.toUpperCase()
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold">{user.displayName}</h4>
                          <p className="text-xs text-gray-500">{user.role || 'Lecteur'}</p>
                        </div>
                        <MessageSquare className="w-5 h-5 text-brand-gold" />
                      </button>
                    ))
                  ) : searchTerm.length >= 2 ? (
                    <p className="text-center text-gray-500 py-8">Aucun résultat</p>
                  ) : (
                    <p className="text-center text-gray-500 py-8">Tapez au moins 2 caractères</p>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showConvMenu && (
            <>
              <div 
                className="fixed inset-0 z-50"
                onClick={() => setShowConvMenu(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed z-50 bg-brand-black/95 border border-white/10 rounded-xl py-2 min-w-[200px] shadow-xl"
                style={{ top: convMenuPosition.y, left: convMenuPosition.x - 200 }}
              >
                <button 
                  onClick={handlePinConversation}
                  className="w-full px-4 py-2 flex items-center gap-3 hover:bg-white/10 text-sm text-left"
                >
                  <Pin className="w-4 h-4" />
                  {selectedConv?.isPinned ? 'Désépingler' : 'Épingler'}
                </button>
                <button 
                  onClick={handleMuteConversation}
                  className="w-full px-4 py-2 flex items-center gap-3 hover:bg-white/10 text-sm text-left"
                >
                  {selectedConv?.isMuted ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                  {selectedConv?.isMuted ? 'Réactiver notifications' : 'Silencieux'}
                </button>
                <button 
                  onClick={handleDeleteConversation}
                  className="w-full px-4 py-2 flex items-center gap-3 hover:bg-brand-red/20 text-brand-red text-sm text-left"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Messaging;