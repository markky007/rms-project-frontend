import { useState, useEffect } from "react";
import maintenanceService, {
  type MaintenanceRequest,
  type CreateMaintenanceRequestData,
} from "../services/maintenanceService";
import roomService, { type Room } from "../services/roomService";

export default function MaintenanceRequests() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "in_progress" | "completed"
  >("all");
  const [formData, setFormData] = useState<CreateMaintenanceRequestData>({
    room_id: 0,
    title: "",
    description: "",
  });

  useEffect(() => {
    fetchRequests();
    fetchRooms();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await maintenanceService.getMaintenanceRequests();
      setRequests(data);
    } catch (error) {
      console.error("Error fetching maintenance requests:", error);
      alert("ไม่สามารถโหลดข้อมูลการแจ้งซ่อมได้");
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const data = await roomService.getRooms();
      setRooms(data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await maintenanceService.createMaintenanceRequest(formData);
      alert("สร้างรายการแจ้งซ่อมสำเร็จ");
      setShowForm(false);
      setFormData({ room_id: 0, title: "", description: "" });
      fetchRequests();
    } catch (error) {
      console.error("Error creating maintenance request:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  const handleStatusUpdate = async (
    id: number,
    status: "pending" | "in_progress" | "completed"
  ) => {
    try {
      let cost: number | undefined;
      if (status === "completed") {
        const costStr = prompt("กรุณาใส่ค่าใช้จ่ายในการซ่อม (บาท):");
        if (costStr === null) return; // User cancelled
        cost = parseFloat(costStr);
        if (isNaN(cost) || cost < 0) {
          alert("กรุณาใส่ค่าใช้จ่ายที่ถูกต้อง");
          return;
        }
      }

      await maintenanceService.updateMaintenanceStatus(id, status, cost);
      alert("อัพเดทสถานะสำเร็จ");
      fetchRequests();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("ไม่สามารถอัพเดทสถานะได้");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({ room_id: 0, title: "", description: "" });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
            รอดำเนินการ
          </span>
        );
      case "in_progress":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            กำลังดำเนินการ
          </span>
        );
      case "completed":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            เสร็จสิ้น
          </span>
        );
      default:
        return null;
    }
  };

  const filteredRequests = requests.filter((request) => {
    if (filterStatus === "all") return true;
    return request.status === filterStatus;
  });

  if (loading) {
    return <div className="p-8">กำลังโหลด...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">รายการแจ้งซ่อม</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            + แจ้งซ่อมใหม่
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">แจ้งซ่อมใหม่</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ห้อง <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.room_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      room_id: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={0}>เลือกห้อง</option>
                  {rooms.map((room) => (
                    <option key={room.room_id} value={room.room_id}>
                      ห้อง {room.room_number} (ชั้น {room.floor})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  หัวข้อ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="เช่น ท่อน้ำรั่ว"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  รายละเอียด
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="รายละเอียดปัญหา"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                แจ้งซ่อม
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                ยกเลิก
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2 rounded-lg ${
              filterStatus === "all"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            ทั้งหมด
          </button>
          <button
            onClick={() => setFilterStatus("pending")}
            className={`px-4 py-2 rounded-lg ${
              filterStatus === "pending"
                ? "bg-yellow-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            รอดำเนินการ
          </button>
          <button
            onClick={() => setFilterStatus("in_progress")}
            className={`px-4 py-2 rounded-lg ${
              filterStatus === "in_progress"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            กำลังดำเนินการ
          </button>
          <button
            onClick={() => setFilterStatus("completed")}
            className={`px-4 py-2 rounded-lg ${
              filterStatus === "completed"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            เสร็จสิ้น
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ห้อง
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                หัวข้อ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                รายละเอียด
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                วันที่แจ้ง
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ค่าใช้จ่าย
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                สถานะ
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                จัดการ
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  ไม่พบข้อมูลการแจ้งซ่อม
                </td>
              </tr>
            ) : (
              filteredRequests.map((request) => (
                <tr key={request.request_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    Room #{request.room_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {request.title}
                  </td>
                  <td className="px-6 py-4 text-gray-700 max-w-xs truncate">
                    {request.description || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {new Date(request.reported_date).toLocaleDateString(
                      "th-TH"
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {Number(request.cost) > 0
                      ? `฿${Number(request.cost).toLocaleString()}`
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(request.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {request.status === "pending" && (
                      <button
                        onClick={() =>
                          handleStatusUpdate(request.request_id, "in_progress")
                        }
                        className="text-blue-600 hover:text-blue-900 mr-2"
                      >
                        เริ่มดำเนินการ
                      </button>
                    )}
                    {request.status === "in_progress" && (
                      <button
                        onClick={() =>
                          handleStatusUpdate(request.request_id, "completed")
                        }
                        className="text-green-600 hover:text-green-900"
                      >
                        ทำเสร็จแล้ว
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
