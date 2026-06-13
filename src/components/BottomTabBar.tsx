import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { MobileMoreSheet } from "./MobileMoreSheet";

export const BottomTabBar: React.FC = () => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const location = useLocation();

  // Helper to determine if current path is one of the main 4 tabs
  const isMainTabActive = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  // List of primary tabs
  const mainTabs = [
    {
      name: "ภาพรวม",
      path: "/",
      exact: true,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
        </svg>
      ),
    },
    {
      name: "ห้องพัก",
      path: "/rooms",
      exact: false,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: "ใบแจ้งหนี้",
      path: "/invoices",
      exact: false,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      name: "แจ้งซ่อม",
      path: "/maintenance",
      exact: false,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  // Check if any route inside More menu is currently active
  const isMoreActive = () => {
    const morePaths = ["/room-status", "/tenants", "/contracts", "/meter-reading", "/meter-reading-edit", "/users"];
    return morePaths.some((p) => location.pathname.startsWith(p));
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-sticky bg-white border-t border-border-subtle shadow-medium lg:hidden flex justify-around items-stretch h-[calc(var(--mobile-bottom-bar-height)+var(--mobile-safe-area-bottom))] pb-safe">
        {mainTabs.map((tab) => {
          const isActive = isMainTabActive(tab.path, tab.exact);
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 font-sans text-[10px] font-bold transition-all duration-150 touch-target ${
                isActive ? "text-primary" : "text-muted hover:text-ink"
              }`}
            >
              <span className={`flex-shrink-0 ${isActive ? "text-primary" : "text-muted"}`}>
                {tab.icon}
              </span>
              <span className="truncate">{tab.name}</span>
            </NavLink>
          );
        })}

        {/* Tab "เพิ่มเติม" (More) */}
        <button
          onClick={() => setIsMoreOpen(true)}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 font-sans text-[10px] font-bold transition-all duration-150 touch-target ${
            isMoreActive() || isMoreOpen ? "text-primary" : "text-muted hover:text-ink"
          }`}
          aria-label="เมนูเพิ่มเติม"
        >
          <span className={`flex-shrink-0 ${isMoreActive() || isMoreOpen ? "text-primary" : "text-muted"}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </span>
          <span>เพิ่มเติม</span>
        </button>
      </div>

      <MobileMoreSheet isOpen={isMoreOpen} onClose={() => setIsMoreOpen(false)} />
    </>
  );
};

export default BottomTabBar;
