"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ReferenceLine } from 'recharts';

// Mock data for habits
const INITIAL_HABITS = [
  {
    id: 1,
    name: 'Sleep',
    icon: '😴',
    color: '#8B5CF6',
    target: 8,
    unit: 'hours',
    streak: 5,
    logs: [
      { date: '2025-04-28', value: 7.5 },
      { date: '2025-04-29', value: 8 },
      { date: '2025-04-30', value: 6.5 },
      { date: '2025-05-01', value: 7 },
      { date: '2025-05-02', value: 8 },
      { date: '2025-05-03', value: 7.5 },
      { date: '2025-05-04', value: 0 }, // Today - not logged yet
    ],
    category: 'health',
  },
  {
    id: 2,
    name: 'Water',
    icon: '💧',
    color: '#3B82F6',
    target: 8,
    unit: 'glasses',
    streak: 3,
    logs: [
      { date: '2025-04-28', value: 6 },
      { date: '2025-04-29', value: 7 },
      { date: '2025-04-30', value: 5 },
      { date: '2025-05-01', value: 8 },
      { date: '2025-05-02', value: 8 },
      { date: '2025-05-03', value: 7 },
      { date: '2025-05-04', value: 3 }, // Today - partially logged
    ],
    category: 'health',
  },
  {
    id: 3,
    name: 'Exercise',
    icon: '🏃',
    color: '#EF4444',
    target: 30,
    unit: 'minutes',
    streak: 0,
    logs: [
      { date: '2025-04-28', value: 45 },
      { date: '2025-04-29', value: 20 },
      { date: '2025-04-30', value: 0 },
      { date: '2025-05-01', value: 30 },
      { date: '2025-05-02', value: 0 },
      { date: '2025-05-03', value: 0 },
      { date: '2025-05-04', value: 0 }, // Today - not logged yet
    ],
    category: 'fitness',
  },
  {
    id: 4,
    name: 'Meditation',
    icon: '🧘',
    color: '#10B981',
    target: 15,
    unit: 'minutes',
    streak: 7,
    logs: [
      { date: '2025-04-28', value: 15 },
      { date: '2025-04-29', value: 20 },
      { date: '2025-04-30', value: 15 },
      { date: '2025-05-01', value: 10 },
      { date: '2025-05-02', value: 15 },
      { date: '2025-05-03', value: 15 },
      { date: '2025-05-04', value: 0 }, // Today - not logged yet
    ],
    category: 'mindfulness',
  },
  {
    id: 5,
    name: 'Screen Time',
    icon: '📱',
    color: '#F59E0B',
    target: 120, // Target is to stay under this value
    unit: 'minutes',
    streak: 2,
    logs: [
      { date: '2025-04-28', value: 180 },
      { date: '2025-04-29', value: 150 },
      { date: '2025-04-30', value: 130 },
      { date: '2025-05-01', value: 90 },
      { date: '2025-05-02', value: 110 },
      { date: '2025-05-03', value: 120 },
      { date: '2025-05-04', value: 45 }, // Today - partially logged
    ],
    isInverse: true, // Lower is better
    category: 'productivity',
  },
  {
    id: 6,
    name: 'Reading',
    icon: '📚',
    color: '#6366F1',
    target: 30,
    unit: 'minutes',
    streak: 4,
    logs: [
      { date: '2025-04-28', value: 45 },
      { date: '2025-04-29', value: 30 },
      { date: '2025-04-30', value: 15 },
      { date: '2025-05-01', value: 30 },
      { date: '2025-05-02', value: 40 },
      { date: '2025-05-03', value: 20 },
      { date: '2025-05-04', value: 0 }, // Today - not logged yet
    ],
    category: 'personal growth',
  },
];

// Mock user data
const USER = {
  name: 'Alex Morgan',
  avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  joinDate: '2025-03-15',
};

// App categories and their icons
const CATEGORIES = [
  { id: 'all', name: 'All Habits', icon: '📊' },
  { id: 'health', name: 'Health', icon: '❤️' },
  { id: 'fitness', name: 'Fitness', icon: '💪' },
  { id: 'mindfulness', name: 'Mindfulness', icon: '🧠' },
  { id: 'productivity', name: 'Productivity', icon: '⏱️' },
  { id: 'personal growth', name: 'Personal Growth', icon: '🌱' },
];

// Helper functions
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(date);
};

const getCurrentDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const calculateCompletion = (habit: any) => {
  const todayLog = habit.logs.find((log: any) => log.date === getCurrentDate());
  if (!todayLog || todayLog.value === 0) return 0;
  
  if (habit.isInverse) {
    return Math.min(100, Math.max(0, (habit.target / todayLog.value) * 100));
  }
  
  return Math.min(100, Math.max(0, (todayLog.value / habit.target) * 100));
};

