import React, { createContext, useContext, useState, useEffect } from 'react';
import { findUserByEmail } from '../data/mock';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('showtimeUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Mock authentication - check if user exists and password is correct
      const foundUser = findUserByEmail(email);
      if (!foundUser) {
        throw new Error('User not found');
      }

      if (password !== 'Welcome@123') {
        throw new Error('Invalid password');
      }

      const userData = {
        id: foundUser["Email ID"],
        name: foundUser.Name,
        email: foundUser["Email ID"],
        designation: foundUser.Designation,
        department: foundUser.Department,
        subDepartment: foundUser.SubDepartment,
        reviewer: foundUser.Reviewer,
        loginTime: new Date().toISOString()
      };

      setUser(userData);
      localStorage.setItem('showtimeUser', JSON.stringify(userData));
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('showtimeUser');
  };

  const updateProfile = (profileData) => {
    const updatedUser = { ...user, ...profileData };
    setUser(updatedUser);
    localStorage.setItem('showtimeUser', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    login,
    logout,
    updateProfile,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};