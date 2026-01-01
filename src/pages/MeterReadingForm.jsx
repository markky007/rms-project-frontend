import React, { useState, useEffect } from "react";
import axios from "axios";
import { Calculator, Save, Building2 } from "lucide-react";
import { useAlert } from "../hooks/useAlert";

const MeterReadingForm = () => {
  const { showAlert } = useAlert();
  const [rooms, setRooms] = useState([]);
  const [roomId, setRoomId] = useState("");
  const [currentWater, setCurrentWater] = useState("");
  const [currentElec, setCurrentElec] = useState("");
  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all rooms on component mount
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/rooms");
        setRooms(response.data);
      } catch (error) {
        console.error("Failed to fetch rooms", error);
        showAlert({ message: "ไม่สามารถโหลดข้อมูลห้องได้", type: "error" });
      } finally {
        setLoadingRooms(false);
      }
    };

    fetchRooms();
  }, []);

  // Debounced calculation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (roomId && currentWater && currentElec) {
        handleCalculate();
      } else {
        setCalculation(null);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [roomId, currentWater, currentElec]);

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        "http://localhost:3000/api/billing/calculate",
        {
          room_id: roomId,
          current_water: Number(currentWater),
          current_elec: Number(currentElec),
          month_year: new Date().toISOString().slice(0, 7),
        }
      );
      setCalculation(response.data);
    } catch (error) {
      console.error("Calculation error", error);
      if (error.response) {
        // Backend returns JSON with error field
        const msg = error.response.data.error || "ข้อผิดพลาดจากเซิร์ฟเวอร์";
        setError(msg);
      } else {
        setError(
          "เกิดข้อผิดพลาดในการเชื่อมต่อ: กรุณาตรวจสอบว่าเซิร์ฟเวอร์ทำงานอยู่"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // In a real app, this would submit to /create-invoice
    showAlert({
      message: "สร้างใบแจ้งหนี้สำเร็จ! (ตัวอย่าง)",
      type: "success",
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Calculator className="text-blue-600" />
        บันทึกค่ามิเตอร์
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-xl font-semibold mb-4">กรอกข้อมูลมิเตอร์</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                เลือกห้อง
              </label>
              {loadingRooms ? (
                <div className="w-full p-2 border border-slate-300 rounded-md bg-slate-50 text-slate-400">
                  กำลังโหลดข้อมูลห้อง...
                </div>
              ) : (
                <select
                  value={roomId}
                  onChange={(e) => {
                    setRoomId(e.target.value);
                    setCurrentWater("");
                    setCurrentElec("");
                    setCalculation(null);
                  }}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                >
                  <option value="">-- เลือกห้อง --</option>
                  {rooms.map((room) => (
                    <option key={room.room_id} value={room.room_id}>
                      ห้อง {room.room_number} - {room.building_name} (ชั้น{" "}
                      {room.floor})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Meter Reading Inputs - 4 fields in 2x2 grid */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Previous Water Reading */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    มิเตอร์น้ำครั้งก่อน
                  </label>
                  <input
                    type="number"
                    value={calculation?.prev_readings.water || ""}
                    className="w-full p-2 border border-slate-300 rounded-md bg-slate-100 text-slate-600 cursor-not-allowed"
                    placeholder="0"
                    disabled
                    readOnly
                  />
                </div>

                {/* Current Water Reading */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    มิเตอร์น้ำปัจจุบัน
                  </label>
                  <input
                    type="number"
                    value={currentWater}
                    onChange={(e) => setCurrentWater(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="0"
                    min="0"
                    step="0.01"
                    required
                    disabled={!roomId}
                  />
                </div>

                {/* Previous Electricity Reading */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    มิเตอร์ไฟครั้งก่อน
                  </label>
                  <input
                    type="number"
                    value={calculation?.prev_readings.elec || ""}
                    className="w-full p-2 border border-slate-300 rounded-md bg-slate-100 text-slate-600 cursor-not-allowed"
                    placeholder="0"
                    disabled
                    readOnly
                  />
                </div>

                {/* Current Electricity Reading */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    มิเตอร์ไฟปัจจุบัน
                  </label>
                  <input
                    type="number"
                    value={currentElec}
                    onChange={(e) => setCurrentElec(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="0"
                    min="0"
                    step="0.01"
                    required
                    disabled={!roomId}
                  />
                </div>
              </div>
            </div>

            {/* Display usage calculation */}
            {calculation && currentWater && currentElec && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 space-y-2">
                <div className="text-emerald-800 font-medium text-sm">
                  การใช้งานในเดือนนี้
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white p-2 rounded">
                    <div className="text-slate-500 text-xs">น้ำ</div>
                    <div className="font-mono font-semibold text-blue-700">
                      {calculation.usage.water} หน่วย
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      ({currentWater} - {calculation.prev_readings.water})
                    </div>
                  </div>
                  <div className="bg-white p-2 rounded">
                    <div className="text-slate-500 text-xs">ไฟ</div>
                    <div className="font-mono font-semibold text-amber-700">
                      {calculation.usage.elec} หน่วย
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      ({currentElec} - {calculation.prev_readings.elec})
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={!calculation}
              className="w-full mt-6 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              สร้างใบแจ้งหนี้
            </button>
          </form>
        </div>

        {/* Live Calculation Preview */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <h3 className="text-xl font-semibold mb-4">ตัวอย่างใบแจ้งหนี้</h3>

          {loading ? (
            <p className="text-slate-500 animate-pulse">กำลังคำนวณ...</p>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center text-red-500 p-4 bg-red-50 rounded-lg border border-red-100">
              <p className="font-medium">การคำนวณล้มเหลว</p>
              <p className="text-sm">{error}</p>
            </div>
          ) : calculation ? (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-500">น้ำครั้งก่อน</span>
                  <span className="font-mono">
                    {calculation.prev_readings.water}
                  </span>
                </div>
                <div className="flex justify-between text-sm border-b pb-2 mb-2">
                  <span className="text-slate-500">น้ำครั้งนี้</span>
                  <span className="font-mono">{currentWater}</span>
                </div>
                <div className="flex justify-between font-medium text-blue-700">
                  <span>
                    หน่วยที่ใช้ ({calculation.usage.water} x{" "}
                    {calculation.rates.water})
                  </span>
                  <span>{Number(calculation.costs.water).toFixed(2)} ฿</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-500">ไฟครั้งก่อน</span>
                  <span className="font-mono">
                    {calculation.prev_readings.elec}
                  </span>
                </div>
                <div className="flex justify-between text-sm border-b pb-2 mb-2">
                  <span className="text-slate-500">ไฟครั้งนี้</span>
                  <span className="font-mono">{currentElec}</span>
                </div>
                <div className="flex justify-between font-medium text-amber-700">
                  <span>
                    หน่วยที่ใช้ ({calculation.usage.elec} x{" "}
                    {calculation.rates.elec})
                  </span>
                  <span>{Number(calculation.costs.elec).toFixed(2)} ฿</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">ค่าเช่าห้อง</span>
                  <span className="font-mono">
                    {Number(calculation.costs.rent).toFixed(2)} ฿
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-300">
                <span className="text-lg font-bold text-slate-800">
                  ยอดรวมทั้งหมด
                </span>
                <span className="text-2xl font-bold text-green-600">
                  {Number(calculation.total_amount).toFixed(2)} ฿
                </span>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <Calculator size={48} className="mb-2 opacity-20" />
              <p>กรอกข้อมูลเพื่อดูยอดชำระ</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeterReadingForm;
