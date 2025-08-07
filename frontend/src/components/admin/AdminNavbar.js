'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { 
  BellIcon,
  MegaphoneIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ChartBarIcon,
  UsersIcon,
  CogIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  WrenchScrewdriverIcon,
  DocumentTextIcon,
  QrCodeIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

export default function AdminNavbar({ adminName = "Admin" }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    // Clear stored data
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userData');
    localStorage.removeItem('userEmail');
    
    // Redirect to login page
    router.push('/login');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: ChartBarIcon, href: '/admin' },
    { id: 'clerks', label: 'Clerks', icon: UsersIcon, href: '/clerk' },
    { id: 'members', label: 'Members', icon: UsersIcon, href: '/admin/members' },
    { id: 'applicants', label: 'Applicants', icon: DocumentTextIcon, href: '/admin/applicants' },
    { id: 'visitors-log', label: 'Visitors Log', icon: QrCodeIcon, href: '/admin/visitors-log' },
    { id: 'plan', label: 'Plan', icon: CreditCardIcon, href: '/admin/plan' },
    { id: 'equipments', label: 'Equipments', icon: CogIcon, href: '/admin/equipments' },
    { id: 'attendance', label: 'Attendance', icon: CalendarIcon, href: '/admin/attendance' },
    { id: 'earnings', label: 'Earnings', icon: CurrencyDollarIcon, href: '/admin/earnings' },
    { id: 'expenses', label: 'Expenses', icon: ExclamationTriangleIcon, href: '/admin/expenses' },
    { id: 'exercises', label: 'Manage Exercises', icon: WrenchScrewdriverIcon, href: '/admin/exercises' }
  ];

  // Update active menu based on current pathname
  useEffect(() => {
    const currentPath = pathname;
    
    // Find the menu item that matches the current path
    const matchingMenuItem = menuItems.find(item => {
      // Handle exact matches and special cases
      if (item.href === currentPath) return true;
      
      // Handle /clerk route for clerks menu
      if (item.id === 'clerks' && currentPath === '/clerk') return true;
      
      // Handle dashboard route
      if (item.id === 'dashboard' && currentPath === '/admin') return true;
      
      return false;
    });
    
    if (matchingMenuItem) {
      setActiveMenu(matchingMenuItem.id);
    }
  }, [pathname]);

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
                     {/* Welcome Section */}
           <div className="p-6 border-b border-gray-700">
             <div className="text-[#F4F4F4]">
               <p className="font-semibold" style={{ fontFamily: 'Poppins, sans-serif' }}>Welcome {adminName}</p>
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