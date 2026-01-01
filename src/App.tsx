import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import RoomDashboard from "./pages/RoomDashboard";
import RoomManagement from "./pages/RoomManagement";
import MeterReadingForm from "./pages/MeterReadingForm";
import Invoices from "./pages/Invoices";
import UserManagement from "./pages/UserManagement";

import TenantManagement from "./pages/TenantManagement";
import ContractManagement from "./pages/ContractManagement";
import PaymentManagement from "./pages/PaymentManagement";
import MaintenanceRequests from "./pages/MaintenanceRequests";
import { AlertProvider } from "./hooks/useAlert";
import AlertDialog from "./components/AlertDialog";
import "./index.css";
import "./login.css";

export function App() {
  return (
    <AlertProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<RoomDashboard />} />
            <Route path="rooms" element={<RoomManagement />} />
            <Route path="meter-reading" element={<MeterReadingForm />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="users" element={<UserManagement />} />

            <Route path="tenants" element={<TenantManagement />} />
            <Route path="contracts" element={<ContractManagement />} />
            <Route path="payments" element={<PaymentManagement />} />
            <Route path="maintenance" element={<MaintenanceRequests />} />
            {/* Add more routes here */}
            <Route
              path="*"
              element={<div className="p-4">Page Not Found</div>}
            />
          </Route>
        </Routes>
        <AlertDialog />
      </BrowserRouter>
    </AlertProvider>
  );
}

export default App;
