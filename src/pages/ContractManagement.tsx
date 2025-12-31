import { useState, useEffect } from "react";
import contractService, {
  type Contract,
  type CreateContractData,
} from "../services/contractService";
import roomService, { type Room } from "../services/roomService";
import tenantService, { type Tenant } from "../services/tenantService";

export default function ContractManagement() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
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
      alert("ไม่สามารถโหลดข้อมูลสัญญาได้");
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
        alert("อัพเดทสัญญาสำเร็จ");
      } else {
        await contractService.createContract(formData);
        alert("สร้างสัญญาสำเร็จ");
      }
      setShowForm(false);
      setEditingId(null);
      resetForm();
      fetchContracts();
      fetchRooms();
    } catch (error) {
      console.error("Error saving contract:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  const handleTerminate = async (id: number) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะยกเลิกสัญญานี้?")) {
      return;
    }
    try {
      await contractService.terminateContract(id);
      alert("ยกเลิกสัญญาสำเร็จ");
      fetchContracts();
    } catch (error) {
      console.error("Error terminating contract:", error);
      alert("ไม่สามารถยกเลิกสัญญาได้");
    }
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

  if (loading) {
    return <div className="p-8">กำลังโหลด...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">จัดการสัญญาเช่า</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            + สร้างสัญญาใหม่
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? "แก้ไขสัญญา" : "สร้างสัญญาใหม่"}
          </h2>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {editingId ? "บันทึกการแก้ไข" : "สร้างสัญญา"}
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
            onClick={() => setFilterStatus("active")}
            className={`px-4 py-2 rounded-lg ${
              filterStatus === "active"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            ใช้งานอยู่
          </button>
          <button
            onClick={() => setFilterStatus("inactive")}
            className={`px-4 py-2 rounded-lg ${
              filterStatus === "inactive"
                ? "bg-gray-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            ยกเลิกแล้ว
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
            {filteredContracts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  ไม่พบข้อมูลสัญญา
                </td>
              </tr>
            ) : (
              filteredContracts.map((contract) => (
                <tr key={contract.contract_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    Room #{contract.room_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    Tenant #{contract.tenant_id}
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
                    {contract.is_active && (
                      <button
                        onClick={() => handleTerminate(contract.contract_id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        ยกเลิกสัญญา
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
