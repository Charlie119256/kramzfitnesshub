'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  BellIcon,
  MegaphoneIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ChartBarIcon,
  UserIcon,
  CogIcon,
  CalendarIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';

export default function MemberNavbar({ memberName = "Member", activeMenu: initialActiveMenu = 'dashboard' }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(initialActiveMenu);
  const [displayName, setDisplayName] = useState(memberName);
  const router = useRouter();

  // Update active menu when prop changes
  useEffect(() => {
    setActiveMenu(initialActiveMenu);
  }, [initialActiveMenu]);

  // Fetch member's full name from API
  useEffect(() => {
    const fetchMemberName = async () => {
      try {
        const token = localStorage.getItem('adminToken') || localStorage.getItem('memberToken');
        
        if (!token) {
          setDisplayName(memberName);
          return;
        }

        // Fetch member profile data from API
        const response = await fetch('http://localhost:5000/api/member-dashboard/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.full_name) {
            setDisplayName(data.full_name);
          } else if (data.first_name && data.last_name) {
            setDisplayName(`${data.first_name} ${data.last_name}`);
          } else {
            setDisplayName(memberName);
          }
        } else {
          // Fallback to localStorage if API fails
          const userData = localStorage.getItem('userData');
          if (userData) {
            try {
              const parsedUserData = JSON.parse(userData);
              const fullName = parsedUserData.firstName && parsedUserData.lastName 
                ? `${parsedUserData.firstName} ${parsedUserData.lastName}`
                : parsedUserData.firstName || parsedUserData.name || memberName;
              setDisplayName(fullName);
            } catch (error) {
              console.error('Error parsing user data:', error);
              setDisplayName(memberName);
            }
          } else {
            setDisplayName(memberName);
          }
        }
      } catch (error) {
        console.error('Error fetching member name:', error);
        // Fallback to provided memberName
        setDisplayName(memberName);
      }
    };

    fetchMemberName();
  }, [memberName]);

  const handleLogout = () => {
    // Clear stored data
    localStorage.removeItem('token');
    localStorage.removeItem('memberToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userData');
    localStorage.removeItem('userEmail');
    
    // Redirect to login page
    router.push('/login');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: ChartBarIcon, href: '/member' },
    { id: 'profile', label: 'Profile', icon: UserIcon, href: '/member/profile' },
    { id: 'plan', label: 'Plan', icon: CalendarIcon, href: '/member/plan' },
    { id: 'exercises', label: 'Exercises', icon: WrenchScrewdriverIcon, href: '/member/exercises' }
  ];

  const handleMenuClick = (menuId) => {
    setActiveMenu(menuId);
    setIsSidebarOpen(false);
    
    // Find the menu item and navigate to its href
    const menuItem = menuItems.find(item => item.id === menuId);
    if (menuItem && menuItem.href) {
      router.push(menuItem.href);
    }
  };

  return (
    <>
      {/* Horizontal Top Navbar */}
      <div className="bg-white shadow-sm border-b fixed top-0 left-0 right-0 z-50">
        <div className="flex justify-between items-center px-4 py-3">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <Image
              src="/logo.png"
              alt="Kramz Fitness Hub Logo"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Kramz Fitness Hub
              </h1>
            </div>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-3">
            <button className="flex items-center justify-center p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200">
              <BellIcon className="h-5 w-5" />
            </button>
            
            <button className="flex items-center justify-center p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200">
              <MegaphoneIcon className="h-5 w-5" />
            </button>
            
            <button
              onClick={handleLogout}
              className="flex items-center justify-center p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              {isSidebarOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Side Navbar */}
      <div className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-[#212121] transform transition-transform duration-300 ease-in-out z-50 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex flex-col h-full">
          {/* Name Section */}
          <div className="p-6 border-b border-gray-700">
            <div className="text-[#F4F4F4]">
              <p className="font-semibold" style={{ fontFamily: 'Poppins, sans-serif' }}>{displayName}</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeMenu === item.id
                    ? 'bg-[#F4F4F4] text-[#000000]'
                    : 'text-[#F4F4F4] hover:bg-[#F4F4F4] hover:text-[#000000]'
                }`}
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content wrapper */}
      <div className="lg:ml-64 pt-16">
        {/* Your page content will go here */}
      </div>
    </>
  );
} 