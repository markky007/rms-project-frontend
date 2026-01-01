import { useState, useEffect } from "react";
import paymentService, { type Payment } from "../services/paymentService";
import { useAlert } from "../hooks/useAlert";

export default function PaymentManagement() {
  const { showAlert } = useAlert();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "approved"
  >("all");

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

  if (loading) {
    return <div className="p-8">กำลังโหลด...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">จัดการการชำระเงิน</h1>
      </div>

      <div className="mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2 rounded-lg ${
              filterStatus === "all"
                ? "bg-emerald-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            ทั้งหมด ({payments.length})
          </button>
          <button
            onClick={() => setFilterStatus("pending")}
            className={`px-4 py-2 rounded-lg ${
              filterStatus === "pending"
                ? "bg-yellow-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            รอการอนุมัติ (
            {payments.filter((p) => p.status === "pending").length})
          </button>
          <button
            onClick={() => setFilterStatus("approved")}
            className={`px-4 py-2 rounded-lg ${
              filterStatus === "approved"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            อนุมัติแล้ว (
            {payments.filter((p) => p.status === "approved").length})
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
            {filteredPayments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  ไม่พบข้อมูลการชำระเงิน
                </td>
              </tr>
            ) : (
              filteredPayments.map((payment) => (
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
                    {payment.status === "pending" && (
                      <button
                        onClick={() => handleApprove(payment.payment_id)}
                        className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                      >
                        อนุมัติ
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
