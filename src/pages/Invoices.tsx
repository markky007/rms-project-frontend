import React, { useEffect, useState, type JSX } from "react";
import axios from "axios";
import { Calendar, CheckCircle, AlertCircle, Clock } from "lucide-react";

type InvoiceStatus = "paid" | "pending" | "overdue";

interface Invoice {
  invoice_id: number;
  house_number: string | null;
  tenant_name: string | null;
  month_year: string;
  total_amount: number | string;
  status: InvoiceStatus;
  issue_date: string;
}

const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoices = async (): Promise<void> => {
      try {
        const response = await axios.get<Invoice[]>(
          "http://localhost:3000/api/billing"
        );
        setInvoices(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch invoices", err);
        setError("โหลดข้อมูลใบแจ้งหนี้ล้มเหลว โปรดลองใหม่อีกครั้ง");
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const getStatusBadge = (status: InvoiceStatus): JSX.Element => {
    switch (status) {
      case "paid":
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
            <CheckCircle size={14} /> ชำระแล้ว
          </span>
        );
      case "pending":
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
            <Clock size={14} /> รอชำระ
          </span>
        );
      case "overdue":
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
            <AlertCircle size={14} /> เกินกำหนด
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">ใบแจ้งหนี้</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  เลขที่ใบแจ้งหนี้
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  บ้านเลขที่
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ผู้เช่า
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  เดือน
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ยอดชำระ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  สถานะ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  วันที่ออก
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-sm">
              {invoices.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    ไม่พบใบแจ้งหนี้
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr
                    key={invoice.invoice_id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-gray-600">
                      #{String(invoice.invoice_id).padStart(5, "0")}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      {invoice.house_number
                        ? `บ้านเลขที่ ${invoice.house_number}`
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {invoice.tenant_name || "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} className="text-gray-400" />
                        {invoice.month_year}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-800">
                      ฿
                      {parseFloat(String(invoice.total_amount)).toLocaleString(
                        "en-US",
                        { minimumFractionDigits: 2 }
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(invoice.status)}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(invoice.issue_date).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Invoices;
