import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import Dialog from "../components/Dialog";
import tenantService, {
  type Tenant,
  type CreateTenantData,
} from "../services/tenantService";
import { useAlert } from "../hooks/useAlert";
import Pagination from "../components/Pagination";

export default function TenantManagement() {
  const { showAlert } = useAlert();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState<CreateTenantData>({
    full_name: "",
    id_card: "",
    phone: "",
    line_id: "",
    address: "",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [tenants.length]);

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const data = await tenantService.getTenants();
      setTenants(data);
    } catch (error) {
      console.error("Error fetching tenants:", error);
      showAlert({ message: "ไม่สามารถโหลดข้อมูลผู้เช่าได้", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await tenantService.updateTenant(editingId, formData);
        showAlert({ message: "อัปเดตข้อมูลผู้เช่าสำเร็จ", type: "success" });
      } else {
        await tenantService.createTenant(formData);
        showAlert({ message: "เพิ่มผู้เช่าสำเร็จ", type: "success" });
      }
      handleCloseDialog();
      fetchTenants();
    } catch (error) {
      console.error("Error saving tenant:", error);
      showAlert({ message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล", type: "error" });
    }
  };

  const handleEdit = (tenant: Tenant) => {
    setEditingId(tenant.tenant_id);
    setFormData({
      full_name: tenant.full_name,
      id_card: tenant.id_card,
      phone: tenant.phone || "",
      line_id: tenant.line_id || "",
      address: tenant.address || "",
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: number) => {
    try {
      setIsDeleting(true);
      await tenantService.deleteTenant(id);
      showAlert({ message: "ลบผู้เช่าสำเร็จ", type: "success" });
      setDeleteConfirmId(null);
      fetchTenants();
    } catch (error) {
      console.error("Error deleting tenant:", error);
      showAlert({ message: "ไม่สามารถลบผู้เช่าได้", type: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingId(null);
    setFormData({
      full_name: "",
      id_card: "",
      phone: "",
      line_id: "",
      address: "",
    });
  };

  // Calculate pagination
  const totalPages = Math.ceil(tenants.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTenants = tenants.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] font-sans">
        <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-xs text-muted mt-2">กำลังโหลดข้อมูลผู้เช่า...</span>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 font-sans">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
        <h1 className="text-xl lg:text-3xl font-bold text-gray-800">จัดการผู้เช่า</h1>
        <button
          onClick={() => setShowDialog(true)}
          className="bg-emerald-600 text-white px-6 py-3 lg:py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-md touch-target w-full lg:w-auto"
        >
          <Plus size={20} />
          เพิ่มผู้เช่า
        </button>
      </div>

      {/* Dialog for Create/Edit */}
      <Dialog
        isOpen={showDialog}
        onClose={handleCloseDialog}
        title={editingId ? "แก้ไขข้อมูลผู้เช่า" : "เพิ่มผู้เช่าใหม่"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ชื่อ-นามสกุล <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                className="w-full px-3 py-3 lg:py-2 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-base lg:text-sm"
                placeholder="นายสมชาย ใจดี"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                เลขบัตรประชาชน <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={13}
                value={formData.id_card}
                onChange={(e) =>
                  setFormData({ ...formData, id_card: e.target.value })
                }
                className="w-full px-3 py-3 lg:py-2 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-base lg:text-sm"
                placeholder="1234567890123"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                เบอร์โทรศัพท์
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-3 py-3 lg:py-2 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-base lg:text-sm"
                placeholder="0812345678"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                LINE ID
              </label>
              <input
                type="text"
                value={formData.line_id}
                onChange={(e) =>
                  setFormData({ ...formData, line_id: e.target.value })
                }
                className="w-full px-3 py-3 lg:py-2 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-base lg:text-sm"
                placeholder="lineid123"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ที่อยู่
              </label>
              <textarea
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full px-3 py-3 lg:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-base lg:text-sm"
                placeholder="ที่อยู่ปัจจุบัน"
                rows={3}
              />
            </div>
          </div>
          <div className="flex gap-2 pt-4 max-lg:flex-col">
            <button
              type="submit"
              className="flex-1 bg-[#16a34a] text-white px-6 py-3 rounded-lg hover:bg-[#15803d] transition-colors touch-target font-semibold text-sm"
            >
              {editingId ? "บันทึกการแก้ไข" : "เพิ่มผู้เช่า"}
            </button>
            <button
              type="button"
              onClick={handleCloseDialog}
              className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors touch-target font-semibold text-sm"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      </Dialog>

      {/* Tenants Table - Desktop */}
      <div className="hidden lg:block bg-white rounded-lg border border-border shadow-medium overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ชื่อ-นามสกุล
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                เลขบัตรประชาชน
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                เบอร์โทร
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                LINE ID
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                จัดการ
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tenants.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  ไม่พบข้อมูลผู้เช่า
                </td>
              </tr>
            ) : (
              paginatedTenants.map((tenant) => (
                <tr key={tenant.tenant_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {tenant.full_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {tenant.id_card}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {tenant.phone || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {tenant.line_id || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(tenant)}
                        className="h-8 px-3.5 text-xs font-medium rounded-full bg-surface text-ink hover:bg-primary hover:text-white transition-all duration-150 inline-flex items-center justify-center gap-1 cursor-pointer"
                      >
                        แก้ไข
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(tenant.tenant_id)}
                        className="h-8 px-3.5 text-xs font-medium rounded-full bg-error-light text-error hover:bg-error hover:text-white transition-all duration-150 inline-flex items-center justify-center gap-1 cursor-pointer"
                      >
                        ลบ
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Tenants List - Mobile */}
      <div className="lg:hidden flex flex-col gap-3">
        {tenants.length === 0 ? (
          <div className="py-8 text-center text-gray-500 bg-white rounded-lg border border-border-subtle">
            ไม่พบข้อมูลผู้เช่า
          </div>
        ) : (
          paginatedTenants.map((tenant) => (
            <div key={tenant.tenant_id} className="mobile-card flex flex-col gap-3 animate-in fade-in duration-150">
              <div className="flex justify-between items-center">
                <span className="font-bold text-ink text-base select-all">{tenant.full_name}</span>
                <span className="text-xs text-muted font-sans select-all">LINE: {tenant.line_id || "-"}</span>
              </div>

              <div className="flex flex-col gap-1.5 text-xs text-gray-700 py-2 bg-surface rounded px-3">
                <div className="select-all">🪪 บัตรประชาชน: {tenant.id_card}</div>
                <div className="select-all">📞 เบอร์โทรศัพท์: {tenant.phone || "-"}</div>
                {tenant.address && (
                  <div className="border-t border-border-subtle/50 pt-1 mt-1 text-gray-500 select-all">
                    📍 ที่อยู่: {tenant.address}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2 border-t border-border-subtle">
                <button
                  onClick={() => handleEdit(tenant)}
                  className="flex-1 min-h-[44px] rounded-lg bg-surface text-ink active:bg-border border border-border-subtle font-medium text-sm flex items-center justify-center cursor-pointer"
                >
                  แก้ไข
                </button>
                <button
                  onClick={() => setDeleteConfirmId(tenant.tenant_id)}
                  className="flex-1 min-h-[44px] rounded-lg bg-error-light text-error active:bg-error/20 font-medium text-sm flex items-center justify-center cursor-pointer"
                >
                  ลบ
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination (visible for both views) */}
      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={tenants.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        title="ยืนยันการลบ"
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-600">
            คุณแน่ใจหรือไม่ที่จะลบผู้เช่านี้ออกจากระบบ? การดำเนินการนี้ไม่สามารถย้อนกลับได้
          </p>
          <div className="flex gap-2 pt-2 max-lg:flex-col">
            <button
              onClick={() => handleDelete(deleteConfirmId!)}
              disabled={isDeleting}
              className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors touch-target font-semibold text-sm text-center"
            >
              {isDeleting ? "กำลังลบ..." : "ลบข้อมูล"}
            </button>
            <button
              onClick={() => setDeleteConfirmId(null)}
              className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors touch-target font-semibold text-sm text-center"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
