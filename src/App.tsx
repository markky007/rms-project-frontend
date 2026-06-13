import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./app/providers/AuthContext";
import AppLayout from "./app/layouts/AppLayout";
import AuthLayout from "./app/layouts/AuthLayout";
import Login from "./pages/Login";
import RoomDashboard from "./pages/RoomDashboard";
import RoomManagement from "./pages/RoomManagement";
import MeterReadingForm from "./pages/MeterReadingForm";
import MeterReadingEdit from "./pages/MeterReadingEdit";
import Invoices from "./pages/Invoices";
import UserManagement from "./pages/UserManagement";
import TenantManagement from "./pages/TenantManagement";
import ContractManagement from "./pages/ContractManagement";
import PaymentManagement from "./pages/PaymentManagement";
import MaintenanceRequests from "./pages/MaintenanceRequests";
import { AlertProvider } from "./hooks/useAlert";
import AlertDialog from "./components/AlertDialog";
import "./index.css";

// Temporary stub pages for V2 new routes
const BuildingsPage = () => <div className="font-sans text-sm p-4 bg-white border border-border rounded-lg">หน้าสำหรับจัดการอาคาร (อยู่ระหว่างพัฒนาย้ายมา V2)</div>;

export function App() {
  return (
    <AuthProvider>
      <AlertProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
            </Route>

            {/* Protected App Routes */}
            <Route element={<AppLayout />}>
              <Route index element={<RoomDashboard />} />
              <Route path="buildings" element={<BuildingsPage />} />
              <Route path="rooms" element={<RoomManagement />} />
              <Route path="meter-reading" element={<MeterReadingForm />} />
              <Route path="meter-reading-edit" element={<MeterReadingEdit />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="tenants" element={<TenantManagement />} />
              <Route path="contracts" element={<ContractManagement />} />
              <Route path="payments" element={<PaymentManagement />} />
              <Route path="maintenance" element={<MaintenanceRequests />} />
              
              <Route
                path="*"
                element={
                  <div className="flex flex-col items-center justify-center py-20 text-center gap-4 bg-white border border-border rounded-lg font-sans">
                    <h2 className="text-xl font-bold text-ink">ไม่พบหน้าที่คุณต้องการ</h2>
                    <p className="text-sm text-muted">กรุณาตรวจสอบลิงก์หรือเส้นทางใหม่อีกครั้ง</p>
                  </div>
                }
              />
            </Route>
          </Routes>
          <AlertDialog />
        </BrowserRouter>
      </AlertProvider>
    </AuthProvider>
  );
}

export default App;
