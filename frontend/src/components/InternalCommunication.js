import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { 
  Hash, 
  Users, 
  Search, 
  Send, 
  Plus, 
  Settings, 
  MessageSquare,
  Clock,
  UserPlus,
  Building,
  ChevronRight,
  Dot,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { COMMUNICATION_CHANNELS, MOCK_MESSAGES, getAllEmployees, DEPARTMENT_DATA } from '../data/mock';

const InternalCommunication = () => {
  const { user } = useAuth();
  const [selectedChannel, setSelectedChannel] = useState(COMMUNICATION_CHANNELS[0]);
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('channels'); // channels, people, directory
  const [showChannelSettings, setShowChannelSettings] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleDeleteMessages = () => {
    const updatedMessages = messages.filter(msg => msg.channelId !== selectedChannel.id);
    setMessages(updatedMessages);
    setShowChannelSettings(false);
    // Need to import useToast
    console.log(`All messages in #${selectedChannel.name} have been deleted.`);
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        channelId: selectedChannel.id,
        senderId: user.email,
        senderName: user.name,
        content: newMessage,
        timestamp: new Date().toISOString(),
        type: 'text'
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const getChannelMessages = () => {
    return messages.filter(msg => msg.channelId === selectedChannel.id);
  };

  const getFilteredChannels = () => {
    return COMMUNICATION_CHANNELS.filter(channel =>
      channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      channel.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getEmployeesByDepartment = () => {
    const employees = getAllEmployees();
    const grouped = {};
    
    employees.forEach(emp => {
      if (!grouped[emp.Department]) {
        grouped[emp.Department] = {};
      }
      if (!grouped[emp.Department][emp.SubDepartment]) {
        grouped[emp.Department][emp.SubDepartment] = [];
      }
      grouped[emp.Department][emp.SubDepartment].push(emp);
    });
    
    return grouped;
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getChannelIcon = (channel) => {
    if (channel.type === 'public') return <Hash className="h-4 w-4" />;
    if (channel.type === 'department') return <Building className="h-4 w-4" />;
    return <Users className="h-4 w-4" />;
  };

  const renderSidebar = () => (
    <div className="w-80 bg-white/90 backdrop-blur-sm border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">ShowTime Chat</h2>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search channels, people..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-4">
          {[
            { id: 'channels', label: 'Channels', icon: Hash },
            { id: 'people', label: 'People', icon: Users },
            { id: 'directory', label: 'Directory', icon: Building }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 ${
                  activeTab === tab.id 
                    ? 'bg-[#225F8B] text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4 mr-1" />
                {tab.label}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {activeTab === 'channels' && (
          <div className="space-y-4">
            {/* Public Channels */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                <Hash className="h-3 w-3 mr-1" />
                Public Channels
              </h3>
              {getFilteredChannels().filter(ch => ch.type === 'public').map((channel) => (
                <Button
                  key={channel.id}
                  variant="ghost"
                  className={`w-full justify-start px-2 py-1 h-auto mb-1 ${
                    selectedChannel.id === channel.id 
                      ? 'bg-[#225F8B]/10 text-[#225F8B]' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedChannel(channel)}
                >
                  <div className="flex items-center space-x-2 w-full">
                    <Hash className="h-4 w-4" />
                    <span className="font-medium">{channel.name}</span>
                    <span className="text-xs text-gray-500 ml-auto">{channel.memberCount}</span>
                  </div>
                </Button>
              ))}
            </div>

            {/* Department Channels */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                <Building className="h-3 w-3 mr-1" />
                Department Channels
              </h3>
              {getFilteredChannels().filter(ch => ch.type === 'department').map((channel) => (
                <Button
                  key={channel.id}
                  variant="ghost"
                  className={`w-full justify-start px-2 py-1 h-auto mb-1 ${
                    selectedChannel.id === channel.id 
                      ? 'bg-[#225F8B]/10 text-[#225F8B]' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedChannel(channel)}
                >
                  <div className="flex items-center space-x-2 w-full">
                    <Hash className="h-4 w-4" />
                    <span className="font-medium">{channel.name}</span>
                    <span className="text-xs text-gray-500 ml-auto">{channel.memberCount}</span>
                  </div>
                </Button>
              ))}
            </div>

            {/* Team Channels */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                <Users className="h-3 w-3 mr-1" />
                Team Channels
              </h3>
              {getFilteredChannels().filter(ch => ch.type === 'team').map((channel) => (
                <Button
                  key={channel.id}
                  variant="ghost"
                  className={`w-full justify-start px-2 py-1 h-auto mb-1 ${
                    selectedChannel.id === channel.id 
                      ? 'bg-[#225F8B]/10 text-[#225F8B]' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedChannel(channel)}
                >
                  <div className="flex items-center space-x-2 w-full">
                    <Hash className="h-4 w-4" />
                    <span className="font-medium text-sm">{channel.name}</span>
                    <span className="text-xs text-gray-500 ml-auto">{channel.memberCount}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'people' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Online</h3>
              <span className="text-xs text-gray-500">{getAllEmployees().length} members</span>
            </div>
            {getAllEmployees().slice(0, 20).map((emp, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="relative">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-[#225F8B] text-white text-xs">
                      {emp.Name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0 -right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{emp.Name}</div>
                  <div className="text-xs text-gray-500 truncate">{emp.Designation} • {emp.Department}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'directory' && (
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Company Directory</h3>
            {Object.keys(DEPARTMENT_DATA).map((dept) => {
              const deptEmployees = Object.values(DEPARTMENT_DATA[dept]).flat();
              return (
                <div key={dept} className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-[#225F8B]" />
                      <span className="font-semibold text-[#225F8B] text-sm">{dept}</span>
                    </div>
                    <Badge variant="outline" className="text-xs bg-white">
                      {deptEmployees.length} members
                    </Badge>
                  </div>
                  
                  {Object.keys(DEPARTMENT_DATA[dept]).map((subDept) => (
                    <div key={subDept} className="ml-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <ChevronRight className="h-3 w-3 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">{subDept}</span>
                        <Badge variant="secondary" className="text-xs">
                          {DEPARTMENT_DATA[dept][subDept].length}
                        </Badge>
                      </div>
                      <div className="ml-6 space-y-1">
                        {DEPARTMENT_DATA[dept][subDept].map((emp, index) => (
                          <div key={index} className="flex items-center space-x-2 py-1 hover:bg-gray-50 rounded px-2 cursor-pointer">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="bg-gray-600 text-white text-xs">
                                {emp.Name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium text-gray-900 truncate">{emp.Name}</div>
                              <div className="text-xs text-gray-500 truncate">{emp.Designation}</div>
                            </div>
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const renderChatArea = () => (
    <div className="flex-1 flex flex-col bg-white/70 backdrop-blur-sm">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-white/90">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getChannelIcon(selectedChannel)}
            <div>
              <h3 className="font-semibold text-gray-900">{selectedChannel.name}</h3>
              <p className="text-sm text-gray-600">{selectedChannel.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {selectedChannel.memberCount} members
            </Badge>
            <Button size="sm" variant="ghost">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {getChannelMessages().map((message) => (
            <div key={message.id} className="flex items-start space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-[#225F8B] text-white text-xs">
                  {message.senderName?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-sm text-gray-900">{message.senderName}</span>
                  <span className="text-xs text-gray-500 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{message.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white/90">
        <div className="flex items-center space-x-2">
          <Input
            placeholder={`Message #${selectedChannel.name}`}
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
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Internal Communication</h2>
        <Badge variant="outline" className="bg-[#225F8B]/10 text-[#225F8B] border-[#225F8B]/20">
          Team Chat & Directory
        </Badge>
      </div>

      <Card className="h-[600px] overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <div className="flex h-full">
          {renderSidebar()}
          {renderChatArea()}
        </div>
      </Card>

      {/* Communication Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-[#225F8B]/5 to-[#225F8B]/10 border-[#225F8B]/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#225F8B]/10 rounded-full flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-[#225F8B]" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Department Channels</h4>
                <p className="text-sm text-gray-600">Team-specific discussions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-[#225F8B]/5 to-[#225F8B]/10 border-[#225F8B]/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#225F8B]/10 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-[#225F8B]" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Employee Directory</h4>
                <p className="text-sm text-gray-600">Find and connect with colleagues</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-[#225F8B]/5 to-[#225F8B]/10 border-[#225F8B]/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#225F8B]/10 rounded-full flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-[#225F8B]" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Real-time Messaging</h4>
                <p className="text-sm text-gray-600">Instant team communication</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InternalCommunication;