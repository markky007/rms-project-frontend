import React, { useEffect, useState, useRef, type JSX } from "react";
import {
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
  Download,
  X,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import html2canvas from "html2canvas";
import invoiceService, { type Invoice } from "../services/invoiceService";

const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const data = await invoiceService.getInvoices();
      setInvoices(data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch invoices", err);
      setError("โหลดข้อมูลใบแจ้งหนี้ล้มเหลว โปรดลองใหม่อีกครั้ง");
      setLoading(false);
    }
  };

  const handleViewDetails = async (id: number) => {
    try {
      const invoice = await invoiceService.getInvoiceById(id);
      setSelectedInvoice(invoice);
      setIsModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch invoice details", err);
    }
  };

  const handleDownload = async () => {
    if (invoiceRef.current) {
      try {
        const canvas = await html2canvas(invoiceRef.current, {
          scale: 2, // Improve resolution
          backgroundColor: "#ffffff",
        });
        const link = document.createElement("a");
        link.download = `invoice-${selectedInvoice?.invoice_id}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      } catch (err) {
        console.error("Failed to download invoice", err);
      }
    }
  };

  const getStatusBadge = (status: string): JSX.Element => {
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

  // Placeholder PromptPay ID for demo usually phone or TaxID
  const PROMPTPAY_ID = "081-234-5678";

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
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-sm">
              {invoices.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    ไม่พบใบแจ้งหนี้
                  </td>
                </tr>
              ) : (
                invoices.map((invoice: any) => (
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
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleViewDetails(invoice.invoice_id)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="ดูรายละเอียด"
                      >
                        <Eye size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {isModalOpen && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-800">
                รายละเอียดใบแจ้งหนี้
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6" ref={invoiceRef}>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  ใบแจ้งหนี้ / Invoice
                </h3>
                <p className="text-gray-500">
                  เดือน: {selectedInvoice.month_year} | เลขที่: #
                  {String(selectedInvoice.invoice_id).padStart(5, "0")}
                </p>
                <div className="mt-2 text-sm text-gray-500">
                  <p>
                    วันที่ออก:{" "}
                    {new Date(selectedInvoice.issue_date).toLocaleDateString()}
                  </p>
                  {(selectedInvoice as any).house_number && (
                    <p>บ้านเลขที่: {(selectedInvoice as any).house_number}</p>
                  )}
                  {(selectedInvoice as any).tenant_name && (
                    <p>ผู้เช่า: {(selectedInvoice as any).tenant_name}</p>
                  )}
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden mb-6">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                        รายการ
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">
                        จำนวนเงิน
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {selectedInvoice.items?.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-gray-700">
                          {item.description}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-900">
                          ฿
                          {Number(item.amount).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                    <tr>
                      <td className="px-4 py-3 font-bold text-gray-800">
                        ยอดรวมทั้งสิ้น
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-600 text-lg">
                        ฿
                        {Number(selectedInvoice.total_amount).toLocaleString(
                          undefined,
                          { minimumFractionDigits: 2 }
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="font-semibold text-gray-700 mb-4">
                  สแกนเพื่อชำระเงิน (PromptPay)
                </p>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <QRCodeCanvas
                    value={`promptpay:${PROMPTPAY_ID}?amount=${selectedInvoice.total_amount}`}
                    size={180}
                    level={"H"}
                    includeMargin={true}
                  />
                </div>
                <p className="mt-4 text-sm text-gray-500">ID: {PROMPTPAY_ID}</p>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 sticky bottom-0">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                ปิด
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium flex items-center gap-2"
              >
                <Download size={18} />
                ดาวน์โหลด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
