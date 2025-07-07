import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Calendar, User, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { ANNOUNCEMENTS_DATA } from '../data/mock';

const Announcements = () => {
  const [selectedPriority, setSelectedPriority] = useState('all');

  const priorityColors = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-green-100 text-green-800 border-green-200'
  };

  const priorityIcons = {
    high: AlertCircle,
    medium: Info,
    low: CheckCircle
  };

  const filteredAnnouncements = selectedPriority === 'all' 
    ? ANNOUNCEMENTS_DATA 
    : ANNOUNCEMENTS_DATA.filter(ann => ann.priority === selectedPriority);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Announcements</h2>
        <Badge variant="outline" className="bg-[#225F8B]/10 text-[#225F8B] border-[#225F8B]/20">
          {filteredAnnouncements.length} {selectedPriority === 'all' ? 'Total' : selectedPriority}
        </Badge>
      </div>

      {/* Priority Filter */}
      <div className="flex flex-wrap gap-2">
        {['all', 'high', 'medium', 'low'].map((priority) => (
          <Button
            key={priority}
            variant={selectedPriority === priority ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPriority(priority)}
            className={`transition-all duration-200 ${
              selectedPriority === priority
                ? 'bg-gradient-to-r from-[#225F8B] to-[#225F8B]/80 text-white'
                : 'hover:bg-[#225F8B]/10 hover:border-[#225F8B]/50'
            }`}
          >
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
          </Button>
        ))}
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.length > 0 ? (
          filteredAnnouncements.map((announcement) => {
            const PriorityIcon = priorityIcons[announcement.priority];
            return (
              <Card 
                key={announcement.id} 
                className="hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${priorityColors[announcement.priority]}`}>
                        <PriorityIcon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                          {announcement.title}
                        </CardTitle>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(announcement.date)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>{announcement.author}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={priorityColors[announcement.priority]}
                    >
                      {announcement.priority}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {announcement.content}
                  </p>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Announcements Found
              </h3>
              <p className="text-gray-600">
                No announcements match the selected priority filter.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Stats */}
      <Card className="bg-gradient-to-r from-[#225F8B]/5 to-[#225F8B]/10 border-[#225F8B]/20">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {ANNOUNCEMENTS_DATA.filter(a => a.priority === 'high').length}
              </div>
              <div className="text-sm text-gray-600">High Priority</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {ANNOUNCEMENTS_DATA.filter(a => a.priority === 'medium').length}
              </div>
              <div className="text-sm text-gray-600">Medium Priority</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {ANNOUNCEMENTS_DATA.filter(a => a.priority === 'low').length}
              </div>
              <div className="text-sm text-gray-600">Low Priority</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Announcements;