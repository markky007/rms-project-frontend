import { useState, useEffect } from "react";
import { Eye, Trash2 } from "lucide-react";
import Dialog from "../components/Dialog";
import contractService, {
  type Contract,
  type CreateContractData,
} from "../services/contractService";
import roomService, { type Room } from "../services/roomService";
import tenantService, { type Tenant } from "../services/tenantService";
import { useAlert } from "../hooks/useAlert";
import Pagination from "../components/Pagination";

export default function ContractManagement() {
  const { showAlert } = useAlert();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(
    null
  );
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [formData, setFormData] = useState<CreateContractData>({
    room_id: 0,
    tenant_id: 0,
    start_date: "",
    end_date: "",
    deposit: 0,
    rent_amount: 0,
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus]);

  useEffect(() => {
    fetchContracts();
    fetchRooms();
    fetchTenants();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const data = await contractService.getContracts();
      setContracts(data);
    } catch (error) {
      console.error("Error fetching contracts:", error);
      showAlert({ message: "ไม่สามารถโหลดข้อมูลสัญญาได้", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const data = await roomService.getRooms();
      setRooms(
        data.filter((r) => r.status === "vacant" || r.status === "reserved")
      );
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const fetchTenants = async () => {
    try {
      const data = await tenantService.getTenants();
      setTenants(data);
    } catch (error) {
      console.error("Error fetching tenants:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await contractService.updateContract(editingId, formData);
        showAlert({ message: "อัปเดตสัญญาสำเร็จ", type: "success" });
      } else {
        await contractService.createContract(formData);
        showAlert({ message: "สร้างสัญญาสำเร็จ", type: "success" });
      }
      setShowForm(false);
      setEditingId(null);
      resetForm();
      fetchContracts();
      fetchRooms();
    } catch (error) {
      console.error("Error saving contract:", error);
      showAlert({ message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล", type: "error" });
    }
  };

  const handleTerminate = async (id: number) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะยกเลิกสัญญานี้?")) {
      return;
    }
    try {
      await contractService.terminateContract(id);
      showAlert({ message: "ยกเลิกสัญญาเช่าสำเร็จ", type: "success" });
      fetchContracts();
      fetchRooms();
    } catch (error) {
      console.error("Error terminating contract:", error);
      showAlert({ message: "ไม่สามารถยกเลิกสัญญาได้", type: "error" });
    }
  };

  const handleDelete = async (id: number) => {
    if (
      !confirm(
        "คุณแน่ใจหรือไม่ที่จะลบข้อมูลสัญญานี้? การกระทำนี้ไม่สามารถกู้คืนได้"
      )
    ) {
      return;
    }
    try {
      await contractService.deleteContract(id);
      showAlert({ message: "ลบสัญญาสำเร็จ", type: "success" });
      fetchContracts();
      fetchRooms();
    } catch (error) {
      console.error("Error deleting contract:", error);
      showAlert({ message: "ไม่สามารถลบสัญญาได้", type: "error" });
    }
  };

  const handleViewDetails = (contract: Contract) => {
    setSelectedContract(contract);
    setShowDetails(true);
  };

  const resetForm = () => {
    setFormData({
      room_id: 0,
      tenant_id: 0,
      start_date: "",
      end_date: "",
      deposit: 0,
      rent_amount: 0,
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    resetForm();
  };

  const filteredContracts = contracts.filter((contract) => {
    if (filterStatus === "active") return contract.is_active;
    if (filterStatus === "inactive") return !contract.is_active;
    return true;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedContracts = filteredContracts.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] font-sans">
        <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-xs text-muted mt-2">กำลังโหลดข้อมูลสัญญาเช่า...</span>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 font-sans">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
        <h1 className="text-xl lg:text-3xl font-bold text-gray-800">จัดการสัญญาเช่า</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-emerald-600 text-white px-6 py-3 lg:py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-md touch-target w-full lg:w-auto"
          >
            + สร้างสัญญาใหม่
          </button>
        )}
      </div>

      {/* Dialog for Create/Edit (instead of inline form) */}
      <Dialog
        isOpen={showForm}
        onClose={handleCancel}
        title={editingId ? "แก้ไขสัญญา" : "สร้างสัญญาใหม่"}
        size="lg"
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
                onChange={(e) => {
                  const roomId = parseInt(e.target.value);
                  const selectedRoom = rooms.find(
                    (r) => r.room_id === roomId
                  );
                  setFormData({
                    ...formData,
                    room_id: roomId,
                    rent_amount: selectedRoom ? selectedRoom.base_rent : 0,
                  });
                }}
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
                ผู้เช่า <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.tenant_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tenant_id: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-3 lg:py-2 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base lg:text-sm"
              >
                <option value={0}>เลือกผู้เช่า</option>
                {tenants.map((tenant) => (
                  <option key={tenant.tenant_id} value={tenant.tenant_id}>
                    {tenant.full_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                วันที่เริ่มสัญญา <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
                className="w-full px-3 py-3 lg:py-2 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base lg:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                วันที่สิ้นสุดสัญญา <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.end_date}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
                className="w-full px-3 py-3 lg:py-2 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base lg:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ค่ามัดจำ (บาท) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                step="0.01"
                value={formData.deposit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    deposit: parseFloat(e.target.value),
                  })
                }
                className="w-full px-3 py-3 lg:py-2 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base lg:text-sm"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ค่าเช่า (บาท/เดือน) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                step="0.01"
                value={formData.rent_amount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rent_amount: parseFloat(e.target.value),
                  })
                }
                className="w-full px-3 py-3 lg:py-2 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base lg:text-sm"
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-4 max-lg:flex-col">
            <button
              type="submit"
              className="flex-grow bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors touch-target font-semibold text-sm"
            >
              {editingId ? "บันทึกการแก้ไข" : "สร้างสัญญา"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-grow bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors touch-target font-semibold text-sm"
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
            onClick={() => setFilterStatus("active")}
            className={`px-4 py-1.5 rounded-full border text-xs font-semibold transition-all duration-150 cursor-pointer select-none touch-target flex-shrink-0 ${
              filterStatus === "active"
                ? "bg-success-light text-success border-success/30 ring-2 ring-success/20"
                : "bg-white text-ink border-border hover:bg-surface hover:border-border"
            }`}
          >
            ใช้งานอยู่
          </button>
          <button
            onClick={() => setFilterStatus("inactive")}
            className={`px-4 py-1.5 rounded-full border text-xs font-semibold transition-all duration-150 cursor-pointer select-none touch-target flex-shrink-0 ${
              filterStatus === "inactive"
                ? "bg-surface text-muted border-border/80 ring-2 ring-border/20"
                : "bg-white text-ink border-border hover:bg-surface hover:border-border"
            }`}
          >
            ยกเลิกแล้ว
          </button>
        </div>
      </div>

      {/* Contracts Table - Desktop */}
      <div className="hidden lg:block bg-white rounded-lg border border-border shadow-medium overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ห้อง
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ผู้เช่า
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                วันที่เริ่ม-สิ้นสุด
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ค่าเช่า/เดือน
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
            {paginatedContracts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  ไม่พบข้อมูลสัญญา
                </td>
              </tr>
            ) : (
              paginatedContracts.map((contract) => (
                <tr key={contract.contract_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    <span className="font-medium">
                      {contract.house_number
                        ? `บ้านเลขที่ ${contract.house_number}`
                        : `Room #${contract.room_id}`}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    <div>
                      <div className="font-medium">
                        {contract.tenant_name ||
                          `Tenant #${contract.tenant_id}`}
                      </div>
                      {contract.tenant_phone && (
                        <div className="text-sm text-gray-500">
                          {contract.tenant_phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {new Date(contract.start_date).toLocaleDateString("th-TH")}{" "}
                    - {new Date(contract.end_date).toLocaleDateString("th-TH")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    ฿{Number(contract.rent_amount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {contract.is_active ? (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        ใช้งานอยู่
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                        ยกเลิกแล้ว
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end items-center gap-2">
                      <button
                        onClick={() => handleViewDetails(contract)}
                        className="w-8 h-8 text-xs font-medium rounded-full bg-surface text-ink hover:bg-primary hover:text-white transition-all duration-150 inline-flex items-center justify-center cursor-pointer"
                        title="ดูรายละเอียด"
                      >
                        <Eye size={16} />
                      </button>
                      {contract.is_active && (
                        <button
                          onClick={() => handleTerminate(contract.contract_id)}
                          className="h-8 px-3.5 text-xs font-medium rounded-full bg-warning-light text-warning hover:bg-warning hover:text-white transition-all duration-150 inline-flex items-center justify-center gap-1 cursor-pointer"
                          title="ยกเลิกสัญญา"
                        >
                          ยกเลิก
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(contract.contract_id)}
                        className="w-8 h-8 text-xs font-medium rounded-full bg-error-light text-error hover:bg-error hover:text-white transition-all duration-150 inline-flex items-center justify-center cursor-pointer"
                        title="ลบข้อมูล"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Contracts List - Mobile */}
      <div className="lg:hidden flex flex-col gap-3">
        {paginatedContracts.length === 0 ? (
          <div className="py-8 text-center text-gray-500 bg-white rounded-lg border border-border-subtle">
            ไม่พบข้อมูลสัญญา
          </div>
        ) : (
          paginatedContracts.map((contract) => (
            <div key={contract.contract_id} className="mobile-card flex flex-col gap-3 animate-in fade-in duration-150">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="font-bold text-ink text-base select-all">
                    {contract.house_number
                      ? `ห้อง ${contract.house_number}`
                      : `Room #${contract.room_id}`}
                  </span>
                  <span className="text-[10px] text-muted font-sans mt-0.5">
                    เริ่ม: {new Date(contract.start_date).toLocaleDateString("th-TH")} - สิ้นสุด: {new Date(contract.end_date).toLocaleDateString("th-TH")}
                  </span>
                </div>
                {contract.is_active ? (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    ใช้งานอยู่
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                    ยกเลิกแล้ว
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-700 py-2 bg-surface rounded px-3">
                <div className="overflow-hidden truncate">👤 ผู้เช่า: <span className="font-semibold text-ink select-all">{contract.tenant_name || `Tenant #${contract.tenant_id}`}</span></div>
                <div className="overflow-hidden truncate">📞 เบอร์โทร: <span className="select-all">{contract.tenant_phone || "-"}</span></div>
                <div className="col-span-2 border-t border-border-subtle/50 my-1" />
                <div className="col-span-2 flex justify-between select-none">
                  <span>💵 มัดจำ: ฿{Number(contract.deposit).toLocaleString()}</span>
                  <span className="font-bold text-primary">ค่าเช่า: ฿{Number(contract.rent_amount).toLocaleString()}/ด.</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-border-subtle">
                <button
                  onClick={() => handleViewDetails(contract)}
                  className="flex-1 min-h-[44px] rounded-lg bg-surface text-ink active:bg-border border border-border-subtle font-medium text-sm flex items-center justify-center cursor-pointer gap-1.5"
                >
                  👁 รายละเอียด
                </button>
                {contract.is_active && (
                  <button
                    onClick={() => handleTerminate(contract.contract_id)}
                    className="flex-1 min-h-[44px] rounded-lg bg-warning-light text-warning active:bg-warning/20 font-medium text-sm flex items-center justify-center cursor-pointer gap-1.5"
                  >
                    ยกเลิกสัญญา
                  </button>
                )}
                <button
                  onClick={() => handleDelete(contract.contract_id)}
                  className="p-2.5 min-h-[44px] min-w-[44px] rounded-lg bg-error-light text-error active:bg-error/20 border border-error/10 flex items-center justify-center cursor-pointer"
                  aria-label="ลบข้อมูลสัญญา"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredContracts.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Details Dialog */}
      <Dialog
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        title="รายละเอียดสัญญา"
        size="md"
      >
        {selectedContract && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">
              <div>
                <label className="text-xs text-gray-500">เลขที่สัญญา</label>
                <p className="font-medium text-gray-900 select-all">
                  #{selectedContract.contract_id}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-500">สถานะ</label>
                <p className="mt-1">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      selectedContract.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {selectedContract.is_active ? "ใช้งานอยู่" : "ยกเลิกแล้ว"}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-500">บ้านเช่า</label>
                <p className="font-medium text-gray-900 select-all">
                  {selectedContract.house_number
                    ? `บ้านเลขที่ ${selectedContract.house_number}`
                    : `Room #${selectedContract.room_id}`}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-500">ผู้เช่า</label>
                <p className="font-medium text-gray-900 select-all">
                  {selectedContract.tenant_name ||
                    `Tenant #${selectedContract.tenant_id}`}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-500">
                  วันที่เริ่มสัญญา
                </label>
                <p className="font-medium text-gray-900 select-all">
                  {new Date(selectedContract.start_date).toLocaleDateString(
                    "th-TH"
                  )}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-500">วันที่สิ้นสุด</label>
                <p className="font-medium text-gray-900 select-all">
                  {new Date(selectedContract.end_date).toLocaleDateString(
                    "th-TH"
                  )}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-500">ค่าเช่า</label>
                <p className="font-medium text-gray-900 select-all">
                  ฿{Number(selectedContract.rent_amount).toLocaleString()} /
                  เดือน
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-500">เงินประกัน</label>
                <p className="font-medium text-gray-900 select-all">
                  ฿{Number(selectedContract.deposit).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex justify-end pt-4 max-lg:pt-2">
              <button
                onClick={() => setShowDetails(false)}
                className="bg-gray-200 text-gray-800 px-6 py-3 lg:py-2 rounded-lg hover:bg-gray-300 transition-colors w-full lg:w-auto touch-target font-semibold text-sm"
              >
                ปิด
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
