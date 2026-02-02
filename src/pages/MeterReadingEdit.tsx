import React, { useState, useEffect } from "react";
import api from "../services/api";
import { Edit, Search, Calendar, Save, X } from "lucide-react";
import { useAlert } from "../hooks/useAlert";

// Thai month names
const THAI_MONTHS = [
  { value: "01", label: "มกราคม" },
  { value: "02", label: "กุมภาพันธ์" },
  { value: "03", label: "มีนาคม" },
  { value: "04", label: "เมษายน" },
  { value: "05", label: "พฤษภาคม" },
  { value: "06", label: "มิถุนายน" },
  { value: "07", label: "กรกฎาคม" },
  { value: "08", label: "สิงหาคม" },
  { value: "09", label: "กันยายน" },
  { value: "10", label: "ตุลาคม" },
  { value: "11", label: "พฤศจิกายน" },
  { value: "12", label: "ธันวาคม" },
];

// Generate years (3 years back to current year)
const generateYears = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear - 2; i <= currentYear; i++) {
    years.push({ value: String(i), label: String(i + 543) });
  }
  return years;
};

const YEARS = generateYears();

interface Room {
  room_id: number;
  house_number: string;
}

interface MeterReading {
  reading_id: number;
  room_id: number;
  house_number: string;
  month_year: string;
  prev_water_reading: number;
  water_reading: number;
  prev_elec_reading: number;
  elec_reading: number;
  reading_date: string;
  water_rate: number;
  elec_rate: number;
  base_rent: number;
}

interface EditFormData {
  water_reading: string;
  elec_reading: string;
}

