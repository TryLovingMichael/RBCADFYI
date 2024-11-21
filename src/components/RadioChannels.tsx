import React, { useState, useEffect } from 'react';
import { Radio, MessageSquare, Trash2 } from 'lucide-react';
import { doc, updateDoc, onSnapshot, collection, addDoc, query, where, orderBy, Timestamp, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

interface Channel {
  id: string;
  name: string;
  type: 'dispatch' | 'tac' | 'fire' | 'ems';
  active: boolean;
}

interface RadioMessage {
  id: string;
  channelId: string;
  unitNumber: string;
  message: string;
  timestamp: any;
}

interface RadioChannelsProps {
  unitNumber: string;
}

export default function RadioChannels({ unitNumber }: RadioChannelsProps) {
  const { role } = useAuth();
  const isDispatch = role === 'dispatch';
  const isSupervisor = role === 'supervisor';
  
  const [channels, setChannels] = useState<Channel[]>([
    { id: 'dispatch', name: 'Dispatch', type: 'dispatch', active: true },
    { id: 'tac1', name: 'TAC 1', type: 'tac', active: isDispatch || isSupervisor },
    { id: 'tac2', name: 'TAC 2', type: 'tac', active: isDispatch || isSupervisor },
    { id: 'fire', name: 'Fire Ops', type: 'fire', active: isDispatch || isSupervisor },
    { id: 'ems', name: 'EMS', type: 'ems', active: isDispatch || isSupervisor }
  ]);
  const [selectedChannel, setSelectedChannel] = useState<string>('dispatch');
  const [messages, setMessages] = useState<RadioMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (selectedChannel) {
      const messagesQuery = query(
        collection(db, 'radioMessages'),
        where('channelId', '==', selectedChannel),
        orderBy('timestamp', 'desc')
      );

      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const messageData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as RadioMessage));
        setMessages(messageData);
      });

      return () => unsubscribe();
    }
  }, [selectedChannel]);

  const toggleChannel = async (channelId: string) => {
    try {
      // Supervisors and dispatch can access all channels without toggling
      if (isDispatch || isSupervisor) {
        setSelectedChannel(channelId);
        return;
      }

      const newChannels = channels.map(ch => 
        ch.id === channelId ? { ...ch, active: !ch.active } : ch
      );
      setChannels(newChannels);

      const unitRef = doc(db, 'units', unitNumber);
      await updateDoc(unitRef, {
        activeChannels: newChannels.filter(ch => ch.active).map(ch => ch.id)
      });

      if (newChannels.find(ch => ch.id === channelId)?.active) {
        setSelectedChannel(channelId);
      } else if (selectedChannel === channelId) {
        setSelectedChannel('dispatch');
      }

      toast.success(`${newChannels.find(ch => ch.id === channelId)?.active ? 'Joined' : 'Left'} ${channelId}`);
    } catch (error) {
      console.error('Error toggling radio channel:', error);
      toast.error('Failed to update radio channel');
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChannel || !newMessage.trim()) return;

    try {
      await addDoc(collection(db, 'radioMessages'), {
        channelId: selectedChannel,
        unitNumber: isSupervisor ? 'Supervisor' : isDispatch ? 'Dispatch' : unitNumber,
        message: newMessage,
        timestamp: Timestamp.now()
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!isDispatch && !isSupervisor) return;
    
    try {
      await deleteDoc(doc(db, 'radioMessages', messageId));
      toast.success('Message deleted');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-4">
        <Radio className="h-5 w-5 text-blue-600 mr-2" />
        <h2 className="text-lg font-semibold">Radio Channels</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-4">
        {channels.map((channel) => (
          <button
            key={channel.id}
            onClick={() => toggleChannel(channel.id)}
            className={`p-2 rounded-lg text-center transition-colors ${
              selectedChannel === channel.id
                ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500'
                : channel.active || isDispatch || isSupervisor
                ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex flex-col items-center">
              <MessageSquare className="h-4 w-4 mb-1" />
              <span className="text-sm font-medium">{channel.name}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">{channels.find(ch => ch.id === selectedChannel)?.name}</h3>
        </div>

        <div className="max-h-60 overflow-y-auto mb-4 space-y-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-2 rounded ${
                msg.unitNumber === (isSupervisor ? 'Supervisor' : isDispatch ? 'Dispatch' : unitNumber)
                  ? 'bg-blue-100 ml-8'
                  : 'bg-gray-100'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="font-medium text-sm">
                  {msg.unitNumber}
                </span>
                {(isDispatch || isSupervisor) && (
                  <button
                    onClick={() => deleteMessage(msg.id)}
                    className="p-1 hover:bg-red-100 rounded text-red-600"
                    title="Delete message"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
              <p className="text-sm mt-1">{msg.message}</p>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(msg.timestamp.toDate(), { addSuffix: true })}
              </span>
            </div>
          ))}

          {messages.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No messages in this channel
            </div>
          )}
        </div>

        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          />
          <button
            type="submit"
            className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}