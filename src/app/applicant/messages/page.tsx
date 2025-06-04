'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Loader, AlertCircle, MessageSquare, User, Clock } from 'lucide-react';
import { format } from 'date-fns';

/**
 * Messages Page
 * Communication interface between applicants and recruitment team
 */

interface Message {
  _id: string;
  senderId: string;
  senderType: 'applicant' | 'admin' | 'system';
  message: string;
  timestamp: string;
  isRead: boolean;
  messageType: 'message' | 'status_update' | 'request' | 'notification';
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch('/api/applicant/communications');
        
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/applicant/auth/request-access');
            return;
          }
          throw new Error('Failed to fetch messages');
        }

        const data = await response.json();
        setMessages(data.messages || []);
      } catch (error) {
        console.error('Fetch messages error:', error);
        setError('Failed to load messages');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [router]);

  // Send new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) {
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch('/api/applicant/communications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: newMessage.trim(),
          messageType: 'message'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      // Add new message to the list
      setMessages(prev => [data.data, ...prev]);
      setNewMessage('');
    } catch (error) {
      console.error('Send message error:', error);
      setError('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-800/30 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
        <div className="flex items-center space-x-3">
          <MessageSquare className="text-cyan-400" size={24} />
          <h1 className="text-2xl font-bold text-white">Messages</h1>
        </div>
        <p className="text-slate-300 mt-2">
          Communicate with our recruitment team. We'll respond as soon as possible.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Message Composer */}
      <div className="bg-slate-800/30 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">Send a Message</h3>
        
        <form onSubmit={handleSendMessage} className="space-y-4">
          <div>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message here..."
              className="w-full h-32 p-4 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
              maxLength={5000}
              disabled={isSending}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-slate-500">
                {newMessage.length}/5000 characters
              </p>
              <button
                type="submit"
                disabled={isSending || !newMessage.trim()}
                className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
              >
                {isSending ? (
                  <>
                    <Loader className="animate-spin" size={16} />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Messages List */}
      <div className="bg-slate-800/30 backdrop-blur-lg rounded-2xl border border-slate-700/50">
        <div className="p-6 border-b border-slate-700/50">
          <h3 className="text-lg font-semibold text-white">Conversation History</h3>
        </div>
        
        <div className="p-6">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="mx-auto text-slate-600 mb-4" size={48} />
              <p className="text-slate-400">No messages yet</p>
              <p className="text-slate-500 text-sm mt-2">
                Send your first message to start the conversation
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <MessageItem key={message._id} message={message} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Individual Message Component
 */
function MessageItem({ message }: { message: Message }) {
  const isFromApplicant = message.senderType === 'applicant';
  const isSystemMessage = message.senderType === 'system';

  return (
    <div className={`flex ${isFromApplicant ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] ${
        isFromApplicant 
          ? 'bg-cyan-500/20 border-cyan-500/30' 
          : isSystemMessage
          ? 'bg-blue-500/20 border-blue-500/30'
          : 'bg-slate-700/50 border-slate-600/50'
      } border rounded-lg p-4`}>
        {/* Message Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {isFromApplicant ? (
              <User className="text-cyan-400" size={16} />
            ) : (
              <MessageSquare className="text-slate-400" size={16} />
            )}
            <span className={`text-sm font-medium ${
              isFromApplicant 
                ? 'text-cyan-400' 
                : isSystemMessage 
                ? 'text-blue-400'
                : 'text-slate-300'
            }`}>
              {isFromApplicant 
                ? 'You' 
                : isSystemMessage 
                ? 'System'
                : 'Recruitment Team'
              }
            </span>
            {message.messageType !== 'message' && (
              <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full">
                {message.messageType.replace('_', ' ')}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1 text-slate-500">
            <Clock size={12} />
            <span className="text-xs">
              {format(new Date(message.timestamp), 'MMM d, h:mm a')}
            </span>
          </div>
        </div>

        {/* Message Content */}
        <div className="text-white text-sm leading-relaxed whitespace-pre-wrap">
          {message.message}
        </div>

        {/* Read Status */}
        {isFromApplicant && (
          <div className="mt-2 text-right">
            <span className={`text-xs ${
              message.isRead ? 'text-green-400' : 'text-slate-500'
            }`}>
              {message.isRead ? 'Read' : 'Sent'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Loading Screen Component
 */
function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <Loader className="animate-spin text-cyan-500 mx-auto mb-4" size={32} />
        <p className="text-slate-300">Loading messages...</p>
      </div>
    </div>
  );
} 