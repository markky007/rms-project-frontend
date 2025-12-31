import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import Dialog from "../components/Dialog";
import buildingService, {
  type Building,
  type CreateBuildingData,
} from "../services/buildingService";

export default function BuildingManagement() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreateBuildingData>({
    name: "",
    address: "",
    water_rate: 18.0,
    elec_rate: 7.0,
  });

  useEffect(() => {
    fetchBuildings();
  }, []);

  const fetchBuildings = async () => {
    try {
      setLoading(true);
      const data = await buildingService.getBuildings();
      setBuildings(data);
    } catch (error) {
      console.error("Error fetching buildings:", error);
      alert("ไม่สามารถโหลดข้อมูลอาคารได้");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await buildingService.updateBuilding(editingId, formData);
        alert("อัพเดทข้อมูลอาคารสำเร็จ");
      } else {
        await buildingService.createBuilding(formData);
        alert("เพิ่มอาคารสำเร็จ");
      }
      handleCloseDialog();
      fetchBuildings();
    } catch (error) {
      console.error("Error saving building:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  const handleEdit = (building: Building) => {
    setEditingId(building.building_id);
    setFormData({
      name: building.name,
      address: building.address || "",
      water_rate: building.water_rate,
      elec_rate: building.elec_rate,
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: number) => {
    if (
      !confirm(
        "คุณแน่ใจหรือไม่ที่จะลบอาคารนี้? การลบอาคารจะลบห้องทั้งหมดที่เกี่ยวข้องด้วย"
      )
    ) {
      return;
    }
    try {
      await buildingService.deleteBuilding(id);
      alert("ลบอาคารสำเร็จ");
      fetchBuildings();
    } catch (error) {
      console.error("Error deleting building:", error);
      alert("ไม่สามารถลบอาคารได้");
    }
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingId(null);
    setFormData({ name: "", address: "", water_rate: 18.0, elec_rate: 7.0 });
  };

  if (loading) {
    return <div className="p-8">กำลังโหลด...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">จัดการอาคาร</h1>
        <button
          onClick={() => setShowDialog(true)}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-md"
        >
          <Plus size={20} />
          เพิ่มอาคาร
        </button>
      </div>

      {/* Dialog for Create/Edit */}
      <Dialog
        isOpen={showDialog}
        onClose={handleCloseDialog}
        title={editingId ? "แก้ไขข้อมูลอาคาร" : "เพิ่มอาคารใหม่"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ชื่ออาคาร <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="เช่น อาคาร A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ที่อยู่
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="ที่อยู่อาคาร"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {editingId ? "บันทึกการแก้ไข" : "เพิ่มอาคาร"}
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

      {/* Buildings Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ชื่ออาคาร
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ที่อยู่
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ค่าน้ำ (บาท/หน่วย)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ค่าไฟ (บาท/หน่วย)
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                จัดการ
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {buildings.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  ไม่พบข้อมูลอาคาร
                </td>
              </tr>
            ) : (
              buildings.map((building) => (
                <tr key={building.building_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {building.name}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {building.address || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    ฿{Number(building.water_rate).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    ฿{Number(building.elec_rate).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(building)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      แก้ไข
                    </button>
                    <button
                      onClick={() => handleDelete(building.building_id)}
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
      </div>
    </div>
  );
}