const MeterReadingEdit: React.FC = () => {
  const { showAlert } = useAlert();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [meterReadings, setMeterReadings] = useState<MeterReading[]>([]);
  const [filteredReadings, setFilteredReadings] = useState<MeterReading[]>([]);

  // Search filters
  const currentDate = new Date();
  const [filterRoomId, setFilterRoomId] = useState<string>("");
  const [filterMonth, setFilterMonth] = useState<string>(
    String(currentDate.getMonth() + 1).padStart(2, "0"),
  );
  const [filterYear, setFilterYear] = useState<string>(
    String(currentDate.getFullYear()),
  );

  // Edit modal
  const [editingReading, setEditingReading] = useState<MeterReading | null>(
    null,
  );
  const [editForm, setEditForm] = useState<EditFormData>({
    water_reading: "",
    elec_reading: "",
  });
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch rooms
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await api.get<Room[]>("/rooms");
        setRooms(response.data);
      } catch (error) {
        console.error("Failed to fetch rooms", error);
        showAlert({ message: "ไม่สามารถโหลดข้อมูลห้องได้", type: "error" });
      }
    };
    fetchRooms();
  }, [showAlert]);

  // Fetch meter readings
  const fetchMeterReadings = async () => {
    try {
      setLoading(true);
      // Fetch all invoices with meter readings
      const response = await api.get("/billing");
      const invoices = response.data;

      // Get meter readings for each invoice
      const readingsPromises = invoices.map(async (invoice: any) => {
        try {
          const detailResponse = await api.get(
            `/billing/${invoice.invoice_id}`,
          );
          const detail = detailResponse.data;

          // Map the response to MeterReading interface
          if (detail.reading_id) {
            return {
              reading_id: detail.reading_id,
              room_id: detail.room_id,
              house_number: detail.house_number,
              month_year: detail.month_year,
              prev_water_reading: detail.prev_water_reading || 0,
              water_reading: detail.current_water_reading || 0,
              prev_elec_reading: detail.prev_elec_reading || 0,
              elec_reading: detail.current_elec_reading || 0,
              reading_date: detail.issue_date,
              water_rate: detail.water_rate || 0,
              elec_rate: detail.elec_rate || 0,
              base_rent: detail.base_rent || 0,
            };
          }
          return null;
        } catch (err) {
          console.error("Error fetching invoice detail:", err);
          return null;
        }
      });

      const invoiceDetails = await Promise.all(readingsPromises);
      const validReadings = invoiceDetails.filter(
        (detail): detail is MeterReading => detail !== null,
      );

      setMeterReadings(validReadings);
      setFilteredReadings(validReadings);
    } catch (error) {
      console.error("Failed to fetch meter readings", error);
      showAlert({
        message: "ไม่สามารถโหลดข้อมูลมิเตอร์ได้",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeterReadings();
  }, []);

  // Filter readings
  useEffect(() => {
    let filtered = meterReadings;

    if (filterRoomId) {
      filtered = filtered.filter((r) => r.room_id === Number(filterRoomId));
    }

    if (filterMonth && filterYear) {
      const monthYear = `${filterYear}-${filterMonth}`;
      filtered = filtered.filter((r) => r.month_year === monthYear);
    }

    setFilteredReadings(filtered);
  }, [filterRoomId, filterMonth, filterYear, meterReadings]);

  const openEditModal = (reading: MeterReading) => {
    setEditingReading(reading);
    setEditForm({
      water_reading: String(reading.water_reading),
      elec_reading: String(reading.elec_reading),
    });
  };

  const closeEditModal = () => {
    setEditingReading(null);
    setEditForm({ water_reading: "", elec_reading: "" });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingReading) return;

    const waterReading = Number(editForm.water_reading);
    const elecReading = Number(editForm.elec_reading);

    // Validation
    if (waterReading < editingReading.prev_water_reading) {
      showAlert({
        message: `มิเตอร์น้ำไม่สามารถน้อยกว่าครั้งก่อน (${editingReading.prev_water_reading})`,
        type: "error",
      });
      return;
    }

    if (elecReading < editingReading.prev_elec_reading) {
      showAlert({
        message: `มิเตอร์ไฟไม่สามารถน้อยกว่าครั้งก่อน (${editingReading.prev_elec_reading})`,
        type: "error",
      });
      return;
    }

    // Get current user
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
      await api.patch(`/billing/meter-reading/${editingReading.reading_id}`, {
        water_reading: waterReading,
        elec_reading: elecReading,
        recorded_by: user.user_id,
      });

      showAlert({
        message: "อัปเดตค่ามิเตอร์สำเร็จ!",
        type: "success",
      });

      closeEditModal();
      fetchMeterReadings(); // Refresh the list
    } catch (error: any) {
      console.error("Update error:", error);
      const msg = error.response?.data?.error || "เกิดข้อผิดพลาดในการอัปเดต";
      showAlert({ message: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Calculate preview
  const calculatePreview = () => {
    if (!editingReading) return null;

    const waterReading = Number(editForm.water_reading) || 0;
    const elecReading = Number(editForm.elec_reading) || 0;

    const waterUsage = waterReading - editingReading.prev_water_reading;
    const elecUsage = elecReading - editingReading.prev_elec_reading;

    const waterCost = waterUsage * editingReading.water_rate;
    const elecCost = elecUsage * editingReading.elec_rate;
    const totalAmount = waterCost + elecCost + editingReading.base_rent;

    return {
      waterUsage,
      elecUsage,
      waterCost,
      elecCost,
      totalAmount,
    };
  };

  const preview = calculatePreview();

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Edit className="text-blue-600" />
        แก้ไขค่ามิเตอร์
      </h2>

      {/* Search/Filter Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Search size={20} className="text-slate-600" />
          ค้นหาและกรอง
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              เลือกห้อง
            </label>
            <select
              value={filterRoomId}
              onChange={(e) => setFilterRoomId(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">ทั้งหมด</option>
              {rooms.map((room) => (
                <option key={room.room_id} value={room.room_id}>
                  บ้านเลขที่ {room.house_number}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              เดือน
            </label>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {THAI_MONTHS.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              ปี
            </label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {YEARS.map((year) => (
                <option key={year.value} value={year.value}>
                  พ.ศ. {year.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Readings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                  บ้านเลขที่
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                  เดือน/ปี
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                  มิเตอร์น้ำ
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                  มิเตอร์ไฟ
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                  วันที่บันทึก
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    กำลังโหลดข้อมูล...
                  </td>
                </tr>
              ) : filteredReadings.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    ไม่พบข้อมูลมิเตอร์
                  </td>
                </tr>
              ) : (
                filteredReadings.map((reading) => (
                  <tr
                    key={reading.reading_id}
                    className="hover:bg-slate-50 transition"
                  >
                    <td className="px-4 py-3 text-sm">
                      {reading.house_number}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {
                        THAI_MONTHS.find(
                          (m) => m.value === reading.month_year.split("-")[1],
                        )?.label
                      }{" "}
                      {Number(reading.month_year.split("-")[0]) + 543}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-mono">
                      {reading.prev_water_reading} → {reading.water_reading}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-mono">
                      {reading.prev_elec_reading} → {reading.elec_reading}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(reading.reading_date).toLocaleDateString(
                        "th-TH",
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => openEditModal(reading)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition"
                      >
                        <Edit size={14} />
                        แก้ไข
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingReading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">
                แก้ไขค่ามิเตอร์ - บ้านเลขที่ {editingReading.house_number}
              </h3>
              <button
                onClick={closeEditModal}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6">
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 text-blue-800 font-medium mb-2">
                  <Calendar size={16} />
                  {
                    THAI_MONTHS.find(
                      (m) =>
                        m.value === editingReading.month_year.split("-")[1],
                    )?.label
                  }{" "}
                  พ.ศ. {Number(editingReading.month_year.split("-")[0]) + 543}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Water Reading */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    มิเตอร์น้ำครั้งก่อน
                  </label>
                  <input
                    type="number"
                    value={editingReading.prev_water_reading}
                    className="w-full p-2 border border-slate-300 rounded-md bg-slate-100 cursor-not-allowed"
                    disabled
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    มิเตอร์น้ำปัจจุบัน *
                  </label>
                  <input
                    type="number"
                    value={editForm.water_reading}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        water_reading: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    min={editingReading.prev_water_reading}
                    step="0.01"
                    required
                  />
                </div>

                {/* Electricity Reading */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    มิเตอร์ไฟครั้งก่อน
                  </label>
                  <input
                    type="number"
                    value={editingReading.prev_elec_reading}
                    className="w-full p-2 border border-slate-300 rounded-md bg-slate-100 cursor-not-allowed"
                    disabled
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    มิเตอร์ไฟปัจจุบัน *
                  </label>
                  <input
                    type="number"
                    value={editForm.elec_reading}
                    onChange={(e) =>
                      setEditForm({ ...editForm, elec_reading: e.target.value })
                    }
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    min={editingReading.prev_elec_reading}
                    step="0.01"
                    required
                  />
                </div>
              </div>

              {/* Preview Calculation */}
              {preview && (
                <div className="bg-slate-50 p-4 rounded-lg mb-4">
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">
                    ตัวอย่างยอดใหม่
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">
                        น้ำ ({preview.waterUsage} หน่วย ×{" "}
                        {editingReading.water_rate})
                      </span>
                      <span className="font-mono font-semibold text-blue-700">
                        {preview.waterCost.toFixed(2)} ฿
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">
                        ไฟ ({preview.elecUsage} หน่วย ×{" "}
                        {editingReading.elec_rate})
                      </span>
                      <span className="font-mono font-semibold text-amber-700">
                        {preview.elecCost.toFixed(2)} ฿
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">ค่าเช่า</span>
                      <span className="font-mono font-semibold">
                        {editingReading.base_rent.toFixed(2)} ฿
                      </span>
                    </div>
                    <div className="border-t border-slate-300 pt-2 mt-2">
                      <div className="flex justify-between font-bold">
                        <span className="text-slate-800">ยอดรวม</span>
                        <span className="text-green-600 text-lg">
                          {preview.totalAmount.toFixed(2)} ฿
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={18} />
                  บันทึกการเปลี่ยนแปลง
                </button>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 bg-slate-200 text-slate-700 py-2 px-4 rounded-lg hover:bg-slate-300 transition"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeterReadingEdit;
