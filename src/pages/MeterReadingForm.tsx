import React, { useState, useEffect } from "react";
import axios from "axios";
import { Calculator, Save, Building2 } from "lucide-react";
import { useAlert } from "../hooks/useAlert";

interface Room {
  room_id: number;
  house_number: string;
  base_rent: number | string;
  water_rate: number | string;
  elec_rate: number | string;
  previous_water_reading: number | null;
  previous_elec_reading: number | null;
  current_contract_id?: number;
}

interface PreviousReadings {
  water: number;
  elec: number;
}

interface Usage {
  water: number;
  elec: number;
}

interface Rates {
  water: number;
  elec: number;
}

interface Costs {
  water: number;
  elec: number;
  rent: number;
}

interface Calculation {
  prev_readings: PreviousReadings;
  usage: Usage;
  rates: Rates;
  costs: Costs;
  total_amount: number;
}

const MeterReadingForm: React.FC = () => {
  const { showAlert } = useAlert();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomId, setRoomId] = useState<string>("");
  const [currentWater, setCurrentWater] = useState<string>("");
  const [currentElec, setCurrentElec] = useState<string>("");

  const [prevReadings, setPrevReadings] = useState<PreviousReadings | null>(
    null
  );
  const [calculation, setCalculation] = useState<Calculation | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingRooms, setLoadingRooms] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all rooms on component mount
  useEffect(() => {
    const fetchRooms = async (): Promise<void> => {
      try {
        const response = await axios.get<Room[]>(
          "http://localhost:3000/api/rooms"
        );
        setRooms(response.data);
      } catch (error) {
        console.error("Failed to fetch rooms", error);
        showAlert({ message: "ไม่สามารถโหลดข้อมูลห้องได้", type: "error" });
      } finally {
        setLoadingRooms(false);
      }
    };

    fetchRooms();
  }, [showAlert]);

  // Fetch previous readings when room changes
  useEffect(() => {
    const fetchPreviousReadings = async () => {
      if (!roomId) {
        setPrevReadings(null);
        return;
      }

      try {
        const response = await axios.get<PreviousReadings>(
          `http://localhost:3000/api/billing/latest-reading/${roomId}`
        );
        setPrevReadings(response.data);
      } catch (error) {
        console.error("Failed to fetch previous readings", error);
        // Don't show alert here to avoid annoying popups if just browsing
      }
    };

    fetchPreviousReadings();
  }, [roomId]);

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

  const handleCalculate = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post<Calculation>(
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
      if (axios.isAxiosError(error) && error.response) {
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

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    if (!roomId || !currentWater || !currentElec) {
      showAlert({ message: "กรุณากรอกข้อมูลให้ครบถ้วน", type: "error" });
      return;
    }

    const selectedRoom = rooms.find((r) => r.room_id === Number(roomId));
    if (!selectedRoom?.current_contract_id) {
      showAlert({
        message:
          "ห้องนี้ไม่มีสัญญาเช่าที่ใช้งานอยู่ ไม่สามารถสร้างใบแจ้งหนี้ได้",
        type: "error",
      });
      return;
    }

    // Get current user from localStorage
    const savedUser = localStorage.getItem("user");
    const user = savedUser ? JSON.parse(savedUser) : null;

    if (!user || !user.user_id) {
      showAlert({
        message: "ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่",
        type: "error",
      });
      return;
    }

    try {
      setLoading(true);
      await axios.post("http://localhost:3000/api/billing/create-invoice", {
        contract_id: selectedRoom.current_contract_id,
        room_id: roomId,
        month_year: new Date().toISOString().slice(0, 7),
        water_reading: Number(currentWater),
        elec_reading: Number(currentElec),
        recorded_by: user.user_id,
      });

      showAlert({
        message: "บันทึกค่ามิเตอร์และสร้างใบแจ้งหนี้สำเร็จ!",
        type: "success",
      });

      // Reset form
      setRoomId("");
      setCurrentWater("");
      setCurrentElec("");
      setCalculation(null);
    } catch (error: any) {
      console.error("Details:", error);
      const msg = error.response?.data?.error || "เกิดข้อผิดพลาดในการบันทึก";
      showAlert({ message: msg, type: "error" });
    } finally {
      setLoading(false);
    }
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
                    setPrevReadings(null);
                  }}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                >
                  <option value="">-- เลือกห้อง --</option>
                  {rooms.map((room) => (
                    <option key={room.room_id} value={room.room_id}>
                      บ้านเลขที่ {room.house_number}
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
                    value={prevReadings?.water ?? ""}
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
                    value={prevReadings?.elec ?? ""}
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
