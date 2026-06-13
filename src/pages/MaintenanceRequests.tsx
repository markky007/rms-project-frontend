import { useState, useEffect } from "react";
import maintenanceService, {
  type MaintenanceRequest,
  type CreateMaintenanceRequestData,
} from "../services/maintenanceService";
import roomService, { type Room } from "../services/roomService";
import { useAlert } from "../hooks/useAlert";
import Pagination from "../components/Pagination";
import Dialog from "../components/Dialog";

export default function MaintenanceRequests() {
  const { showAlert } = useAlert();
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus]);

  useEffect(() => {
    fetchRequests();
    fetchRooms();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await maintenanceService.getMainstreamRequests ? await maintenanceService.getMainstreamRequests() : await maintenanceService.getMaintenanceRequests();
      setRequests(data);
    } catch (error) {
      console.error("Error fetching maintenance requests:", error);
      showAlert({
        message: "ไม่สามารถโหลดข้อมูลการแจ้งซ่อมได้",
        type: "error",
      });
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
      showAlert({ message: "สร้างรายการแจ้งซ่อมสำเร็จ", type: "success" });
      setShowForm(false);
      setFormData({ room_id: 0, title: "", description: "" });
      fetchRequests();
    } catch (error) {
      console.error("Error creating maintenance request:", error);
      showAlert({ message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล", type: "error" });
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
          showAlert({
            message: "กรุณาใส่ค่าใช้จ่ายที่ถูกต้อง",
            type: "warning",
          });
          return;
        }
      }

      await maintenanceService.updateMaintenanceStatus(id, status, cost);
      showAlert({ message: "อัปเดตสถานะสำเร็จ", type: "success" });
      fetchRequests();
    } catch (error) {
      console.error("Error updating status:", error);
      showAlert({ message: "ไม่สามารถอัปเดตสถานะได้", type: "error" });
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

  // Calculate pagination
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] font-sans">
        <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-xs text-muted mt-2">กำลังโหลดข้อมูลแจ้งซ่อม...</span>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 font-sans">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
        <h1 className="text-xl lg:text-3xl font-bold text-gray-800">รายการแจ้งซ่อม</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-emerald-600 text-white px-6 py-3 lg:py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-md touch-target w-full lg:w-auto"
          >
            + แจ้งซ่อมใหม่
          </button>
        )}
      </div>

      {/* Dialog for Create/Edit Form */}
      <Dialog
        isOpen={showForm}
        onClose={handleCancel}
        title="แจ้งซ่อมใหม่"
        size="md"
      >
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
                className="w-full px-3 py-3 lg:py-2 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base lg:text-sm"
              >
                <option value={0}>เลือกห้อง</option>
                {rooms.map((room) => (
                  <option key={room.room_id} value={room.room_id}>
                    บ้านเลขที่ {room.house_number}
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
                className="w-full px-3 py-3 lg:py-2 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base lg:text-sm"
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
                className="w-full px-3 py-3 lg:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base lg:text-sm"
                placeholder="รายละเอียดปัญหา"
                rows={3}
              />
            </div>
          </div>
          <div className="flex gap-2 pt-4 max-lg:flex-col">
            <button
              type="submit"
              className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors touch-target font-semibold text-sm"
            >
              แจ้งซ่อม
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors touch-target font-semibold text-sm"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      </Dialog>

      <div className="mb-4">
        <div className="flex gap-2 items-center select-none overflow-x-auto scrollbar-none flex-nowrap -mx-4 px-4 lg:mx-0 lg:px-0 lg:flex-wrap">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-1.5 rounded-full border text-xs font-semibold transition-all duration-150 cursor-pointer select-none touch-target flex-shrink-0 ${
              filterStatus === "all"
                ? "bg-primary text-white border-primary ring-2 ring-primary/20"
                : "bg-white text-ink border-border hover:bg-surface hover:border-border"
            }`}
          >
            ทั้งหมด
          </button>
          <button
            onClick={() => setFilterStatus("pending")}
            className={`px-4 py-1.5 rounded-full border text-xs font-semibold transition-all duration-150 cursor-pointer select-none touch-target flex-shrink-0 ${
              filterStatus === "pending"
                ? "bg-warning text-white border-warning ring-2 ring-warning/20"
                : "bg-white text-ink border-border hover:bg-surface hover:border-border"
            }`}
          >
            รอดำเนินการ
          </button>
          <button
            onClick={() => setFilterStatus("in_progress")}
            className={`px-4 py-1.5 rounded-full border text-xs font-semibold transition-all duration-150 cursor-pointer select-none touch-target flex-shrink-0 ${
              filterStatus === "in_progress"
                ? "bg-info text-white border-info ring-2 ring-info/20"
                : "bg-white text-ink border-border hover:bg-surface hover:border-border"
            }`}
          >
            กำลังดำเนินการ
          </button>
          <button
            onClick={() => setFilterStatus("completed")}
            className={`px-4 py-1.5 rounded-full border text-xs font-semibold transition-all duration-150 cursor-pointer select-none touch-target flex-shrink-0 ${
              filterStatus === "completed"
                ? "bg-success text-white border-success ring-2 ring-success/20"
                : "bg-white text-ink border-border hover:bg-surface hover:border-border"
            }`}
          >
            เสร็จสิ้น
          </button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-lg border border-border shadow-medium overflow-hidden">
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
            {paginatedRequests.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  ไม่พบข้อมูลการแจ้งซ่อม
                </td>
              </tr>
            ) : (
              paginatedRequests.map((request) => {
                const room = rooms.find((r) => r.room_id === request.room_id);
                const houseNumberLabel = room ? `บ้านเลขที่ ${room.house_number}` : `Room #${request.room_id}`;
                return (
                  <tr key={request.request_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {houseNumberLabel}
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
                      <div className="flex justify-end gap-2">
                        {request.status === "pending" && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(request.request_id, "in_progress")
                            }
                            className="h-8 px-3.5 text-xs font-medium rounded-full bg-surface text-ink hover:bg-primary hover:text-white transition-all duration-150 inline-flex items-center justify-center gap-1 cursor-pointer"
                          >
                            เริ่มดำเนินการ
                          </button>
                        )}
                        {request.status === "in_progress" && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(request.request_id, "completed")
                            }
                            className="h-8 px-3.5 text-xs font-medium rounded-full bg-success-light text-success hover:bg-success hover:text-white transition-all duration-150 inline-flex items-center justify-center gap-1 cursor-pointer"
                          >
                            ทำเสร็จแล้ว
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="lg:hidden flex flex-col gap-3">
        {paginatedRequests.length === 0 ? (
          <div className="py-8 text-center text-gray-500 bg-white rounded-lg border border-border-subtle">
            ไม่พบข้อมูลการแจ้งซ่อม
          </div>
        ) : (
          paginatedRequests.map((request) => {
            const room = rooms.find((r) => r.room_id === request.room_id);
            const roomName = room ? `ห้อง ${room.house_number}` : `Room #${request.room_id}`;
            return (
              <div key={request.request_id} className="mobile-card flex flex-col gap-3 animate-in fade-in duration-150">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="font-bold text-ink text-base select-all">{request.title}</span>
                    <span className="text-[10px] text-muted font-sans mt-0.5 select-all">
                      {roomName} · แจ้งเมื่อ: {new Date(request.reported_date).toLocaleDateString("th-TH")}
                    </span>
                  </div>
                  {getStatusBadge(request.status)}
                </div>

                <div className="flex flex-col gap-1.5 text-xs text-gray-700 py-2 bg-surface rounded px-3 select-all">
                  <div>📝 รายละเอียด: {request.description || "-"}</div>
                  <div className="border-t border-border-subtle/50 pt-1 mt-1 font-semibold flex justify-between select-none">
                    <span>ค่าใช้จ่าย:</span>
                    <span className={Number(request.cost) > 0 ? "text-error font-mono font-bold" : "text-muted italic"}>
                      {Number(request.cost) > 0 ? `฿${Number(request.cost).toLocaleString()}` : "ยังไม่ระบุ"}
                    </span>
                  </div>
                </div>

                {/* Action bar */}
                <div className="flex gap-2 pt-2 border-t border-border-subtle">
                  {request.status === "pending" && (
                    <button
                      onClick={() => handleStatusUpdate(request.request_id, "in_progress")}
                      className="flex-grow min-h-[44px] rounded-lg bg-primary text-white active:bg-primary-hover font-medium text-sm flex items-center justify-center cursor-pointer gap-1.5"
                    >
                      🔧 เริ่มดำเนินการ
                    </button>
                  )}
                  {request.status === "in_progress" && (
                    <button
                      onClick={() => handleStatusUpdate(request.request_id, "completed")}
                      className="flex-grow min-h-[44px] rounded-lg bg-success text-white active:bg-success-hover font-medium text-sm flex items-center justify-center cursor-pointer gap-1.5"
                    >
                      ✅ ทำเสร็จแล้ว
                    </button>
                  )}
                  {request.status === "completed" && (
                    <div className="flex-1 text-center py-2.5 text-xs text-muted font-sans font-medium bg-surface rounded border border-border-subtle/50 select-none">
                      ซ่อมแซมเสร็จสิ้นแล้ว
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredRequests.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
