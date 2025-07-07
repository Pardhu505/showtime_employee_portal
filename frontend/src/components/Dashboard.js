import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import PortalCards from './PortalCards';
import Announcements from './Announcements';
import QuickLinks from './QuickLinks';
import UserProfile from './UserProfile';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Calendar, Users, BarChart3, Settings, Bell } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('portals');

  const renderContent = () => {
    switch (activeSection) {
      case 'portals':
        return <PortalCards />;
      case 'announcements':
        return <Announcements />;
      case 'quicklinks':
        return <QuickLinks />;
      case 'profile':
        return <UserProfile />;
      default:
        return <PortalCards />;
    }
  };

  const navigationItems = [
    { id: 'portals', label: 'Portal Access', icon: BarChart3 },
    { id: 'announcements', label: 'Announcements', icon: Bell },
    { id: 'quicklinks', label: 'Quick Links', icon: Settings },
    { id: 'profile', label: 'Profile', icon: Users }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    Welcome back, {user?.name}!
                  </h1>
                  <p className="text-blue-100 text-lg">
                    {user?.designation} • {user?.department}
                  </p>
                  <p className="text-blue-200 text-sm mt-2">
                    Access your workspace portals and stay updated with company announcements
                  </p>
                </div>
                <div className="hidden md:block">
                  <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Calendar className="h-16 w-16 text-white/80" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? "default" : "outline"}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center gap-2 transition-all duration-200 ${
                    activeSection === item.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'hover:bg-blue-50 hover:border-blue-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="transition-all duration-300">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;