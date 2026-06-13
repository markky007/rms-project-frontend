import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import Dialog from "../components/Dialog";
import userService, {
  type User,
  type CreateUserData,
  type UpdateUserData,
} from "../services/userService";
import { useAlert } from "../hooks/useAlert";
import Pagination from "../components/Pagination";

export default function UserManagement() {
  const { showAlert } = useAlert();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreateUserData>({
    username: "",
    password: "",
    role: "staff",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [users.length]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      showAlert({ message: "ไม่สามารถโหลดข้อมูลผู้ใช้ได้", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const updateData: UpdateUserData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await userService.updateUser(editingId, updateData);
        showAlert({ message: "อัปเดตข้อมูลผู้ใช้สำเร็จ", type: "success" });
      } else {
        await userService.createUser(formData);
        showAlert({ message: "เพิ่มผู้ใช้สำเร็จ", type: "success" });
      }
      handleCloseDialog();
      fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
      showAlert({ message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล", type: "error" });
    }
  };

  const handleEdit = (user: User) => {
    setEditingId(user.user_id);
    setFormData({
      username: user.username,
      password: "",
      role: user.role,
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบผู้ใช้นี้?")) {
      return;
    }
    try {
      await userService.deleteUser(id);
      showAlert({ message: "ลบผู้ใช้สำเร็จ", type: "success" });
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      showAlert({ message: "ไม่สามารถลบผู้ใช้ได้", type: "error" });
    }
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingId(null);
    setFormData({ username: "", password: "", role: "staff" });
  };

  const getRoleBadge = (role: string) => {
    return role === "admin" ? (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
        Admin
      </span>
    ) : (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
        Staff
      </span>
    );
  };

  // Calculate pagination
  const totalPages = Math.ceil(users.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = users.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] font-sans">
        <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-xs text-muted mt-2">กำลังโหลดข้อมูลผู้ใช้งาน...</span>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 font-sans">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
        <h1 className="text-xl lg:text-3xl font-bold text-gray-800">จัดการผู้ใช้งาน</h1>
        <button
          onClick={() => setShowDialog(true)}
          className="bg-emerald-600 text-white px-6 py-3 lg:py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-md touch-target w-full lg:w-auto"
        >
          <Plus size={20} />
          เพิ่มผู้ใช้
        </button>
      </div>

      {/* Dialog for Create/Edit */}
      <Dialog
        isOpen={showDialog}
        onClose={handleCloseDialog}
        title={editingId ? "แก้ไขข้อมูลผู้ใช้" : "เพิ่มผู้ใช้ใหม่"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ชื่อผู้ใช้ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="w-full px-3 py-3 lg:py-2 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-base lg:text-sm"
                placeholder="username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                รหัสผ่าน {!editingId && <span className="text-red-500">*</span>}
                {editingId && (
                  <span className="text-gray-500 text-xs block lg:inline">
                    (ปล่อยว่างถ้าไม่ต้องการเปลี่ยน)
                  </span>
                )}
              </label>
              <input
                type="password"
                required={!editingId}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-3 py-3 lg:py-2 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-base lg:text-sm"
                placeholder="password"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                บทบาท <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value as "admin" | "staff",
                  })
                }
                className="w-full px-3 py-3 lg:py-2 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-base lg:text-sm"
              >
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-4 max-lg:flex-col">
            <button
              type="submit"
              className="flex-1 bg-[#16a34a] text-white px-6 py-3 rounded-lg hover:bg-[#15803d] transition-colors touch-target font-semibold text-sm"
            >
              {editingId ? "บันทึกการแก้ไข" : "เพิ่มผู้ใช้"}
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

      {/* Users Table - Desktop */}
      <div className="hidden lg:block bg-white rounded-lg border border-border shadow-medium overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ชื่อผู้ใช้
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                บทบาท
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                วันที่สร้าง
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                จัดการ
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  ไม่พบข้อมูลผู้ใช้
                </td>
              </tr>
            ) : (
              paginatedUsers.map((user) => (
                <tr key={user.user_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {user.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {new Date(user.created_at).toLocaleDateString("th-TH")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="h-8 px-3.5 text-xs font-medium rounded-full bg-surface text-ink hover:bg-primary hover:text-white transition-all duration-150 inline-flex items-center justify-center gap-1 cursor-pointer"
                      >
                        แก้ไข
                      </button>
                      <button
                        onClick={() => handleDelete(user.user_id)}
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

      {/* Users List - Mobile */}
      <div className="lg:hidden flex flex-col gap-3">
        {users.length === 0 ? (
          <div className="py-8 text-center text-gray-500 bg-white rounded-lg border border-border-subtle">
            ไม่พบข้อมูลผู้ใช้
          </div>
        ) : (
          paginatedUsers.map((user) => (
            <div key={user.user_id} className="mobile-card flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-ink text-base select-all">{user.username}</span>
                {getRoleBadge(user.role)}
              </div>
              <div className="text-xs text-muted">
                สร้างเมื่อ: {new Date(user.created_at).toLocaleDateString("th-TH")}
              </div>
              <div className="flex gap-2 pt-2 border-t border-border-subtle">
                <button
                  onClick={() => handleEdit(user)}
                  className="flex-1 min-h-[44px] rounded-lg bg-surface text-ink active:bg-border border border-border-subtle font-medium text-sm flex items-center justify-center cursor-pointer"
                >
                  แก้ไข
                </button>
                <button
                  onClick={() => handleDelete(user.user_id)}
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
          totalItems={users.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
