import { useState, useEffect } from "react";
import paymentService, { type Payment } from "../services/paymentService";
import { useAlert } from "../hooks/useAlert";
import Pagination from "../components/Pagination";

export default function PaymentManagement() {
  const { showAlert } = useAlert();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "approved"
  >("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus]);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await paymentService.getPayments();
      setPayments(data);
    } catch (error) {
      console.error("Error fetching payments:", error);
      showAlert({
        message: "ไม่สามารถโหลดข้อมูลการชำระเงินได้",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะอนุมัติการชำระเงินนี้?")) {
      return;
    }
    try {
      const userId = 1; // TODO: Get from auth context
      await paymentService.approvePayment(id, userId);
      showAlert({ message: "อนุมัติการชำระเงินสำเร็จ", type: "success" });
      fetchPayments();
    } catch (error) {
      console.error("Error approving payment:", error);
      showAlert({ message: "ไม่สามารถอนุมัติการชำระเงินได้", type: "error" });
    }
  };

  const filteredPayments = payments.filter((payment) => {
    if (filterStatus === "pending") return payment.status === "pending";
    if (filterStatus === "approved") return payment.status === "approved";
    return true;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPayments = filteredPayments.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] font-sans">
        <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-xs text-muted mt-2">กำลังโหลดข้อมูลการชำระเงิน...</span>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl lg:text-3xl font-bold text-gray-800">จัดการการชำระเงิน</h1>
      </div>

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
            ทั้งหมด ({payments.length})
          </button>
          <button
            onClick={() => setFilterStatus("pending")}
            className={`px-4 py-1.5 rounded-full border text-xs font-semibold transition-all duration-150 cursor-pointer select-none touch-target flex-shrink-0 ${
              filterStatus === "pending"
                ? "bg-warning text-white border-warning ring-2 ring-warning/20"
                : "bg-white text-ink border-border hover:bg-surface hover:border-border"
            }`}
          >
            รอการอนุมัติ (
            {payments.filter((p) => p.status === "pending").length})
          </button>
          <button
            onClick={() => setFilterStatus("approved")}
            className={`px-4 py-1.5 rounded-full border text-xs font-semibold transition-all duration-150 cursor-pointer select-none touch-target flex-shrink-0 ${
              filterStatus === "approved"
                ? "bg-success-light text-success border-success/30 ring-2 ring-success/20"
                : "bg-white text-ink border-border hover:bg-surface hover:border-border"
            }`}
          >
            อนุมัติแล้ว (
            {payments.filter((p) => p.status === "approved").length})
          </button>
        </div>
      </div>

      {/* Desktop Table view */}
      <div className="hidden lg:block bg-white rounded-lg border border-border shadow-medium overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Invoice ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                จำนวนเงิน
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                วันที่ชำระ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                สลิป
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
            {paginatedPayments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  ไม่พบข้อมูลการชำระเงิน
                </td>
              </tr>
            ) : (
              paginatedPayments.map((payment) => (
                <tr key={payment.payment_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    #{payment.invoice_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700 font-semibold">
                    ฿{Number(payment.amount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {new Date(payment.payment_date).toLocaleDateString("th-TH")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {payment.slip_image_url ? (
                      <a
                        href={payment.slip_image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:text-emerald-900"
                      >
                        ดูสลิป
                      </a>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {payment.status === "pending" ? (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                        รอการอนุมัติ
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        อนุมัติแล้ว
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end">
                      {payment.status === "pending" && (
                        <button
                          onClick={() => handleApprove(payment.payment_id)}
                          className="h-8 px-3.5 text-xs font-medium rounded-full bg-success-light text-success hover:bg-success hover:text-white transition-all duration-150 cursor-pointer"
                        >
                          อนุมัติ
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card view */}
      <div className="lg:hidden flex flex-col gap-3">
        {paginatedPayments.length === 0 ? (
          <div className="py-8 text-center text-gray-500 bg-white rounded-lg border border-border-subtle">
            ไม่พบข้อมูลการชำระเงิน
          </div>
        ) : (
          paginatedPayments.map((payment) => (
            <div key={payment.payment_id} className="mobile-card flex flex-col gap-3 animate-in fade-in duration-150">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="font-bold text-ink text-base select-all">ใบแจ้งหนี้ #{payment.invoice_id}</span>
                  <span className="text-[10px] text-muted font-sans mt-0.5">
                    วันที่ชำระ: {new Date(payment.payment_date).toLocaleDateString("th-TH")}
                  </span>
                </div>
                {payment.status === "pending" ? (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                    รอการอนุมัติ
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    อนุมัติแล้ว
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center py-2 bg-surface rounded px-3 text-sm select-none">
                <span className="text-gray-600">จำนวนเงินชำระ</span>
                <span className="font-semibold text-ink font-mono">฿{Number(payment.amount).toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-border-subtle">
                {payment.slip_image_url ? (
                  <a
                    href={payment.slip_image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-h-[44px] rounded-lg bg-surface text-ink active:bg-border border border-border-subtle font-medium text-sm flex items-center justify-center cursor-pointer gap-1.5"
                  >
                    👁 ดูภาพสลิป
                  </a>
                ) : (
                  <span className="flex-1 text-center py-2.5 text-xs text-muted italic bg-surface rounded border border-border-subtle/50 select-none">
                    ไม่มีไฟล์สลิป
                  </span>
                )}
                
                {payment.status === "pending" && (
                  <button
                    onClick={() => handleApprove(payment.payment_id)}
                    className="flex-1 min-h-[44px] rounded-lg bg-success text-white active:bg-success-hover font-medium text-sm flex items-center justify-center cursor-pointer gap-1.5"
                  >
                    ✅ อนุมัติ
                  </button>
                )}
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
          totalItems={filteredPayments.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