const calculateWeeklyAverage = (habit: any) => {
  const completedLogs = habit.logs.filter((log: any) => log.date !== getCurrentDate() && log.value > 0);
  if (completedLogs.length === 0) return 0;
  
  const sum = completedLogs.reduce((acc: number, log: any) => acc + log.value, 0);
  return sum / completedLogs.length;
};

function PersonalAnalyticsHabitTracker() {
  const [habits, setHabits] = useState<any[]>(INITIAL_HABITS);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedHabit, setSelectedHabit] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(2);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [userData, setUserData] = useState({
    name: USER.name,
    avatar: USER.avatar,
    theme: 'light',
    notifications: true,
    email: 'alex.morgan@example.com',
  });
  const [newHabit, setNewHabit] = useState({
    name: '',
    icon: '📝',
    color: '#3B82F6',
    target: 1,
    unit: '',
    category: 'health',
    isInverse: false,
  });
  
  useEffect(() => {
    // Initialize notifications or other startup logic
    const incompleteHabits = habits.filter(habit => {
      const todayLog = habit.logs.find((log: any) => log.date === getCurrentDate());
      return !todayLog || todayLog.value === 0;
    });
    
    setNotificationCount(incompleteHabits.length);
  }, [habits]);
  
  // Log a habit value for a specific date
  const logHabitValue = (habitId: number, value: number, date: string = selectedDate) => {
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        const updatedLogs = [...habit.logs];
        const existingLogIndex = updatedLogs.findIndex(log => log.date === date);
        
        if (existingLogIndex >= 0) {
          updatedLogs[existingLogIndex] = { ...updatedLogs[existingLogIndex], value };
        } else {
          updatedLogs.push({ date, value });
        }
        
        // Calculate new streak
        let newStreak = habit.streak;
        const isCompleted = habit.isInverse ? value <= habit.target : value >= habit.target;
        
        if (isCompleted) {
          newStreak += 1;
        } else {
          newStreak = 0;
        }
        
        return { 
          ...habit, 
          logs: updatedLogs,
          streak: newStreak
        };
      }
      return habit;
    }));
  };
  
  // Add a new habit
  const addHabit = () => {
    if (!newHabit.name || !newHabit.unit) return;
    
    const today = getCurrentDate();
    const past7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - 6 + i);
      return date.toISOString().split('T')[0];
    });
    
    const newHabitObj = {
      id: habits.length + 1,
      ...newHabit,
      streak: 0,
      logs: past7Days.map(date => ({ date, value: 0 })),
    };
    
    setHabits([...habits, newHabitObj]);
    setShowAddModal(false);
    setNewHabit({
      name: '',
      icon: '📝',
      color: '#3B82F6',
      target: 1,
      unit: '',
      category: 'health',
      isInverse: false,
    });
  };
  
  // Delete a habit
  const deleteHabit = (habitId: number) => {
    setHabits(habits.filter(habit => habit.id !== habitId));
    setSelectedHabit(null);
  };
  
  // Filter habits by category
  const filteredHabits = activeCategory === 'all' 
    ? habits 
    : habits.filter(habit => habit.category === activeCategory);
  
  // Weekly progress data for charts
  const getWeeklyData = (habit: any) => {
    return habit.logs.map((log: any) => ({
      name: new Date(log.date).toLocaleDateString('en-US', { weekday: 'short' }),
      value: log.value,
      target: habit.target,
    }));
  };
  
  // Overall completion data for radar chart
  const getOverallCompletionData = () => {
    return habits.map(habit => {
      const average = calculateWeeklyAverage(habit);
      const percentage = habit.isInverse 
        ? Math.min(100, Math.max(0, (habit.target / average) * 100))
        : Math.min(100, Math.max(0, (average / habit.target) * 100));
      
      return {
        name: habit.name,
        value: isNaN(percentage) ? 0 : percentage,
      };
    });
  };
  
  // Reminders for incomplete habits
  const incompleteTasks = habits.filter(habit => {
    const todayLog = habit.logs.find((log: any) => log.date === getCurrentDate());
    return !todayLog || todayLog.value === 0;
  });
  
  // Color scale for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Navigation */}
      <nav className="bg-white shadow-md fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <motion.div 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="flex-shrink-0 flex items-center"
              >
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                  <span className="text-xl text-white">⚡</span>
                </div>
                <span className="ml-2 text-xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">HabitPro</span>
              </motion.div>
            </div>
            
            <div className="flex items-center">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 relative"
              >
                <span className="sr-only">Notifications</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                    {notificationCount}
                  </span>
                )}
              </button>
              
              <div className="ml-3 relative">
                <button 
                  onClick={() => setShowSettingsModal(true)}
                  className="p-2 rounded-full text-gray-500 hover:bg-gray-100"
                >
                  <span className="sr-only">Settings</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
              
              <div className="ml-3 relative flex items-center">
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="flex items-center"
                >
                  <img 
                    className="h-8 w-8 rounded-full border-2 border-indigo-500"
                    src={userData.avatar}
                    alt="User avatar"
                  />
                  <span className="ml-2 font-medium text-sm hidden sm:block">{userData.name}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'dashboard'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Dashboard
              </button>
              
              <button
                onClick={() => setActiveTab('habits')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'habits'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Habits
              </button>
              
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Analytics
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Notifications Dropdown */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-16 right-4 mt-2 w-80 bg-white rounded-md shadow-lg z-20 border border-gray-200"
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Notifications</h3>
                <button className="text-xs text-indigo-600 hover:text-indigo-800">
                  Mark all as read
                </button>
              </div>
              
              {incompleteTasks.length > 0 ? (
                <div className="space-y-3">
                  {incompleteTasks.map(habit => (
                    <div key={habit.id} className="flex items-center p-2 hover:bg-gray-50 rounded-md">
                      <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${habit.color}20` }}>
                        <span className="text-lg">{habit.icon}</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium">Don't forget your {habit.name} today!</p>
                        <p className="text-xs text-gray-500">Target: {habit.target} {habit.unit}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">You're all caught up! 🎉</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Dashboard View */}
        {activeTab === 'dashboard' && (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Daily Dashboard</h1>
              <p className="text-gray-600">{formatDate(getCurrentDate())}</p>
            </div>
            
            {/* Date Selector */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const date = new Date(selectedDate);
                    date.setDate(date.getDate() - 1);
                    setSelectedDate(date.toISOString().split('T')[0]);
                  }}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  ←
                </button>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="border rounded-md px-3 py-1"
                />
                <button
                  onClick={() => {
                    const date = new Date(selectedDate);
                    date.setDate(date.getDate() + 1);
                    setSelectedDate(date.toISOString().split('T')[0]);
                  }}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  →
                </button>
              </div>
              <button
                onClick={() => setSelectedDate(getCurrentDate())}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                Today
              </button>
            </div>
            
            {/* Daily Progress */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {habits.map(habit => {
                const log = habit.logs.find(l => l.date === selectedDate);
                const value = log ? log.value : 0;
                const completion = calculateCompletion(habit);
                
                return (
                  <motion.div
                    key={habit.id}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${habit.color}20` }}>
                          <span className="text-xl">{habit.icon}</span>
                        </div>
                        <div className="ml-3">
                          <h3 className="font-medium">{habit.name}</h3>
                          <p className="text-xs text-gray-500">Target: {habit.target} {habit.unit}</p>
                        </div>
                      </div>
                      
                      {habit.streak > 0 && (
                        <div className="flex items-center px-2 py-1 bg-amber-50 rounded-full">
                          <span className="text-amber-500 text-xs font-medium">🔥 {habit.streak} day{habit.streak !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                      <motion.div 
                        className="h-2.5 rounded-full" 
                        style={{ backgroundColor: habit.color, width: '0%' }}
                        animate={{ width: `${completion}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{Math.round(completion)}% completed</span>
                      <span className="text-sm">
                        {value} / {habit.target} {habit.unit}
                      </span>
                    </div>
                    
                    <div className="mt-4">
                      <input
                        type="range"
                        className="w-full"
                        min="0"
                        max={habit.target * 2}
                        step={habit.target / 10}
                        value={value}
                        onChange={(e) => logHabitValue(habit.id, parseFloat(e.target.value), selectedDate)}
                        style={{
                          accentColor: habit.color,
                        }}
                      />
                    </div>
                    
                    <div className="mt-4 grid grid-cols-5 gap-2">
                      {[0, 0.25, 0.5, 0.75, 1].map((fraction, index) => (
                        <button
                          key={index}
                          onClick={() => logHabitValue(habit.id, habit.target * fraction, selectedDate)}
                          className="py-1 px-2 text-xs rounded-full font-medium border"
                          style={{ 
                            borderColor: habit.color,
                            backgroundColor: value === habit.target * fraction ? habit.color : 'transparent',
                            color: value === habit.target * fraction ? 'white' : habit.color,
                          }}
                        >
                          {Math.round(habit.target * fraction * 10) / 10}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
            
            {/* Weekly Overview */}
            <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
              <h2 className="text-lg font-semibold mb-4">Weekly Overview</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={habits[0].logs}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name, props) => [`${value} ${habits.find(h => h.name === name)?.unit || ''}`, name]}
                      labelFormatter={(date) => formatDate(date)}
                    />
                    <Legend />
                    {habits.map((habit) => (
                      <Line 
                        key={habit.id}
                        type="monotone" 
                        dataKey="value" 
                        data={habit.logs} 
                        name={habit.name} 
                        stroke={habit.color} 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 8 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Total Habits</h3>
                <p className="text-3xl font-bold">{habits.length}</p>
                <div className="mt-2 flex items-center">
                  <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                  <span className="text-sm text-gray-600">{habits.filter(h => h.streak > 0).length} active streaks</span>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Today's Progress</h3>
                <p className="text-3xl font-bold">
                  {Math.round(habits.reduce((acc, habit) => acc + calculateCompletion(habit), 0) / habits.length)}%
                </p>
                <div className="mt-2 flex items-center">
                  <span className="inline-block h-2 w-2 rounded-full bg-blue-500 mr-1"></span>
                  <span className="text-sm text-gray-600">
                    {habits.filter(habit => calculateCompletion(habit) > 0).length} habits tracked today
                  </span>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Longest Streak</h3>
                {habits.length > 0 ? (
                  <>
                    <p className="text-3xl font-bold">
                      {Math.max(...habits.map(h => h.streak))} days
                    </p>
                    <div className="mt-2 flex items-center">
                      <span className="inline-block h-2 w-2 rounded-full bg-amber-500 mr-1"></span>
                      <span className="text-sm text-gray-600">
                        {habits.find(h => h.streak === Math.max(...habits.map(h => h.streak)))?.name}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-3xl font-bold">0 days</p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Habits View */}
        {activeTab === 'habits' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">My Habits</h1>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center shadow-sm hover:bg-indigo-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Habit
              </motion.button>
            </div>
            
            {/* Category Filter */}
            <div className="flex overflow-x-auto pb-2 mb-6 hide-scrollbar">
              {CATEGORIES.map(category => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center px-4 py-2 rounded-full mr-2 whitespace-nowrap transition-colors ${
                    activeCategory === category.id
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-1">{category.icon}</span>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
            
            {/* Habits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHabits.length > 0 ? (
                filteredHabits.map(habit => {
                  const weeklyAverage = calculateWeeklyAverage(habit);
                  
                  return (
                    <motion.div
                      key={habit.id}
                      layoutId={`habit-card-${habit.id}`}
                      onClick={() => setSelectedHabit(habit)}
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${habit.color}20` }}>
                            <span className="text-xl">{habit.icon}</span>
                          </div>
                          <div className="ml-3">
                            <h3 className="font-medium">{habit.name}</h3>
                            <p className="text-xs text-gray-500">Goal: {habit.target} {habit.unit} {habit.isInverse ? 'or less' : ''}</p>
                          </div>
                        </div>
                        
                        {habit.streak > 0 && (
                          <div className="flex items-center px-2 py-1 bg-amber-50 rounded-full">
                            <span className="text-amber-500 text-xs font-medium">🔥 {habit.streak} day{habit.streak !== 1 ? 's' : ''}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-gray-100 rounded-lg p-3 mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-gray-500">Weekly average</span>
                          <span className="text-sm font-medium">{weeklyAverage.toFixed(1)} {habit.unit}</span>
                        </div>
                        
                        <div className="h-24">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={getWeeklyData(habit)}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} />
                              <Tooltip 
                                formatter={(value) => [`${value} ${habit.unit}`, habit.name]}
                              />
                              <Bar dataKey="value" fill={habit.color} radius={[4, 4, 0, 0]} />
                              <ReferenceLine y={habit.target} stroke={habit.color} strokeDasharray="3 3" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Category: {habit.category}</span>
                        <span>Tap to view details</span>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-10">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No habits found</h3>
                  <p className="text-gray-500 max-w-sm mx-auto mb-4">
                    {activeCategory !== 'all' 
                      ? `You don't have any habits in the ${CATEGORIES.find(c => c.id === activeCategory)?.name} category yet.`
                      : "You haven't added any habits yet. Create your first habit to start tracking!"}
                  </p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add New Habit
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Analytics View */}
        {activeTab === 'analytics' && (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-600">Track your performance over time</p>
            </div>
            
            {/* Overall Completion */}
            <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
              <h2 className="text-lg font-semibold mb-4">Habit Completion Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-2">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={getOverallCompletionData()}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                        <YAxis type="category" dataKey="name" />
                        <Tooltip formatter={(value) => [`${value}%`, 'Completion']} />
                        <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]}>
                          {getOverallCompletionData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={habits[index]?.color || '#8884d8'} />
                          ))}
                        </Bar>
                        <ReferenceLine x={100} stroke="green" strokeDasharray="3 3" label="Target" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div>
                  <div className="h-64 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={habits.map(habit => {
                            const completed = habit.logs.filter((log: any) => {
                              if (habit.isInverse) {
                                return log.value > 0 && log.value <= habit.target;
                              }
                              return log.value >= habit.target;
                            }).length;
                            
                            return {
                              name: habit.name,
                              value: completed,
                            };
                          })}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {habits.map((habit, index) => (
                            <Cell key={`cell-${index}`} fill={habit.color || COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} days completed`, '']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Streak Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Current Streaks</h2>
                <div className="space-y-4">
                  {habits
                    .sort((a, b) => b.streak - a.streak)
                    .map(habit => (
                      <div key={habit.id} className="flex items-center">
                        <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${habit.color}20` }}>
                          <span className="text-lg">{habit.icon}</span>
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex justify-between">
                            <h3 className="font-medium">{habit.name}</h3>
                            <span className="font-semibold">{habit.streak} day{habit.streak !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div 
                              className="h-1.5 rounded-full" 
                              style={{ 
                                backgroundColor: habit.color,
                                width: `${Math.min(100, habit.streak * 10)}%`  
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Weekly Target Achievement</h2>
                <div className="space-y-4">
                  {habits.map(habit => {
                    const completedDays = habit.logs.filter((log: any) => {
                      if (habit.isInverse) {
                        return log.value > 0 && log.value <= habit.target;
                      }
                      return log.value >= habit.target;
                    }).length;
                    
                    const percentage = Math.round((completedDays / habit.logs.length) * 100);
                    
                    return (
                      <div key={habit.id} className="flex items-center">
                        <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${habit.color}20` }}>
                          <span className="text-lg">{habit.icon}</span>
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex justify-between">
                            <h3 className="font-medium">{habit.name}</h3>
                            <span className="font-semibold">{completedDays}/{habit.logs.length} days</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div 
                              className="h-1.5 rounded-full" 
                              style={{ 
                                backgroundColor: habit.color,
                                width: `${percentage}%`  
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Time Analysis */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Progress Over Time</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      type="category"
                      allowDuplicatedCategory={false}
                      tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name, props) => [`${value} ${habits.find(h => h.name === name)?.unit || ''}`, name]}
                      labelFormatter={(date) => formatDate(date)}
                    />
                    <Legend />
                    {habits.map((habit) => (
                      <Line 
                        key={habit.id}
                        type="monotone" 
                        dataKey="value" 
                        data={habit.logs} 
                        name={habit.name} 
                        stroke={habit.color} 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 8 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Add Habit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Habit</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Habit Name</label>
                <input
                  type="text"
                  value={newHabit.name}
                  onChange={(e) => setNewHabit({...newHabit, name: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="e.g., Exercise"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Unit</label>
                <input
                  type="text"
                  value={newHabit.unit}
                  onChange={(e) => setNewHabit({...newHabit, unit: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="e.g., minutes"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Target</label>
                <input
                  type="number"
                  value={newHabit.target}
                  onChange={(e) => setNewHabit({...newHabit, target: Number(e.target.value)})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={newHabit.category}
                  onChange={(e) => setNewHabit({...newHabit, category: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  {CATEGORIES.filter(c => c.id !== 'all').map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={newHabit.isInverse}
                  onChange={(e) => setNewHabit({...newHabit, isInverse: e.target.checked})}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Lower is better (e.g., screen time)
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addHabit}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Add Habit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Theme</label>
                <select
                  value={userData.theme}
                  onChange={(e) => setUserData({...userData, theme: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={userData.notifications}
                  onChange={(e) => setUserData({...userData, notifications: e.target.checked})}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Enable Notifications
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData({...userData, email: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Save settings logic here
                  setShowSettingsModal(false);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <div className="flex flex-col items-center mb-6">
              <img
                src={userData.avatar}
                alt="Profile"
                className="h-24 w-24 rounded-full mb-4"
              />
              <h2 className="text-xl font-bold">{userData.name}</h2>
              <p className="text-gray-500">Member since {USER.joinDate}</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={userData.name}
                  onChange={(e) => setUserData({...userData, name: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Avatar URL</label>
                <input
                  type="text"
                  value={userData.avatar}
                  onChange={(e) => setUserData({...userData, avatar: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowProfileModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Save profile changes logic here
                  setShowProfileModal(false);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PersonalAnalyticsHabitTracker;