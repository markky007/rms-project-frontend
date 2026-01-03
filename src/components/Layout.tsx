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
      {/* Sidebar - Fixed position */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "256px",
          height: "100vh",
          zIndex: 50,
        }}
      >
        <Sidebar />
      </div>

      {/* Main Content Area - offset by sidebar width */}
      <main
        style={{
          flex: 1,
          marginLeft: "256px",
          minHeight: "100vh",
          overflow: "auto",
        }}
      >
        <div style={{ padding: "32px" }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
