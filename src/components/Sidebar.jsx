import React from "react";
import { Home, ClipboardList, PenTool, LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const navItems = [
    { name: "Dashboard", path: "/", icon: <Home size={20} /> },
    {
      name: "Meter Reading",
      path: "/meter-reading",
      icon: <PenTool size={20} />,
    },
    { name: "Invoices", path: "/invoices", icon: <ClipboardList size={20} /> },
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
        <button className="flex items-center space-x-3 px-4 py-2 w-full text-slate-400 hover:text-red-400 transition-colors">
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
