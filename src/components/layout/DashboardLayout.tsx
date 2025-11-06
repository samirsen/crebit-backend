import React, { useState } from 'react';
import { BarChart3, CreditCard, TrendingUp, MessageCircle, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Header from './Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange?: (tab: string) => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, activeTab, onTabChange }) => {
  const { user, userProfile } = useAuth();
  
  const sidebarItems = [
    { name: 'Transaction History', icon: BarChart3, active: activeTab === 'Dashboard', id: 'Dashboard' }
  ];

  const getInitials = () => {
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name[0]}${userProfile.last_name[0]}`.toUpperCase();
    }
    return 'U';
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
          {/* User Profile */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#17484A] rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">{getInitials()}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900" style={{fontFamily: "'Satoshi Variable', sans-serif", fontWeight: "600"}}>
                  {userProfile?.first_name} {userProfile?.last_name}
                </p>
                <p className="text-xs text-gray-500" style={{fontFamily: "'Inter', sans-serif"}}>
                  {userProfile?.email}
                </p>
              </div>
            </div>
          </div>

        {/* Navigation */}
        <nav className="p-4 flex-1 flex flex-col overflow-y-auto">
          <ul className="space-y-2">
            {sidebarItems.map((item) => (
              <li key={item.name}>
                <button
                  onClick={() => {
                    if (onTabChange) {
                      onTabChange(item.id);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    item.active
                      ? 'bg-[#17484A]/10 text-[#17484A] border border-[#17484A]/20'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  style={{fontFamily: "'Inter', sans-serif !important"}}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {children}
        </div>

        {/* Fixed Hopping Frog at Bottom of Screen (Left Side) */}
        <div className="fixed bottom-4 left-4 z-50 group">
          <img 
            src="/frogHop.png" 
            alt="Hopping Frog Mascot" 
            className="w-24 h-20 hover:scale-105 transition-transform duration-300 cursor-pointer"
          />
          
          {/* Speech Bubble Tooltip */}
          <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="bg-white border-2 border-[#17484A] rounded-lg px-3 py-2 shadow-lg relative w-56">
              <p className="text-sm font-medium text-[#17484A] text-center" style={{fontFamily: "'Satoshi Variable', sans-serif", fontWeight: "600"}}>
                Ribbit! Keep up the hard work!
              </p>
              {/* Speech bubble tail */}
              <div className="absolute top-full left-12 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#17484A]"></div>
              <div className="absolute top-full left-12 translate-y-[-2px] w-0 h-0 border-l-3 border-r-3 border-t-3 border-transparent border-t-white"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardLayout;
