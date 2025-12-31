import React, { useState, useEffect } from "react";
import axios from "axios";
import { Calculator, Save } from "lucide-react";

const MeterReadingForm = () => {
  const [roomId, setRoomId] = useState("");
  const [currentWater, setCurrentWater] = useState("");
  const [currentElec, setCurrentElec] = useState("");
  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Debounced calculation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (roomId && currentWater && currentElec) {
        handleCalculate();
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
    alert("Invoice Created! (Mock)");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Calculator className="text-blue-600" />
        Utility Meter Entry
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-xl font-semibold mb-4">บันทึกค่ามิเตอร์</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                หมายเลขห้อง
              </label>
              <input
                type="number"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="ระบุหมายเลขห้อง"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  เลขมิเตอร์น้ำ
                </label>
                <input
                  type="number"
                  value={currentWater}
                  onChange={(e) => setCurrentWater(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  เลขมิเตอร์ไฟ
                </label>
                <input
                  type="number"
                  value={currentElec}
                  onChange={(e) => setCurrentElec(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

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

              <div className="flex justify-between items-center pt-4 border-t border-slate-300">
                <span className="text-lg font-bold text-slate-800">
                  ยอดรวมโดยประมาณ
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
