import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import RoomDashboard from "./pages/RoomDashboard";
import MeterReadingForm from "./pages/MeterReadingForm";
import "./index.css";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<RoomDashboard />} />
          <Route path="meter-reading" element={<MeterReadingForm />} />
          {/* Add more routes here */}
          <Route path="*" element={<div className="p-4">Page Not Found</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
