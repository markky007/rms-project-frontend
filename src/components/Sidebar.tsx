import React from "react";
import {
  ClipboardList,
  PenTool,
  LogOut,
  Building2,
  DoorOpen,
  Users,
  FileText,
  CreditCard,
  Wrench,
  UserCog,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = (): void => {
    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Redirect to login page
    navigate("/login");
  };

  const navItems: NavItem[] = [
    { name: "ห้องพัก", path: "/", icon: <DoorOpen size={20} /> },
    { name: "จัดการห้องพัก", path: "/rooms", icon: <DoorOpen size={20} /> },
    { name: "อาคาร", path: "/buildings", icon: <Building2 size={20} /> },
    { name: "ผู้เช่า", path: "/tenants", icon: <Users size={20} /> },
    { name: "สัญญา", path: "/contracts", icon: <FileText size={20} /> },
    {
      name: "จดมิเตอร์",
      path: "/meter-reading",
      icon: <PenTool size={20} />,
    },
    {
      name: "ใบแจ้งหนี้",
      path: "/invoices",
      icon: <ClipboardList size={20} />,
    },
    {
      name: "การชำระเงิน",
      path: "/payments",
      icon: <CreditCard size={20} />,
    },
    {
      name: "แจ้งซ่อม",
      path: "/maintenance",
      icon: <Wrench size={20} />,
    },
    {
      name: "จัดการผู้ใช้",
      path: "/users",
      icon: <UserCog size={20} />,
    },
  ];

  return (
    <div className="h-screen w-64 bg-slate-900 text-white flex flex-col shadow-xl">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold text-blue-400">RMS Manager</h1>
        <p className="text-xs text-slate-400 mt-1">Property Management</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-2 w-full text-slate-400 hover:text-red-400 transition-colors"
        >
          <LogOut size={20} />
          <span>ออกจากระบบ</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
