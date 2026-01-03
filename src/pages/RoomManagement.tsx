import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import Dialog from "../components/Dialog";
import roomService, {
  type Room,
  type CreateRoomData,
} from "../services/roomService";
import tenantService, { type Tenant } from "../services/tenantService";
import { useAlert } from "../hooks/useAlert";
import Pagination from "../components/Pagination";

export default function RoomManagement() {
  const { showAlert } = useAlert();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState<CreateRoomData>({
    house_number: "",
    bedrooms: 1,
    bathrooms: 1,
    base_rent: 0,
    status: "vacant",
    current_tenant_id: null,
    water_rate: 18.0,
    elec_rate: 7.0,
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [rooms.length]);

  useEffect(() => {
    fetchRooms();
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const data = await tenantService.getTenants();
      setTenants(data);
    } catch (error) {
      console.error("Error fetching tenants:", error);
    }
  };

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const data = await roomService.getRooms();
      setRooms(data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      showAlert({ message: "ไม่สามารถโหลดข้อมูลบ้านเช่าได้", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await roomService.updateRoom(editingId, formData);
        showAlert({ message: "อัพเดทข้อมูลห้องพักสำเร็จ", type: "success" });
      } else {
        await roomService.createRoom(formData);
        showAlert({ message: "เพิ่มห้องพักสำเร็จ", type: "success" });
      }
      handleCloseDialog();
      fetchRooms();
    } catch (error: any) {
      console.error("Error saving room:", error);
      const errorMessage =
        error.response?.data?.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล";
      showAlert({ message: errorMessage, type: "error" });
    }
  };

  const handleEdit = (room: Room) => {
    setEditingId(room.room_id);
    setFormData({
      house_number: room.house_number,
      bedrooms: room.bedrooms,
      bathrooms: room.bathrooms,
      base_rent: room.base_rent,
      status: room.status,
      current_tenant_id: room.current_tenant_id || null,
      water_rate: room.water_rate || 18.0,
      elec_rate: room.elec_rate || 7.0,
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: number) => {
    try {
      setIsDeleting(true);
      await roomService.deleteRoom(id);
      showAlert({ message: "ลบห้องพักสำเร็จ", type: "success" });
      setDeleteConfirmId(null);
      fetchRooms();
    } catch (error: any) {
      console.error("Error deleting room:", error);
      const errorMessage =
        error.response?.data?.error || "ไม่สามารถลบห้องพักได้";
      showAlert({ message: errorMessage, type: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingId(null);
    setFormData({
      house_number: "",
      bedrooms: 1,
      bathrooms: 1,
      base_rent: 0,
      status: "vacant",
      current_tenant_id: null,
      water_rate: 18.0,
      elec_rate: 7.0,
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      vacant: { label: "ว่าง", className: "bg-green-100 text-green-800" },
      occupied: { label: "มีผู้เช่า", className: "bg-blue-100 text-blue-800" },
      reserved: { label: "จอง", className: "bg-yellow-100 text-yellow-800" },
      maintenance: { label: "ซ่อมแซม", className: "bg-red-100 text-red-800" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.vacant;
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  // Calculate pagination
  const totalPages = Math.ceil(rooms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRooms = rooms.slice(startIndex, endIndex);

  if (loading) {
    return <div className="p-8">กำลังโหลด...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">จัดการบ้านเช่า</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowDialog(true)}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-md"
          >
            <Plus size={20} />
            เพิ่มบ้านเช่า
          </button>
        </div>
      </div>

      {/* Dialog for Create/Edit */}
      <Dialog
        isOpen={showDialog}
        onClose={handleCloseDialog}
        title={editingId ? "แก้ไขข้อมูลห้องพัก" : "เพิ่มห้องพักใหม่"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                บ้านเลขที่ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.house_number}
                onChange={(e) =>
                  setFormData({ ...formData, house_number: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="เช่น 123/45"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                จำนวนห้องนอน <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.bedrooms}
                onChange={(e) =>
                  setFormData({ ...formData, bedrooms: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                จำนวนห้องน้ำ <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.bathrooms}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bathrooms: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ค่าเช่า (บาท/เดือน) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.base_rent}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    base_rent: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ค่าน้ำ (บาท/หน่วย)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.water_rate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    water_rate: parseFloat(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ค่าไฟ (บาท/หน่วย)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.elec_rate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    elec_rate: parseFloat(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                สถานะ
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="vacant">ว่าง</option>
                <option value="occupied">มีผู้เช่า</option>
                <option value="reserved">จอง</option>
                <option value="maintenance">ซ่อมแซม</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ผู้เช่า
              </label>
              <select
                value={formData.current_tenant_id || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    current_tenant_id: e.target.value
                      ? Number(e.target.value)
                      : null,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">ไม่มีผู้เช่า</option>
                {tenants.map((tenant) => (
                  <option key={tenant.tenant_id} value={tenant.tenant_id}>
                    {tenant.full_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              {editingId ? "บันทึกการแก้ไข" : "เพิ่มบ้านเช่า"}
            </button>
            <button
              type="button"
              onClick={handleCloseDialog}
              className="flex-1 bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      </Dialog>

      {/* Rooms Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                บ้านเลขที่
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                เรท (น้ำ/ไฟ)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ห้องนอน
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ห้องน้ำ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ค่าเช่า (บาท/เดือน)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ผู้เช่าปัจจุบัน
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
            {rooms.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  ไม่พบข้อมูลบ้านเช่า
                </td>
              </tr>
            ) : (
              paginatedRooms.map((room) => (
                <tr key={room.room_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {room.house_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {room.water_rate}/{room.elec_rate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {room.bedrooms}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {room.bathrooms}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    ฿{Number(room.base_rent).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {room.tenant_name ? (
                      <div>
                        <div className="font-medium text-gray-900">
                          {room.tenant_name}
                        </div>
                        {room.tenant_phone && (
                          <div className="text-sm text-gray-500">
                            {room.tenant_phone}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(room.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(room)}
                      className="text-emerald-600 hover:text-emerald-900 mr-4"
                    >
                      แก้ไข
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(room.room_id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={rooms.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-4 max-w-xs w-full">
            <h3 className="text-base font-bold text-gray-800 mb-2">
              ยืนยันการลบ
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              คุณแน่ใจหรือไม่ที่จะลบบ้านเช่านี้?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 font-medium"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={isDeleting}
                className="px-3 py-1.5 text-sm text-red-600 border border-gray-300 rounded-md hover:bg-gray-50 font-medium"
              >
                ลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
