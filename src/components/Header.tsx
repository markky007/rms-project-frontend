import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../app/providers/AuthContext";
import { NotificationItem } from "../app/layouts/AppLayout";

export interface HeaderProps {
  isCollapsed: boolean;
  setIsOpenMobile: (open: boolean) => void;
  onSearchClick: () => void;
  notifications: NotificationItem[];
  isLoadingNotifications: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isCollapsed,
  setIsOpenMobile,
  onSearchClick,
  notifications,
  isLoadingNotifications,
}) => {
  const { user } = useAuth();
  const location = useLocation();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Route path mappings to Thai labels
  const pathMaps: { [key: string]: string } = {
    "": "ภาพรวม",
    rooms: "จัดการห้องพัก",
    tenants: "จัดการผู้เช่า",
    contracts: "สัญญาเช่า",
    "meter-reading": "จดมิเตอร์",
    "meter-reading-edit": "แก้ไขมิเตอร์",
    invoices: "ใบแจ้งหนี้",
    payments: "รับชำระเงิน",
    maintenance: "แจ้งซ่อม",
    users: "จัดการผู้ใช้งาน",
    buildings: "จัดการอาคาร",
  };

  const getBreadcrumbs = () => {
    const paths = location.pathname.split("/").filter(Boolean);
    const breadcrumbs = [{ path: "/", label: "หน้าแรก" }];

    let currentPath = "";
    paths.forEach((p) => {
      currentPath += `/${p}`;
      const label = pathMaps[p] || p;
      breadcrumbs.push({ path: currentPath, label });
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-16 bg-white border-b border-border px-6 flex items-center justify-between sticky top-0 z-sticky select-none">
      {/* Left side: Hamburger button + Breadcrumbs */}
      <div className="flex items-center gap-4">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          onClick={() => setIsOpenMobile(true)}
          className="p-1 rounded text-muted hover:text-ink hover:bg-surface lg:hidden"
          aria-label="เปิดเมนูนำทาง"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Hierarchical Breadcrumbs */}
        <nav className="hidden sm:flex items-center text-xs font-sans text-muted">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;

            return (
              <React.Fragment key={crumb.path}>
                {index > 0 && (
                  <span className="mx-2 text-border select-none" aria-hidden="true">
                    /
                  </span>
                )}
                {isLast ? (
                  <span className="font-semibold text-ink font-sans select-none">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    to={crumb.path}
                    className="hover:text-primary transition-colors font-sans"
                  >
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Right side: Global Search + Notifications + User Avatar */}
      <div className="flex items-center gap-4">
        {/* Global Search Trigger (Command Palette Trigger) */}
        <button
          onClick={onSearchClick}
          className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-md bg-surface hover:bg-surface/80 text-xs text-muted font-sans font-medium transition-colors cursor-pointer select-none"
          aria-label="ค้นหา (กด ⌘K)"
        >
          <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="hidden md:inline">ค้นหา...</span>
          <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 border border-border-subtle rounded bg-white font-mono text-[9px] text-muted select-none">
            ⌘K
          </kbd>
        </button>

        {/* Notifications Icon (Simple bell) */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-1.5 rounded-full text-muted hover:text-ink hover:bg-surface transition-colors relative"
            aria-label="การแจ้งเตือน"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {/* Simple indicator */}
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Click-outside backdrop overlay to close dropdown */}
          {isNotificationsOpen && (
            <div
              className="fixed inset-0 z-dropdown"
              onClick={() => setIsNotificationsOpen(false)}
            />
          )}

          {/* Notification dropdown popover */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-border rounded-lg shadow-elevated z-modal overflow-hidden font-sans">
              <div className="px-4 py-3 border-b border-border bg-surface flex justify-between items-center select-none">
                <span className="text-xs font-bold text-ink">การแจ้งเตือน ({notifications.length})</span>
                {notifications.length > 0 && (
                  <span className="text-[10px] text-muted font-sans">อัปเดตเรียลไทม์</span>
                )}
              </div>
              <div className="max-h-[280px] overflow-y-auto divide-y divide-border-subtle flex flex-col">
                {isLoadingNotifications ? (
                  <div className="py-8 text-center text-xs text-muted font-sans">
                    กำลังโหลดข้อมูลแจ้งเตือน...
                  </div>
                ) : notifications.length > 0 ? (
                  notifications.map((item) => (
                    <Link
                      key={item.id}
                      to={item.link}
                      onClick={() => setIsNotificationsOpen(false)}
                      className="px-4 py-3 hover:bg-surface/50 transition-colors flex flex-col gap-1 text-left"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                          item.type === "expiry"
                            ? "bg-warning"
                            : item.type === "overdue"
                            ? "bg-error"
                            : "bg-primary"
                        }`} />
                        <span className="text-xs font-bold text-ink leading-tight font-sans">
                          {item.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted leading-relaxed pl-4 font-sans">
                        {item.description}
                      </p>
                    </Link>
                  ))
                ) : (
                  <div className="py-12 px-4 text-center text-xs text-muted select-none flex flex-col gap-2 font-sans">
                    <svg className="w-8 h-8 mx-auto text-muted/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span>ไม่มีการแจ้งเตือนใหม่ในขณะนี้</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User profile dropdown indicator / Avatar */}
        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-border select-none">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold font-sans text-sm shadow-low">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <span className="hidden md:inline text-xs font-semibold text-ink font-sans">
              {user.username}
            </span>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
