import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config/api';
import Header from './Header';
import PortalCards from './PortalCards';
import Announcements from './Announcements';
import UserProfile from './UserProfile';
import InternalCommunication from './InternalCommunication';
import AdminPanel from './AdminPanel';
// import PayslipManagement from './PayslipManagement';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Calendar, Users, BarChart3, Bell, MessageSquare, Gift, Shield, FileText, CalendarCheck } from 'lucide-react';
import EAttendance from './EMPAttedence';
import ManagerReport from './Manger Attendence';
import AttendanceReport from './AdminAttedenceReport';
import { employeeAPI } from '@/Services/api';

const Dashboard = () => {
  const { user, loading: authLoading, navigationTarget } = useAuth();
  const [activeSection, setActiveSection] = useState('portals');
  const [readAnnouncementIds, setReadAnnouncementIds] = useState(new Set());
  const [announcements, setAnnouncements] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);

  // Helper to check for birthdays
  const checkBirthdays = (employees) => {
    const today = new Date();
    const todayMonth = today.getMonth() + 1; // JS months are 0-indexed
    const todayDay = today.getDate();

    return employees.filter(employee => {
      if (!employee.date_of_birth) return false;
      const dob = new Date(employee.date_of_birth);
      const dobMonth = dob.getMonth() + 1;
      const dobDay = dob.getDate();
      return dobMonth === todayMonth && dobDay === todayDay;
    });
  };

  // Helper to generate birthday announcements
  const generateBirthdayAnnouncements = (birthdayEmployees, currentUser) => {
    return birthdayEmployees.map(employee => {
      // Check if the current user is the one having a birthday
      if (currentUser && currentUser.email === employee.email) {
        // Message for the birthday person
        return {
          id: `birthday-personal-${employee.email}`,
          type: 'birthday-personal',
          title: `Happy Birthday, ${employee.name}!`,
          content: `We wish you all the best on your special day. Thank you for being a valuable part of our team. Have a wonderful celebration! 🎂`,
          author: 'Showtime Consulting',
          date: new Date().toISOString(),
          priority: 'high',
        };
      }
      // Message for everyone else
      return {
        id: `birthday-announcement-${employee.email}`,
        type: 'birthday',
        title: `It's ${employee.name}'s Birthday!`,
        content: `Join us in wishing ${employee.name} a very happy birthday today! 🎉`,
        author: 'Showtime HR',
        date: new Date().toISOString(),
        priority: 'medium',
      };
    });
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/announcements`);
      if (!response.ok) throw new Error('Failed to fetch announcements');
      const data = await response.json();
      
      // Fetch all employees to check for birthdays
      const employees = await employeeAPI.getAllEmployees();
      setAllEmployees(employees);

      // Generate birthday announcements
      const birthdayEmployees = checkBirthdays(employees, user);
      const birthdayAnns = generateBirthdayAnnouncements(birthdayEmployees, user);

      // Combine fetched announcements with birthday announcements
      setAnnouncements([...data, ...birthdayAnns]);

    } catch (error) {
      console.error("Dashboard: Failed to fetch announcements", error);
    }
  };

  useEffect(() => {
    fetchAnnouncements();

    const handleNewAnnouncement = (event) => {
      const message = event.detail;
      if (message.type === 'new_announcement') {
        setAnnouncements(prev => {
          // Prevent adding duplicate announcements
          if (prev.some(ann => ann.id === message.data.id)) {
            return prev;
          }
          return [message.data, ...prev];
        });
      }
    };
    
    window.addEventListener('websocket-message', handleNewAnnouncement);
    return () => window.removeEventListener('websocket-message', handleNewAnnouncement);
  }, []);

  // Load and manage user-specific read announcement IDs
  useEffect(() => {
    if (user?.email) {
      const saved = localStorage.getItem(`readAnnouncementIds_${user.email}`);
      setReadAnnouncementIds(saved ? new Set(JSON.parse(saved)) : new Set());
    }
  }, [user?.email]);

  const handleReadAnnouncement = (announcementId) => {
    if (!user?.email) return; // Do not save if user is not identified

    setReadAnnouncementIds(prev => {
      const newSet = new Set(prev).add(announcementId);
      localStorage.setItem(`readAnnouncementIds_${user.email}`, JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  };

  // Effect to handle navigation from notifications
  useEffect(() => {
    if (navigationTarget?.section) {
      setActiveSection(navigationTarget.section);
    }
  }, [navigationTarget]);

  const renderContent = () => {
    if (authLoading) return <div className="flex justify-center items-center h-64">Loading...</div>;

    switch (activeSection) {
      case 'portals': return <PortalCards />;
      case 'announcements': return <Announcements announcements={announcements} setAnnouncements={setAnnouncements} />;
      case 'profile': return <UserProfile />;
      case 'communication': return <InternalCommunication />;
      case 'admin': return <AdminPanel />;
      // case 'payslips': return <PayslipManagement />;

      case 'attendance':
        if (user?.isAdmin) return <AttendanceReport />;
        if (user?.designation === 'Reporting manager') return <ManagerReport />;
        return <EAttendance />;
      default: return <PortalCards />;
    }
  };

  const navigationItems = [
    { id: 'portals', label: 'Portal Access', icon: BarChart3 },
    { id: 'announcements', label: 'Announcements', icon: Bell },
    { id: 'communication', label: 'Communication', icon: MessageSquare },
    { id: 'attendance', label: user?.isAdmin ? 'Attendance Report' : 'Attendance', icon: CalendarCheck },
    // { id: 'payslips', label: 'Payslips', icon: FileText },

    ...(user?.isAdmin ? [{ id: 'admin', label: 'Admin Panel', icon: Shield }] : []),
    { id: 'profile', label: 'Profile', icon: Users }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* ... (rest of the component is unchanged) ... */}
      <div className="absolute inset-0 opacity-10">
        <img 
          src="https://showtimeconsulting.in/web/images/thm-shape1.png" 
          alt="Background Shape" 
          className="w-full h-full object-cover object-center"
          loading="lazy"
        />
      </div>

      <div className="relative z-10">
        <Header 
          onSectionChange={setActiveSection} 
          newAnnouncements={announcements.filter(a => a.type !== 'birthday' && !readAnnouncementIds.has(a.id))}
          onReadAnnouncement={handleReadAnnouncement}
        />
        <div className="container mx-auto px-4 py-8">
          {/* Welcome Card */}
          <Card className="bg-gradient-to-r from-[#225F8B] to-[#225F8B]/80 text-white border-0 shadow-xl mb-8">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
                  <p className="text-blue-100 text-lg">{user?.designation} • {user?.department}</p>
                  <p className="text-blue-200 text-sm mt-2">Access your workspace portals and stay updated with company announcements</p>
                  {announcements.some(a => a.type === 'birthday') && (
                    <div className="mt-4 flex items-center space-x-2">
                      <Gift className="h-5 w-5 text-yellow-300" />
                      <span className="text-yellow-200 text-sm">
                        {announcements.filter(a => a.type === 'birthday').length} birthday
                        {announcements.filter(a => a.type === 'birthday').length > 1 ? 's' : ''} today! 🎉
                      </span>
                    </div>
                  )}
                </div>
                <div className="hidden md:block">
                  <div className="text-white text-lg font-semibold">
                    {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="mb-8 flex flex-wrap gap-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? 'default' : 'outline'}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center gap-2 transition-all duration-200 ${
                    activeSection === item.id
                      ? 'bg-gradient-to-r from-[#225F8B] to-[#225F8B]/80 text-white shadow-lg'
                      : 'hover:bg-blue-50 hover:border-[#225F8B]/50 bg-white/80 backdrop-blur-sm'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </div>

          {/* Content */}
          <div className="transition-all duration-300">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
