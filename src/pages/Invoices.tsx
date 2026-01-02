import React, { useEffect, useState, useRef, type JSX } from "react";
import {
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
  Download,
  X,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import html2canvas from "html2canvas";
import invoiceService, { type Invoice } from "../services/invoiceService";
import promptpayQr from "../payments/promptpay-qr.png";
import { generatePromptPayPayload } from "../utils/promptpay";
import { useAlert } from "../hooks/useAlert";

const STATUS_OPTIONS: {
  value: Invoice["status"];
  label: string;
  color: string;
}[] = [
  { value: "pending", label: "รอชำระ", color: "yellow" },
  { value: "paid", label: "ชำระแล้ว", color: "green" },
  { value: "overdue", label: "เกินกำหนด", color: "red" },
  { value: "cancelled", label: "ยกเลิก", color: "gray" },
];

const Invoices: React.FC = () => {
  const { showAlert } = useAlert();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Selection state for bulk operations
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<Invoice["status"]>("paid");
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

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
          scale: 2,
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

  // Handle single invoice status update
  const handleStatusChange = async (id: number, status: Invoice["status"]) => {
    try {
      setIsUpdating(true);
      await invoiceService.updateInvoiceStatus(id, status);
      setInvoices((prev) =>
        prev.map((inv) => (inv.invoice_id === id ? { ...inv, status } : inv))
      );
      showAlert({ message: "อัพเดทสถานะสำเร็จ", type: "success" });
    } catch (err) {
      console.error("Failed to update status", err);
      showAlert({ message: "อัพเดทสถานะล้มเหลว", type: "error" });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle bulk status update
  const handleBulkStatusUpdate = async () => {
    if (selectedIds.size === 0) {
      showAlert({ message: "กรุณาเลือกใบแจ้งหนี้ก่อน", type: "error" });
      return;
    }

    try {
      setIsUpdating(true);
      const ids = Array.from(selectedIds);
      await invoiceService.bulkUpdateStatus(ids, bulkStatus);
      setInvoices((prev) =>
        prev.map((inv) =>
          selectedIds.has(inv.invoice_id) ? { ...inv, status: bulkStatus } : inv
        )
      );
      setSelectedIds(new Set());
      showAlert({
        message: `อัพเดทสถานะ ${ids.length} รายการสำเร็จ`,
        type: "success",
      });
    } catch (err) {
      console.error("Failed to bulk update status", err);
      showAlert({ message: "อัพเดทสถานะหลายรายการล้มเหลว", type: "error" });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    try {
      setIsUpdating(true);
      await invoiceService.deleteInvoice(id);
      setInvoices((prev) => prev.filter((inv) => inv.invoice_id !== id));
      setDeleteConfirmId(null);
      showAlert({ message: "ลบใบแจ้งหนี้สำเร็จ", type: "success" });
    } catch (err) {
      console.error("Failed to delete invoice", err);
      showAlert({ message: "ลบใบแจ้งหนี้ล้มเหลว", type: "error" });
    } finally {
      setIsUpdating(false);
    }
  };

  // Selection handlers
  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === invoices.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(invoices.map((inv) => inv.invoice_id)));
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
      case "cancelled":
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            <X size={14} /> ยกเลิก
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

  // Placeholder PromptPay ID for demo
  const PROMPTPAY_ID = "085-399-4499";

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">ใบแจ้งหนี้</h1>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-blue-700 font-medium">
              เลือก {selectedIds.size} รายการ
            </span>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              ยกเลิกการเลือก
            </button>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={bulkStatus}
              onChange={(e) =>
                setBulkStatus(e.target.value as Invoice["status"])
              }
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              onClick={handleBulkStatusUpdate}
              disabled={isUpdating}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
            >
              <RefreshCw
                size={16}
                className={isUpdating ? "animate-spin" : ""}
              />
              อัพเดทสถานะ
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 w-12">
                  <input
                    type="checkbox"
                    checked={
                      invoices.length > 0 &&
                      selectedIds.size === invoices.length
                    }
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
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
                    className={`hover:bg-gray-50 transition-colors ${
                      selectedIds.has(invoice.invoice_id) ? "bg-blue-50" : ""
                    }`}
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(invoice.invoice_id)}
                        onChange={() => toggleSelect(invoice.invoice_id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
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
                      <select
                        value={invoice.status}
                        onChange={(e) =>
                          handleStatusChange(
                            invoice.invoice_id,
                            e.target.value as Invoice["status"]
                          )
                        }
                        disabled={isUpdating}
                        className={`border rounded-md px-2 py-1 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none ${
                          invoice.status === "paid"
                            ? "border-green-300 bg-green-50 text-green-700"
                            : invoice.status === "pending"
                            ? "border-yellow-300 bg-yellow-50 text-yellow-700"
                            : invoice.status === "overdue"
                            ? "border-red-300 bg-red-50 text-red-700"
                            : "border-gray-300 bg-gray-50 text-gray-700"
                        }`}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleViewDetails(invoice.invoice_id)}
                          className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                          title="ดูรายละเอียด"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(invoice.invoice_id)}
                          className="text-red-500 hover:text-red-700 transition-colors p-1"
                          title="ลบใบแจ้งหนี้"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-4 max-w-xs w-full">
            <h3 className="text-base font-bold text-gray-800 mb-2">
              ยืนยันการลบ
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              ลบใบแจ้งหนี้{" "}
              <strong>#{String(deleteConfirmId).padStart(5, "0")}</strong>?
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
                disabled={isUpdating}
                className="px-3 py-1.5 text-sm text-red-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 font-medium"
              >
                {isUpdating ? "ลบ..." : "ลบ"}
              </button>
            </div>
          </div>
        </div>
      )}

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
                    {selectedInvoice.items?.map((item, index) => {
                      // Extract meter reading info from description for water/electricity
                      const getMeterInfo = () => {
                        const inv = selectedInvoice as any;
                        if (
                          item.item_type === "water" &&
                          inv.prev_water_reading !== undefined &&
                          inv.current_water_reading !== undefined
                        ) {
                          const usage =
                            inv.current_water_reading - inv.prev_water_reading;
                          return `มิเตอร์น้ำ ${inv.current_water_reading}-${inv.prev_water_reading} ใช้ไป ${usage} หน่วย`;
                        }
                        if (
                          item.item_type === "electric" &&
                          inv.prev_elec_reading !== undefined &&
                          inv.current_elec_reading !== undefined
                        ) {
                          const usage =
                            inv.current_elec_reading - inv.prev_elec_reading;
                          return `มิเตอร์ไฟ ${inv.current_elec_reading}-${inv.prev_elec_reading} ใช้ไป ${usage} หน่วย`;
                        }
                        return null;
                      };
                      const meterInfo = getMeterInfo();

                      // Translate description to Thai
                      let displayDesc = item.description;
                      if (item.item_type === "rent") {
                        displayDesc = "ค่าเช่าห้อง";
                      } else if (item.item_type === "water") {
                        displayDesc = displayDesc
                          .replace("Water", "ค่าน้ำ")
                          .replace("units", "หน่วย");
                      } else if (item.item_type === "electric") {
                        displayDesc = displayDesc
                          .replace("Electricity", "ค่าไฟ")
                          .replace("units", "หน่วย");
                      }

                      return (
                        <tr key={index}>
                          <td className="px-4 py-3 text-gray-700">
                            <div>{displayDesc}</div>
                            {meterInfo && (
                              <div className="text-xs text-gray-500 mt-1">
                                {meterInfo}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-900">
                            ฿
                            {Number(item.amount).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      );
                    })}
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
                <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col items-center">
                  <QRCodeCanvas
                    value={generatePromptPayPayload(
                      PROMPTPAY_ID,
                      Number(selectedInvoice.total_amount)
                    )}
                    size={200}
                    level={"M"}
                    includeMargin={true}
                    imageSettings={{
                      src: promptpayQr,
                      x: undefined,
                      y: undefined,
                      height: 40,
                      width: 40,
                      excavate: true,
                    }}
                  />
                </div>
                <p className="mt-4 text-sm text-gray-500">ID: {PROMPTPAY_ID}</p>
                <div className="mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  ระบุยอดเงินอัตโนมัติ
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-4 sticky bottom-0">
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
