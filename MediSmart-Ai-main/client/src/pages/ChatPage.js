import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../context/AuthProvider';
import socket from '../socket';
import Spinner from '../components/common/Spinner';
import { Send } from 'lucide-react';

const fetchChat = async (api, orderId) => {
  const { data } = await api.get(`/chat/${orderId}`);
  return data.chat;
};

const sendMessage = async (api, { orderId, message }) => {
  const { data } = await api.post(`/chat/${orderId}`, { message });
  return data.chat;
};

const ChatPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { api, user } = useAuth();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  const { data: chat, isLoading } = useQuery(
    ['chat', orderId],
    () => fetchChat(api, orderId),
    { enabled: !!orderId }
  );

  const mutation = useMutation(sendMessage, {
    onSuccess: (data) => {
      queryClient.setQueryData(['chat', orderId], old => ({ ...old, messages: data.messages }));
    },
  });

  useEffect(() => {
    if (orderId) {
      socket.emit('join_chat_room', orderId);
      socket.on('receive_message', (newMessage) => {
        queryClient.setQueryData(['chat', orderId], old => {
          if (old && !old.messages.find(m => m._id === newMessage._id)) {
            return { ...old, messages: [...old.messages, newMessage] };
          }
          return old;
        });
      });

      return () => {
        socket.emit('leave_chat_room', orderId);
        socket.off('receive_message');
      };
    }
  }, [orderId, queryClient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && orderId) {
      mutation.mutate({ orderId, message });
      setMessage('');
    }
  };

  if (!orderId) {
    return <div className="text-center py-10">Please select an order to view the chat.</div>;
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  return (
    <div className="container mx-auto h-[calc(100vh-150px)] flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Chat for Order #{orderId.substring(0, 8)}</h1>
      <div className="flex-grow bg-white rounded-lg shadow-md flex flex-col overflow-hidden">
        <div className="flex-grow p-4 space-y-4 overflow-y-auto">
          {chat?.messages.map((msg) => (
            <div key={msg._id} className={`flex ${msg.sender._id === user._id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${msg.sender._id === user._id ? 'bg-primary-500 text-white' : 'bg-secondary-200 text-secondary-800'}`}>
                <p className="text-sm">{msg.message}</p>
                <p className={`text-xs mt-1 ${msg.sender._id === user._id ? 'text-primary-200' : 'text-secondary-500'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString()} - {msg.sender.name}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 bg-secondary-50 border-t">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button type="submit" className="bg-primary-600 text-white p-3 rounded-full hover:bg-primary-700">
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
