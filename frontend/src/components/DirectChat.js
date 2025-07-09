import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { 
  ArrowLeft, 
  Send, 
  Clock, 
  MoreVertical, 
  Trash2, 
  Circle 
} from 'lucide-react';
import { USER_STATUS, getUserStatus, getStatusText } from '../data/mock';

const DirectChat = ({ selectedEmployee, onBack }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Load messages from localStorage
  useEffect(() => {
    const chatId = getChatId(user.email, selectedEmployee["Email ID"]);
    const savedMessages = localStorage.getItem(`directChat_${chatId}`);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, [user.email, selectedEmployee]);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      const chatId = getChatId(user.email, selectedEmployee["Email ID"]);
      localStorage.setItem(`directChat_${chatId}`, JSON.stringify(messages));
    }
  }, [messages, user.email, selectedEmployee]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getChatId = (email1, email2) => {
    return [email1, email2].sort().join('_');
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        senderId: user.email,
        senderName: user.name,
        content: newMessage,
        timestamp: new Date().toISOString(),
        type: 'text',
        deleted: false
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const handleDeleteMessage = (messageId) => {
    setMessages(messages.map(msg => 
      msg.id === messageId 
        ? { ...msg, deleted: true, content: 'This message was deleted' }
        : msg
    ));
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case USER_STATUS.ONLINE:
        return 'text-green-500';
      case USER_STATUS.BUSY:
        return 'text-red-500';
      case USER_STATUS.OFFLINE:
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  const employeeStatus = getUserStatus(selectedEmployee["Email ID"]);

  return (
    <Card className="h-[600px] overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader className="p-4 border-b border-gray-200 bg-white/90">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-1"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-[#225F8B] text-white">
                  {selectedEmployee.Name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-0 -right-0 w-3 h-3 border-2 border-white rounded-full ${
                employeeStatus === USER_STATUS.ONLINE ? 'bg-green-500' :
                employeeStatus === USER_STATUS.BUSY ? 'bg-red-500' : 'bg-gray-400'
              }`}></div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{selectedEmployee.Name}</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>{selectedEmployee.Designation}</span>
                <span>•</span>
                <span>{selectedEmployee.Department}</span>
                <span className={`text-xs ${getStatusColor(employeeStatus)}`}>
                  • {getStatusText(employeeStatus)}
                </span>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="text-xs bg-[#225F8B]/10 text-[#225F8B]">
            Direct Message
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex flex-col h-[500px]">
        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>Start a conversation with {selectedEmployee.Name}</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="flex items-start space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-[#225F8B] text-white text-xs">
                      {message.senderName?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm text-gray-900">
                          {message.senderName}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                      {message.senderId === user.email && !message.deleted && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => handleDeleteMessage(message.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3 mr-2" />
                              Delete Message
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    <p className={`text-sm ${message.deleted ? 'text-gray-400 italic' : 'text-gray-700'}`}>
                      {message.content}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200 bg-white/90">
          <div className="flex items-center space-x-2">
            <Input
              placeholder={`Message ${selectedEmployee.Name}`}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="bg-[#225F8B] hover:bg-[#225F8B]/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DirectChat;