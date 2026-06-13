import React, { useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../app/providers/AuthContext";

interface MobileMoreSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMoreSheet: React.FC<MobileMoreSheetProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Prevent background scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogout = () => {
    onClose();
    logout();
    navigate("/login");
  };

  const moreItems = [
    {
      group: "อสังหาริมทรัพย์ & สัญญา",
      items: [
        {
          name: "ผู้เช่า",
          path: "/tenants",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          ),
        },
        {
          name: "สัญญาเช่า",
          path: "/contracts",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
        },
      ],
    },
    {
      group: "การเงิน & มิเตอร์",
      items: [
        {
          name: "จดมิเตอร์",
          path: "/meter-reading",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          ),
        },
        {
          name: "แก้ไขมิเตอร์",
          path: "/meter-reading-edit",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          ),
        },
        {
          name: "รับชำระเงิน",
          path: "/payments",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          ),
        },
      ],
    },
    {
      group: "ระบบ & ตั้งค่า",
      items: [
        {
          name: "จัดการผู้ใช้",
          path: "/users",
          adminOnly: true,
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ),
        },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-modal flex flex-col justify-end lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#000000]/40 backdrop-blur-[2px] transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Sheet Container */}
      <div className="relative bg-white rounded-t-xl max-h-[85vh] w-full flex flex-col overflow-hidden shadow-elevated animate-slide-up pb-safe">
        {/* Drag Indicator / Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-surface">
          <span className="font-heading text-base font-bold text-ink">เมนูเพิ่มเติม</span>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-muted hover:bg-black/5 hover:text-ink touch-target flex items-center justify-center"
            aria-label="ปิดเมนู"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-4">
          {moreItems.map((group, gIdx) => {
            const filteredItems = group.items.filter(
              (item) => !item.adminOnly || user?.role === "admin"
            );

            if (filteredItems.length === 0) return null;

            return (
              <div key={gIdx} className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-muted tracking-wider uppercase">
                  {group.group}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {filteredItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-3 rounded-lg border text-sm font-medium transition-all duration-150 touch-target ${
                          isActive
                            ? "bg-primary-light border-primary/20 text-primary"
                            : "bg-surface-raised border-border-subtle text-ink active:bg-surface"
                        }`
                      }
                    >
                      <span className="text-muted flex-shrink-0">{item.icon}</span>
                      <span className="truncate">{item.name}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}

          {/* User profile details */}
          {user && (
            <div className="mt-2 p-3 bg-surface rounded-lg border border-border-subtle flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-base">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold text-ink truncate">{user.username}</span>
                <span className="text-xs text-muted capitalize">ตำแหน่ง: {user.role === "admin" ? "แอดมิน" : "พนักงาน"}</span>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-error-light border border-error/15 text-sm font-medium text-error hover:bg-error/10 active:bg-error/20 transition-colors duration-150 touch-target mt-2 mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
