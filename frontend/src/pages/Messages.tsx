import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Search, MoreVertical, Phone, Video, Paperclip,
  Image as ImageIcon, Smile, Check, CheckCheck,
  ArrowLeft, MessageCircle, Loader2
} from 'lucide-react';
import { Button, Skeleton } from '@/components/ui';
import { useConversations, useMessages, useSendMessage, useMarkMessagesRead } from '@/hooks';
import { useAuthStore } from '@/stores/authStore';
import { useErrorToast } from '@/components/ui/Toast';
import type { ConversationPreview } from '@/types';

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState<ConversationPreview | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileView, setIsMobileView] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const showError = useErrorToast();

  const { user } = useAuthStore();
  const { data: conversations = [], isLoading: conversationsLoading } = useConversations();
  const { data: messages = [], isLoading: messagesLoading } = useMessages(selectedConversation?.id);
  const sendMessageMutation = useSendMessage();
  const markReadMutation = useMarkMessagesRead();

  useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

      // Mark unread messages as read
      const unreadIds = messages
        .filter(m => !m.isRead && m.senderId !== user?.id)
        .map(m => m.id);

      if (unreadIds.length > 0 && selectedConversation) {
        markReadMutation.mutate({ conversationId: selectedConversation.id, messageIds: unreadIds });
      }
    }
  }, [messages, selectedConversation, user?.id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await sendMessageMutation.mutateAsync({
        conversationId: selectedConversation.id,
        content: newMessage,
        messageType: 'text',
      });
      setNewMessage('');
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch {
      showError('Nachricht konnte nicht gesendet werden');
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Jetzt';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} Min`;
    if (diff < 86400000) return date.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' });
    if (diff < 604800000) return date.toLocaleDateString('de-CH', { weekday: 'short' });
    return date.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit' });
  };

  const filteredConversations = conversations.filter(c =>
    c.otherParticipant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.serviceTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-neutral-50">
      {/* Conversations List */}
      <AnimatePresence>
        {(!isMobileView || !selectedConversation) && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full md:w-80 lg:w-96 bg-white border-r border-neutral-200 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-neutral-200">
              <h1 className="text-xl font-bold text-neutral-900 mb-4">Nachrichten</h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Suchen..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {conversationsLoading ? (
                <div className="p-4 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-neutral-500 p-8">
                  <MessageCircle className="w-12 h-12 mb-4 opacity-50" />
                  <p>Keine Konversationen</p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <motion.button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                    className={`w-full p-4 flex gap-3 border-b border-neutral-100 text-left transition-colors ${
                      selectedConversation?.id === conv.id ? 'bg-primary-50' : ''
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
                        {conv.otherParticipant.name.charAt(0)}
                      </div>
                      {conv.otherParticipant.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-neutral-900 truncate">{conv.otherParticipant.name}</span>
                        <span className="text-xs text-neutral-500">{conv.lastMessage && formatTime(conv.lastMessage.sentAt)}</span>
                      </div>
                      {conv.serviceTitle && (
                        <p className="text-xs text-primary-600 truncate mb-1">{conv.serviceTitle}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-neutral-600 truncate">{conv.lastMessage?.content || 'Neue Konversation'}</p>
                        {conv.unreadCount > 0 && (
                          <span className="ml-2 px-2 py-0.5 bg-primary-600 text-white text-xs rounded-full">{conv.unreadCount}</span>
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-neutral-200 p-4 flex items-center gap-4">
              {isMobileView && (
                <button onClick={() => setSelectedConversation(null)} className="p-2 -ml-2 hover:bg-neutral-100 rounded-lg">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
                  {selectedConversation.otherParticipant.name.charAt(0)}
                </div>
                {selectedConversation.otherParticipant.isOnline && (
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-neutral-900">{selectedConversation.otherParticipant.name}</h2>
                <p className="text-sm text-neutral-500">
                  {selectedConversation.otherParticipant.isOnline ? 'Online' : 'Offline'}
                </p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-neutral-100 rounded-lg"><Phone className="w-5 h-5 text-neutral-600" /></button>
                <button className="p-2 hover:bg-neutral-100 rounded-lg"><Video className="w-5 h-5 text-neutral-600" /></button>
                <button className="p-2 hover:bg-neutral-100 rounded-lg"><MoreVertical className="w-5 h-5 text-neutral-600" /></button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-neutral-500">
                  <MessageCircle className="w-12 h-12 mb-4 opacity-30" />
                  <p>Noch keine Nachrichten</p>
                  <p className="text-sm">Schreiben Sie die erste Nachricht!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === user?.id;
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${isMe ? 'order-2' : ''}`}>
                        <div className={`px-4 py-2 rounded-2xl ${
                          isMe ? 'bg-primary-600 text-white rounded-br-md' : 'bg-white text-neutral-900 rounded-bl-md shadow-sm'
                        }`}>
                          <p>{msg.content}</p>
                        </div>
                        <div className={`flex items-center gap-1 mt-1 text-xs text-neutral-500 ${isMe ? 'justify-end' : ''}`}>
                          <span>{formatTime(msg.createdAt)}</span>
                          {isMe && (msg.isRead ? <CheckCheck className="w-3 h-3 text-primary-500" /> : <Check className="w-3 h-3" />)}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="bg-white border-t border-neutral-200 p-4">
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-neutral-100 rounded-lg"><Paperclip className="w-5 h-5 text-neutral-600" /></button>
                <button className="p-2 hover:bg-neutral-100 rounded-lg"><ImageIcon className="w-5 h-5 text-neutral-600" /></button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Nachricht schreiben..."
                  className="flex-1 px-4 py-2 rounded-full border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                />
                <button className="p-2 hover:bg-neutral-100 rounded-lg"><Smile className="w-5 h-5 text-neutral-600" /></button>
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  className="rounded-full px-4"
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-neutral-500 bg-neutral-50">
            <MessageCircle className="w-16 h-16 mb-4 opacity-30" />
            <h3 className="text-lg font-medium text-neutral-700 mb-2">Wählen Sie eine Konversation</h3>
            <p className="text-sm">Klicken Sie auf eine Konversation, um die Nachrichten anzuzeigen</p>
          </div>
        )}
      </div>
    </div>
  );
}

