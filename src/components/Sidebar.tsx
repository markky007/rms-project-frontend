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
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navItems: NavItem[] = [
    { name: "ห้องพัก", path: "/", icon: <DoorOpen size={20} /> },
    { name: "จัดการห้องพัก", path: "/rooms", icon: <DoorOpen size={20} /> },
    { name: "ผู้เช่า", path: "/tenants", icon: <Users size={20} /> },
    { name: "สัญญา", path: "/contracts", icon: <FileText size={20} /> },
    { name: "จดมิเตอร์", path: "/meter-reading", icon: <PenTool size={20} /> },
    {
      name: "ใบแจ้งหนี้",
      path: "/invoices",
      icon: <ClipboardList size={20} />,
    },
    { name: "การชำระเงิน", path: "/payments", icon: <CreditCard size={20} /> },
    { name: "แจ้งซ่อม", path: "/maintenance", icon: <Wrench size={20} /> },
    { name: "จัดการผู้ใช้", path: "/users", icon: <UserCog size={20} /> },
  ];

  const sidebarStyle: React.CSSProperties = {
    height: "100vh",
    width: "256px",
    backgroundColor: "#0f172a",
    color: "white",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  };

  const headerStyle: React.CSSProperties = {
    padding: "24px",
    borderBottom: "1px solid #334155",
  };

  const logoContainerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  };

  const logoIconStyle: React.CSSProperties = {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #3b82f6, #6366f1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 10px 15px -3px rgba(59, 130, 246, 0.3)",
  };

  const navStyle: React.CSSProperties = {
    flex: 1,
    padding: "16px",
    overflowY: "auto",
  };

  const getNavLinkStyle = (isActive: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: "12px",
    marginBottom: "4px",
    textDecoration: "none",
    transition: "all 0.2s ease",
    backgroundColor: isActive ? "#2563eb" : "transparent",
    color: isActive ? "white" : "#94a3b8",
    boxShadow: isActive ? "0 10px 15px -3px rgba(37, 99, 235, 0.3)" : "none",
  });

  const logoutContainerStyle: React.CSSProperties = {
    padding: "16px",
    borderTop: "1px solid #334155",
  };

  const logoutButtonStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    width: "100%",
    background: "none",
    border: "none",
    color: "#94a3b8",
    cursor: "pointer",
    borderRadius: "12px",
    transition: "all 0.2s ease",
  };

  return (
    <div style={sidebarStyle}>
      {/* Logo Header */}
      <div style={headerStyle}>
        <div style={logoContainerStyle}>
          <div style={logoIconStyle}>
            <Building2 size={22} color="white" />
          </div>
          <div>
            <h1
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                margin: 0,
                background: "linear-gradient(90deg, #60a5fa, #818cf8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              RMS Manager
            </h1>
            <p
              style={{
                fontSize: "10px",
                color: "#64748b",
                margin: "4px 0 0 0",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              ระบบจัดการหอพัก
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={navStyle}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            style={({ isActive }) => getNavLinkStyle(isActive)}
          >
            {item.icon}
            <span style={{ fontSize: "14px", fontWeight: 500 }}>
              {item.name}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div style={logoutContainerStyle}>
        <button
          onClick={handleLogout}
          style={logoutButtonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
            e.currentTarget.style.color = "#f87171";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "#94a3b8";
          }}
        >
          <LogOut size={20} />
          <span style={{ fontSize: "14px", fontWeight: 500 }}>ออกจากระบบ</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
