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
import Pagination from "../components/Pagination";

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

  // Late fee warning state
  const [showLateFeeWarning, setShowLateFeeWarning] = useState(false);
  const [lateFeeInfo, setLateFeeInfo] = useState<{
    daysLate: number;
    lateFee: number;
    invoiceId: number;
  } | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter state
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");

  useEffect(() => {
    setCurrentPage(1);
  }, [invoices.length]);

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

      // Check if invoice is overdue and pending - show warning instead of auto-apply
      // BUT don't show warning if invoice already has a late_fee item
      if (invoice.status === "pending") {
        // Check if invoice already has late fee applied (check item_type field)
        const hasLateFee = (invoice as any).items?.some(
          (item: any) => item.item_type === "late_fee",
        );

        if (!hasLateFee) {
          const lateFeeCalc = calculateLateFee(invoice);
          if (lateFeeCalc) {
            setLateFeeInfo({
              daysLate: lateFeeCalc.daysLate,
              lateFee: lateFeeCalc.lateFee,
              invoiceId: id,
            });
            setShowLateFeeWarning(true);
          } else {
            setShowLateFeeWarning(false);
            setLateFeeInfo(null);
          }
        } else {
          // Already has late fee, don't show warning
          setShowLateFeeWarning(false);
          setLateFeeInfo(null);
        }
      } else {
        setShowLateFeeWarning(false);
        setLateFeeInfo(null);
      }

      setSelectedInvoice(invoice);
      setIsModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch invoice details", err);
    }
  };

  // Handle late fee confirmation from modal
  const handleConfirmLateFee = async () => {
    if (!lateFeeInfo) return;

    try {
      setIsUpdating(true);
      const result = await invoiceService.applyLateFee(lateFeeInfo.invoiceId);

      // Reset warning state BEFORE closing modal
      setShowLateFeeWarning(false);
      setLateFeeInfo(null);

      // Close current modal
      setIsModalOpen(false);

      // Refresh list
      await fetchInvoices();

      showAlert({
        message: `สร้างใบแจ้งหนี้ใหม่สำเร็จ (ค่าปรับ ฿${result.late_fee.toLocaleString()})`,
        type: "success",
      });
    } catch (err: any) {
      console.error("Failed to apply late fee", err);
      const errorMsg = err.response?.data?.error || "ไม่สามารถเพิ่มค่าปรับได้";
      showAlert({ message: errorMsg, type: "error" });
    } finally {
      setIsUpdating(false);
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
        prev.map((inv) => (inv.invoice_id === id ? { ...inv, status } : inv)),
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
          selectedIds.has(inv.invoice_id)
            ? { ...inv, status: bulkStatus }
            : inv,
        ),
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

  // Calculate late fee details
  const calculateLateFee = (invoice: any) => {
    // Parse month_year format: "YYYY-MM"
    const [year, month] = invoice.month_year.split("-");
    const dueDate = new Date(parseInt(year), parseInt(month) - 1, 5); // 5th of the month
    const currentDate = new Date();

    if (currentDate <= dueDate) {
      return null; // Not overdue
    }

    const timeDiff = currentDate.getTime() - dueDate.getTime();
    const daysLate = Math.ceil(timeDiff / (1000 * 3600 * 24));
    const lateFee = daysLate * 50;
    const newTotal = parseFloat(invoice.total_amount) + lateFee;

    return { daysLate, lateFee, newTotal };
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
    if (
      selectedIds.size === filteredInvoices.length &&
      filteredInvoices.length > 0
    ) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredInvoices.map((inv) => inv.invoice_id)));
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

  // Filter invoices by month and year
  const filteredInvoices = invoices.filter((invoice) => {
    const monthYear = invoice.month_year; // format: "YYYY-MM"

    if (!selectedMonth && !selectedYear) return true;

    if (monthYear) {
      const [year, month] = monthYear.split("-");

      if (selectedMonth && selectedYear) {
        return month === selectedMonth && year === selectedYear;
      } else if (selectedMonth) {
        return month === selectedMonth;
      } else if (selectedYear) {
        return year === selectedYear;
      }
    }

    return true;
  });

  // Get unique months and years for filter options
  const getFilterOptions = () => {
    const months = new Set<string>();
    const years = new Set<string>();

    invoices.forEach((invoice) => {
      if (invoice.month_year) {
        const [year, month] = invoice.month_year.split("-");
        if (month) months.add(month);
        if (year) years.add(year);
      }
    });

    return {
      months: Array.from(months).sort((a, b) => parseInt(a) - parseInt(b)),
      years: Array.from(years).sort((a, b) => parseInt(b) - parseInt(a)), // descending
    };
  };

  const { months, years } = getFilterOptions();

  // Calculate pagination
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">ใบแจ้งหนี้</h1>

      {/* Filter Controls */}
      <div className="mb-4 p-4 bg-white rounded-lg shadow-md border border-gray-200">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">เดือน:</label>
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none min-w-[120px]"
            >
              <option value="">ทั้งหมด</option>
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">ปี:</label>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none min-w-[120px]"
            >
              <option value="">ทั้งหมด</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {(selectedMonth || selectedYear) && (
            <button
              onClick={() => {
                setSelectedMonth("");
                setSelectedYear("");
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 underline"
            >
              ล้างตัวกรอง
            </button>
          )}

          <div className="ml-auto text-sm text-gray-600">
            แสดง {filteredInvoices.length} จาก {invoices.length} รายการ
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-blue-700 font-medium">
              เลือก {selectedIds.size} รายการ
            </span>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-3 py-1 text-sm bg-white border border-blue-300 text-blue-600 hover:bg-blue-50 rounded-md font-medium"
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
              className="flex items-center px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm min-w-[160px] justify-center"
            >
              <RefreshCw
                size={16}
                className={isUpdating ? "animate-spin" : ""}
              />
              <span className="ml-4">อัพเดทสถานะ</span>
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
                      filteredInvoices.length > 0 &&
                      selectedIds.size === filteredInvoices.length
                    }
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  เลขที่ใบแจ้งหนี้
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  บ้าน
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
              {paginatedInvoices.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    ไม่พบใบแจ้งหนี้
                  </td>
                </tr>
              ) : (
                paginatedInvoices.map((invoice: any) => (
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
                      {invoice.house_number ? `${invoice.house_number}` : "N/A"}
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
                        { minimumFractionDigits: 2 },
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={invoice.status}
                        onChange={(e) =>
                          handleStatusChange(
                            invoice.invoice_id,
                            e.target.value as Invoice["status"],
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
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredInvoices.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
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
                รายละเอียดใบแจ้งค่าเช่าบ้าน
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {/* Late Fee Warning Banner */}
            {showLateFeeWarning && lateFeeInfo && (
              <div className="mt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="text-orange-600" size={20} />
                    <h4 className="font-semibold text-orange-800">
                      ใบแจ้งหนี้นี้เกินกำหนดชำระ
                    </h4>
                  </div>
                  <div className="text-sm text-orange-700 space-y-1 mb-4">
                    <p>
                      เลยกำหนดชำระ: <strong>{lateFeeInfo.daysLate} วัน</strong>
                    </p>
                    <p>
                      ค่าปรับ (50 บาท/วัน):{" "}
                      <strong>฿{lateFeeInfo.lateFee.toLocaleString()}</strong>
                    </p>
                  </div>
                  <button
                    onClick={handleConfirmLateFee}
                    disabled={isUpdating}
                    className="px-6 py-2 text-sm rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: isUpdating ? "#fb923c" : "#ea580c",
                      color: "white",
                    }}
                    onMouseEnter={(e) => {
                      if (!isUpdating) {
                        e.currentTarget.style.backgroundColor = "#c2410c";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isUpdating) {
                        e.currentTarget.style.backgroundColor = "#ea580c";
                      }
                    }}
                  >
                    {isUpdating ? "กำลังดำเนินการ..." : "ชำระค่าปรับ"}
                  </button>
                </div>
              </div>
            )}

            <div className="p-6" ref={invoiceRef}>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  ใบแจ้งค่าเช่าบ้าน / Invoice
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
                    <p>{(selectedInvoice as any).house_number}</p>
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
                          return (
                            <div className="text-xs text-blue-600 mt-1">
                              <div>
                                มิเตอร์น้ำ ก่อน:{" "}
                                {Math.floor(inv.prev_water_reading)}
                              </div>
                              <div>
                                มิเตอร์น้ำ หลัง:{" "}
                                {Math.floor(inv.current_water_reading)}
                              </div>
                            </div>
                          );
                        }
                        if (
                          item.item_type === "electric" &&
                          inv.prev_elec_reading !== undefined &&
                          inv.current_elec_reading !== undefined
                        ) {
                          const usage =
                            inv.current_elec_reading - inv.prev_elec_reading;
                          return (
                            <div className="text-xs text-red-600 mt-1">
                              <div>
                                มิเตอร์ไฟ ก่อน:{" "}
                                {Math.floor(inv.prev_elec_reading)}
                              </div>
                              <div>
                                มิเตอร์ไฟ หลัง:{" "}
                                {Math.floor(inv.current_elec_reading)}
                              </div>
                            </div>
                          );
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
                          <td
                            className={`px-4 py-3 ${
                              item.item_type === "water"
                                ? "text-blue-600"
                                : item.item_type === "electric"
                                  ? "text-red-600"
                                  : "text-gray-700"
                            }`}
                          >
                            <div className="font-bold">{displayDesc}</div>
                            {meterInfo}
                          </td>
                          <td
                            className={`px-4 py-3 text-right ${
                              item.item_type === "water"
                                ? "text-blue-600"
                                : item.item_type === "electric"
                                  ? "text-red-600"
                                  : "text-gray-900"
                            }`}
                          >
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
                          { minimumFractionDigits: 2 },
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
                      Number(selectedInvoice.total_amount),
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

              <div className="mt-6 space-y-2 text-sm text-gray-600 border-t pt-4">
                <p>
                  <span className="font-semibold text-red-500">*</span>{" "}
                  กรุณาชําระทั้งหมดไม่เกินวันที่ 5 ของเดือน
                  หากเกินกําหนดขอเก็บเพิ่มวันละ 50 บาทจนกว่าจะจ่ายครบ
                </p>
                <p>
                  <span className="font-semibold text-red-500">*</span>{" "}
                  ห้ามนําสัตว์เลี้ยงทุกชนิดมาเลี้ยง
                  (หากเกิดความเสียหายจะต้องรับผิดชอบให้สภาพคงเดิมหรือปรับเท่ามูลค่าของสิ่งนั้น)
                </p>
                <p>
                  <span className="font-semibold text-red-500">*</span>{" "}
                  กรณีย้ายออก กรุณาแจ้งล่วงหน้าอย่างน้อย 30 วัน
                  มิฉะนั้นจะไม่ขอคืนเงินประกันบ้าน
                </p>
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
