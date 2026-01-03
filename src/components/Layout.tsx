import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const Layout: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
      }}
    >
      {/* Sidebar - Fixed width */}
      <div style={{ width: "256px", flexShrink: 0 }}>
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <main style={{ flex: 1, overflow: "auto" }}>
        <div style={{ padding: "32px" }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
