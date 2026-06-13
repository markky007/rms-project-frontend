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
  Receipt,
  Printer,
  Plus,
} from "lucide-react";
import tenantService from "../services/tenantService";
import contractService from "../services/contractService";
import { bahtText } from "../utils/bahttext";
import { QRCodeCanvas } from "qrcode.react";
import html2canvas from "html2canvas";
import invoiceService, { type Invoice } from "../services/invoiceService";
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

const formatThaiDate = (dateStr: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const thaiMonths = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];
  return `${d.getDate()} ${thaiMonths[d.getMonth()]} ${d.getFullYear() + 543}`;
};

const DEFAULT_RECEIPT_NOTES = `* กรุณาชําระทั้งหมดไม่เกินวันที่ 5 ของเดือน หากเกินกําหนดขอเก็บเพิ่มวันละ 50 บาทจนกว่าจะจ่ายครบ
* ห้ามนําสัตว์เลี้ยงทุกชนิดมาเลี้ยง (หากเกิดความเสียหายจะต้องรับผิดชอบให้สภาพคงเดิมหรือปรับเท่ามูลค่าของสิ่งนั้น)
* กรณีย้ายออก กรุณาแจ้งล่วงหน้าอย่างน้อย 30 วัน มิฉะนั้นจะไม่ขอคืนเงินประกันบ้าน`;

const Invoices: React.FC = () => {
  const { showAlert } = useAlert();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Receipt Modal states
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<{
    invoice: Invoice;
    tenant: any;
    contract: any;
  } | null>(null);
  const [receiptDate, setReceiptDate] = useState<string>("");
  const [receiptPaymentMethod, setReceiptPaymentMethod] = useState<"cash" | "transfer">("cash");
  const [receiptNotes, setReceiptNotes] = useState<string>("");
  const [receiptAdjustments, setReceiptAdjustments] = useState<{ description: string; amount: number }[]>([]);
  const receiptRef = useRef<HTMLDivElement>(null);

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
  const [activeTab, setActiveTab] = useState<"normal" | "move_out">("normal");

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

  const handleOpenReceipt = async (invoiceId: number) => {
    try {
      setIsUpdating(true);
      const invoice = await invoiceService.getInvoiceById(invoiceId);
      
      let contract = null;
      let tenant = null;
      if (invoice.contract_id) {
        try {
          contract = await contractService.getContractById(invoice.contract_id);
          if (contract.tenant_id) {
            tenant = await tenantService.getTenantById(contract.tenant_id);
          }
        } catch (cErr) {
          console.error("Failed to load contract/tenant details", cErr);
        }
      }
      
      setReceiptData({
        invoice,
        tenant,
        contract,
      });
      
      setReceiptDate(new Date().toISOString().split("T")[0]);
      setReceiptPaymentMethod(invoice.status === "paid" ? "transfer" : "cash");
      setReceiptAdjustments([]);
      setReceiptNotes(DEFAULT_RECEIPT_NOTES);
      setIsReceiptModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch receipt data", err);
      showAlert({ message: "ไม่สามารถออกใบเสร็จรับเงินได้เนื่องจากโหลดข้อมูลไม่สำเร็จ", type: "error" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDownloadReceipt = async () => {
    if (receiptRef.current && receiptData) {
      try {
        const canvas = await html2canvas(receiptRef.current, {
          scale: 2,
          backgroundColor: "#ffffff",
          useCORS: true,
          allowTaint: true,
        });
        const link = document.createElement("a");
        link.download = `receipt-${receiptData.invoice.invoice_id}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      } catch (err) {
        console.error("Failed to download receipt", err);
        showAlert({ message: "ดาวน์โหลดใบเสร็จไม่สำเร็จ", type: "error" });
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
    // Change calculation to start from next month (remove -1)
    // For December (12), parseInt(12) creates date in January of next year
    const dueDate = new Date(parseInt(year), parseInt(month), 5); // 5th of next month

    // Reset time components to compare dates only
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

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

  const filteredInvoices = invoices
    .filter((invoice) => {
      // 1. Month/Year Filter
      const monthYear = invoice.month_year;
      if (selectedMonth || selectedYear) {
        if (monthYear) {
          const [year, month] = monthYear.split("-");
          if (selectedMonth && month !== selectedMonth) return false;
          if (selectedYear && year !== selectedYear) return false;
        }
      }

      // 2. Tab Filter
      const type = invoice.invoice_type || "normal";
      if (type !== activeTab) return false;

      return true;
    })
    .sort((a, b) => {
      // ใหม่ไปเก่า: วันที่ออกใบก่อน แล้วค่อย invoice_id (สอดคล้องกับลำดับเวลา)
      const tA = a.issue_date
        ? new Date(a.issue_date).getTime()
        : Number.NEGATIVE_INFINITY;
      const tB = b.issue_date
        ? new Date(b.issue_date).getTime()
        : Number.NEGATIVE_INFINITY;
      if (
        Number.isFinite(tA) &&
        Number.isFinite(tB) &&
        tB !== tA
      ) {
        return tB - tA;
      }
      return b.invoice_id - a.invoice_id;
    });

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex);

  return (
    <div className="p-8 invoices-page-container">
      <div className="no-print">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">ใบแจ้งหนี้</h1>

      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        <button
          className={`pb-2 px-1 mr-2 ${
            activeTab === "normal"
              ? "border-b-2 border-blue-500 text-blue-600 font-semibold"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => {
            setActiveTab("normal");
            setCurrentPage(1);
            setSelectedIds(new Set()); // Clear selection when switching tabs
          }}
        >
          บิลค่าเช่า
        </button>
        <button
          className={`pb-2 px-1 ${
            activeTab === "move_out"
              ? "border-b-2 border-blue-500 text-blue-600 font-semibold"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => {
            setActiveTab("move_out");
            setCurrentPage(1);
            setSelectedIds(new Set());
          }}
        >
          แจ้งย้ายออก
        </button>
      </div>

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
                      {invoice.invoice_type === "move_out" ? (
                        invoice.total_amount < 0 ? (
                          <span className="text-green-600">
                            จ่ายคืน: ฿
                            {Math.abs(
                              parseFloat(String(invoice.total_amount)),
                            ).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        ) : invoice.total_amount > 0 ? (
                          <span className="text-red-600">
                            เก็บเพิ่ม: ฿
                            {parseFloat(
                              String(invoice.total_amount),
                            ).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        ) : (
                          <span className="text-gray-500">
                            ไม่มียอดค้างชำระ
                          </span>
                        )
                      ) : (
                        <>
                          ฿
                          {parseFloat(
                            String(invoice.total_amount),
                          ).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </>
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
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(invoice.invoice_id)}
                          className="w-8 h-8 text-xs font-medium rounded-full bg-surface text-ink hover:bg-primary hover:text-white transition-all duration-150 inline-flex items-center justify-center cursor-pointer"
                          title="ดูรายละเอียด"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleOpenReceipt(invoice.invoice_id)}
                          className="w-8 h-8 text-xs font-medium rounded-full bg-surface text-ink hover:bg-success hover:text-white transition-all duration-150 inline-flex items-center justify-center cursor-pointer"
                          title="ออกใบเสร็จรับเงิน"
                        >
                          <Receipt size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(invoice.invoice_id)}
                          className="w-8 h-8 text-xs font-medium rounded-full bg-error-light text-error hover:bg-error hover:text-white transition-all duration-150 inline-flex items-center justify-center cursor-pointer"
                          title="ลบใบแจ้งหนี้"
                        >
                          <Trash2 size={16} />
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
                        // Check for prorated rent
                        const proratedMatch = item.description.match(
                          /Room Rent \(Prorated: (\d+) days @ (\d+)\/day\)/,
                        );
                        if (proratedMatch) {
                          const [, days, rate] = proratedMatch;
                          displayDesc = `ค่าเช่าห้อง (${days} วัน x ${rate} บาท)`;
                        } else {
                          displayDesc = "ค่าเช่าห้อง";
                        }
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
                        {selectedInvoice.invoice_type === "move_out"
                          ? selectedInvoice.total_amount < 0
                            ? "ยอดจ่ายคืนลูกบ้าน"
                            : selectedInvoice.total_amount > 0
                              ? "ยอดเรียกเก็บเพิ่ม"
                              : "ยอดรวมสุทธิ"
                          : "ยอดรวมทั้งสิ้น"}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-bold text-lg ${
                          selectedInvoice.invoice_type === "move_out" &&
                          selectedInvoice.total_amount < 0
                            ? "text-green-600"
                            : "text-emerald-600"
                        }`}
                      >
                        ฿
                        {Math.abs(
                          Number(selectedInvoice.total_amount),
                        ).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {selectedInvoice.invoice_type !== "move_out" && (
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
                    />
                  </div>
                  <p className="mt-4 text-sm text-gray-500">
                    ID: {PROMPTPAY_ID}
                  </p>
                  <div className="mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    ระบุยอดเงินอัตโนมัติ
                  </div>
                </div>
              )}

              {selectedInvoice.invoice_type !== "move_out" && (
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
              )}
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

      {/* Receipt Modal */}
      {isReceiptModalOpen && receiptData && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto receipt-modal-overlay">
          <div className="bg-slate-100 rounded-xl shadow-2xl w-full max-w-6xl flex flex-col md:flex-row max-h-[95vh] overflow-hidden">
            
            {/* Left Column: Options / Editing Panel (2/5 width) */}
            <div className="no-print receipt-options-panel w-full md:w-[35%] bg-white p-6 border-r border-slate-200 flex flex-col overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Receipt className="text-success" size={20} />
                  ตั้งค่าใบเสร็จรับเงิน
                </h3>
                <button 
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-full transition text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 flex-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                    วันที่ออกใบเสร็จ
                  </label>
                  <input 
                    type="date"
                    value={receiptDate}
                    onChange={(e) => setReceiptDate(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                    ช่องทางการชำระเงิน
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                      <input 
                        type="radio" 
                        name="pay_method"
                        checked={receiptPaymentMethod === "cash"}
                        onChange={() => setReceiptPaymentMethod("cash")}
                        className="text-primary focus:ring-primary"
                      />
                      เงินสด
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                      <input 
                        type="radio" 
                        name="pay_method"
                        checked={receiptPaymentMethod === "transfer"}
                        onChange={() => setReceiptPaymentMethod("transfer")}
                        className="text-primary focus:ring-primary"
                      />
                      โอนผ่านบัญชี
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                    หมายเหตุ / ค่าปรับปรุงอื่น ๆ (ย้ายออก, หักมัดจำ)
                  </label>
                  <textarea 
                    rows={3}
                    placeholder="เช่น ค่าทำความสะอาดค้างจ่าย, คืนเงินประกัน..."
                    value={receiptNotes}
                    onChange={(e) => setReceiptNotes(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                    รายการปรับปรุงอื่น ๆ (เช่น ค่าบริการ, ส่วนลด, คืนมัดจำ)
                  </label>
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {receiptAdjustments.map((adj, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <input 
                          type="text" 
                          placeholder="รายละเอียด เช่น ค่าทำความสะอาด" 
                          value={adj.description}
                          onChange={(e) => {
                            const newAdj = [...receiptAdjustments];
                            newAdj[index].description = e.target.value;
                            setReceiptAdjustments(newAdj);
                          }}
                          className="flex-1 p-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                        <input 
                          type="number" 
                          placeholder="บาท" 
                          value={adj.amount === 0 ? "" : adj.amount}
                          onChange={(e) => {
                            const newAdj = [...receiptAdjustments];
                            newAdj[index].amount = Number(e.target.value);
                            setReceiptAdjustments(newAdj);
                          }}
                          className="w-20 p-2 border border-slate-200 rounded-lg text-xs text-right focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                        <button 
                          type="button"
                          onClick={() => {
                            setReceiptAdjustments(receiptAdjustments.filter((_, i) => i !== index));
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setReceiptAdjustments([...receiptAdjustments, { description: "", amount: 0 }])}
                    className="mt-2 w-full py-1.5 border border-dashed border-primary/40 text-primary hover:bg-primary-light rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={14} /> เพิ่มรายการปรับปรุง
                  </button>
                  <p className="text-[10px] text-slate-400 mt-1">
                    * ใส่เครื่องหมายลบ (-) สำหรับส่วนลดหรือการจ่ายคืนเงินประกัน
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex flex-col gap-3">
                <button
                  onClick={() => window.print()}
                  className="w-full py-2.5 bg-success text-white rounded-lg hover:bg-success-hover font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer size={18} />
                  พิมพ์ / ดาวน์โหลด PDF
                </button>
                <button
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="w-full py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-semibold transition cursor-pointer"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>

            {/* Right Column: PDF Preview Sheet (3/5 width) */}
            <div className="flex-1 bg-slate-200 p-4 md:p-8 overflow-auto flex justify-start md:justify-center items-start receipt-preview-container">
              
              {/* Printable sheet element */}
              <div 
                ref={receiptRef}
                id="print-receipt-area"
                className="bg-white w-[750px] shadow-lg p-10 flex flex-col text-slate-800 shrink-0 mx-auto print-receipt-sheet"
                style={{ minHeight: "950px", fontFamily: "'Inter', 'Kanit', sans-serif" }}
              >
                {/* Header Orange Banner */}
                <div className="bg-[#fdecd2] border border-[#f7cb9f] rounded-[24px] p-5 flex justify-between items-center mb-6">
                  <div className="flex-1">
                    <h1 className="text-3xl font-extrabold text-[#b55113] tracking-wide mb-1" style={{ fontFamily: 'Kanit' }}>
                      บ้านเช่าในสวน
                    </h1>
                    <p className="text-[#b55113] text-xs font-semibold">
                      Tel. : 085-3994499 &nbsp;&nbsp; Email : sasinanwongviroj@gmail.com
                    </p>
                    
                    <div className="flex gap-4 mt-3 text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 bg-[#1877f2] rounded-full flex items-center justify-center text-white font-bold text-[11px]">f</div>
                        <span className="text-[#b55113] font-bold">Facebook page :</span> 
                        <span className="text-[#b55113] font-medium">บ้านเช่ามาบอน12</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 bg-[#06c755] rounded-full flex items-center justify-center text-white font-bold text-[8px]">LINE</div>
                        <span className="text-[#b55113] font-bold">ID Line :</span> 
                        <span className="text-[#b55113] font-medium">i3ai3ymind</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Logo Image */}
                  <div className="w-20 h-20 flex items-center justify-center ml-4">
                    <img 
                      src="/icon.png" 
                      alt="House Logo" 
                      className="object-contain max-h-full"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <svg className="w-16 h-16 text-[#b55113] block" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3L2 12h3v8h14v-8h3L12 3zm0 2.5l7 6.3V18H5v-6.2l7-6.3zm-3 4.5h2v3H9v-3zm4 0h2v3h-2v-3z" />
                    </svg>
                  </div>
                </div>

                {/* Document Title */}
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-800 tracking-wide" style={{ fontFamily: 'Kanit' }}>
                    ใบเสร็จรับเงิน / Receipt
                  </h2>
                  <div className="w-full h-[3px] bg-slate-800 mt-2" />
                </div>

                {/* Metadata details block */}
                <div className="grid grid-cols-2 gap-8 text-sm mb-6 pb-2">
                  <div className="space-y-2.5">
                    <div className="flex">
                      <span className="font-semibold text-slate-800 w-16" style={{ fontFamily: 'Kanit' }}>เลขที่</span>
                      <span className="text-slate-600">
                        {String(receiptData.invoice.invoice_id).padStart(5, "0")}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold text-slate-800 w-16" style={{ fontFamily: 'Kanit' }}>วันที่</span>
                      <span className="text-slate-600">
                        {formatThaiDate(receiptDate)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start">
                      <span className="font-semibold text-slate-800 w-24 shrink-0" style={{ fontFamily: 'Kanit' }}>ชื่อลูกค้า</span>
                      <span className="text-slate-600 font-medium">
                        {receiptData.tenant?.full_name || receiptData.invoice.tenant_name || "-"}
                      </span>
                    </div>
                    <div className="flex items-start">
                      <span className="font-semibold text-slate-800 w-24 shrink-0" style={{ fontFamily: 'Kanit' }}>ที่อยู่</span>
                      <span className="text-slate-600 leading-relaxed">
                        {receiptData.tenant?.address || "-"}
                      </span>
                    </div>
                    <div className="flex items-start">
                      <span className="font-semibold text-slate-800 w-24 shrink-0" style={{ fontFamily: 'Kanit' }}>เลขผู้เสียภาษี</span>
                      <span className="text-slate-600">
                        {receiptData.tenant?.id_card || "-"}
                      </span>
                    </div>
                    <div className="flex items-start">
                      <span className="font-semibold text-slate-800 w-24 shrink-0" style={{ fontFamily: 'Kanit' }}>เบอร์โทรศัพท์</span>
                      <span className="text-slate-600">
                        {receiptData.tenant?.phone || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="border border-slate-800 overflow-hidden mb-6 flex-1">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-900 text-white font-semibold" style={{ fontFamily: 'Kanit' }}>
                        <th className="px-4 py-2.5 text-center border-r border-slate-700 w-[10%]">ลำดับ</th>
                        <th className="px-4 py-2.5 text-left border-r border-slate-700 w-[50%]">รายการ</th>
                        <th className="px-4 py-2.5 text-center border-r border-slate-700 w-[15%]">จำนวน</th>
                        <th className="px-4 py-2.5 text-right border-r border-slate-700 w-[12.5%]">ราคา/หน่วย</th>
                        <th className="px-4 py-2.5 text-right w-[12.5%]">ราคารวม</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {receiptData.invoice.items?.map((item, index) => {
                        // Display item text
                        let displayDesc = item.description;
                        const inv = receiptData.invoice as any;
                        let qtyText = "1";
                        let rateValue = Number(item.amount);

                        const parseDetails = () => {
                          const match = item.description.match(/\((\d+(?:\.\d+)?)\s*units\s*@\s*(\d+(?:\.\d+)?)\/unit\)/i);
                          if (match) {
                            return {
                              qty: match[1],
                              rate: parseFloat(match[2])
                            };
                          }
                          return null;
                        };

                        if (item.item_type === "rent") {
                          const proratedMatch = item.description.match(
                            /Room Rent \(Prorated: (\d+) days @ (\d+)\/day\)/,
                          );
                          if (proratedMatch) {
                            const [, days, rate] = proratedMatch;
                            displayDesc = `ค่าเช่าห้อง (${days} วัน)`;
                          } else {
                            // Extract Thai month name
                            const [yearStr, monthStr] = receiptData.invoice.month_year.split("-");
                            const thaiMonths = [
                              "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
                              "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
                            ];
                            const monthName = thaiMonths[parseInt(monthStr) - 1];
                            const thaiYear = parseInt(yearStr) + 543;
                            displayDesc = `ค่าเช่าบ้านประจำเดือน ${monthName} ${thaiYear}`;
                          }
                        } else if (item.item_type === "water") {
                          displayDesc = "ค่าน้ำ";
                          const parsed = parseDetails();
                          
                          const current = Number(inv.current_water_reading);
                          const prev = Number(inv.prev_water_reading);
                          const waterRate = Number(inv.water_rate);
                          
                          if (!isNaN(current) && !isNaN(prev) && current > 0) {
                            qtyText = `${current - prev} (${current} - ${prev})`;
                          } else if (parsed) {
                            qtyText = parsed.qty;
                          }
                          
                          if (!isNaN(waterRate) && waterRate > 0) {
                            rateValue = waterRate;
                          } else if (parsed) {
                            rateValue = parsed.rate;
                          }
                        } else if (item.item_type === "electric") {
                          displayDesc = "ค่าไฟ";
                          const parsed = parseDetails();
                          
                          const current = Number(inv.current_elec_reading);
                          const prev = Number(inv.prev_elec_reading);
                          const elecRate = Number(inv.elec_rate);
                          
                          if (!isNaN(current) && !isNaN(prev) && current > 0) {
                            qtyText = `${current - prev} (${current} - ${prev})`;
                          } else if (parsed) {
                            qtyText = parsed.qty;
                          }
                          
                          if (!isNaN(elecRate) && elecRate > 0) {
                            rateValue = elecRate;
                          } else if (parsed) {
                            rateValue = parsed.rate;
                          }
                        }

                        return (
                          <tr key={index} className="h-10">
                            <td className="px-4 py-2 text-center border-r border-slate-800 font-mono text-slate-600">
                              {index + 1}
                            </td>
                            <td className="px-4 py-2 border-r border-slate-800 text-slate-800 font-medium">
                              {displayDesc}
                            </td>
                            <td className="px-4 py-2 text-center border-r border-slate-800 font-medium">
                              {qtyText}
                            </td>
                            <td className="px-4 py-2 text-right border-r border-slate-800 font-mono text-slate-700">
                              {rateValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-4 py-2 text-right font-bold font-mono text-slate-800">
                              {Number(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        );
                      })}
                      
                      {receiptAdjustments.map((adj, index) => {
                        const itemIndex = (receiptData.invoice.items?.length || 0) + index;
                        return (
                          <tr key={`adj-${index}`} className="h-10">
                            <td className="px-4 py-2 text-center border-r border-slate-800 font-mono text-slate-600">
                              {itemIndex + 1}
                            </td>
                            <td className="px-4 py-2 border-r border-slate-800 text-slate-800 font-medium">
                              {adj.description || "(ไม่มีรายละเอียด)"}
                            </td>
                            <td className="px-4 py-2 text-center border-r border-slate-800 font-medium">
                              1
                            </td>
                            <td className="px-4 py-2 text-right border-r border-slate-800 font-mono text-slate-700">
                              {adj.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-4 py-2 text-right font-bold font-mono text-slate-800">
                              {adj.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        );
                      })}
                      
                      {/* Fill empty rows to make layout look exactly like a printable invoice template */}
                      {Array.from({ length: Math.max(0, 5 - (receiptData.invoice.items?.length || 0) - receiptAdjustments.length) }).map((_, idx) => (
                        <tr key={`empty-${idx}`} className="h-10">
                          <td className="px-4 py-2 text-center border-r border-slate-800 font-mono text-slate-300">
                            {(receiptData.invoice.items?.length || 0) + receiptAdjustments.length + idx + 1}
                          </td>
                          <td className="px-4 py-2 border-r border-slate-800 text-slate-300">-</td>
                          <td className="px-4 py-2 text-center border-r border-slate-800 text-slate-300">-</td>
                          <td className="px-4 py-2 text-right border-r border-slate-800 text-slate-300">-</td>
                          <td className="px-4 py-2 text-right text-slate-300">-</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Notes and Totals Container */}
                <div className="border border-slate-800 grid grid-cols-5 text-sm mb-6">
                  {/* Notes Column (3/5 width) */}
                  <div className="col-span-3 p-4 border-r border-slate-800 flex flex-col justify-between">
                    <div>
                      <span className="font-bold text-slate-800 block mb-1.5" style={{ fontFamily: 'Kanit' }}>หมายเหตุ</span>
                      <p className="text-slate-600 leading-relaxed text-xs break-all whitespace-pre-line">
                        {receiptNotes || "-"}
                      </p>
                    </div>
                  </div>
                  
                  {/* Totals Column (2/5 width) */}
                  <div className="col-span-2 divide-y divide-slate-800">
                    <div className="px-4 py-3 flex justify-between items-center h-12">
                      <span className="font-semibold text-slate-800" style={{ fontFamily: 'Kanit' }}>ราคารวม</span>
                      <span className="font-bold font-mono">
                        {(receiptData.invoice.items?.reduce((sum, i) => sum + Number(i.amount), 0) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="px-4 py-3 flex justify-between items-center h-12">
                      <span className="font-semibold text-slate-800" style={{ fontFamily: 'Kanit' }}>ค่าปรับปรุงอื่น ๆ</span>
                      <span className="font-bold font-mono text-slate-600">
                        {receiptAdjustments.reduce((sum, adj) => sum + adj.amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Grand Total Area */}
                <div className="border border-slate-800 bg-slate-50 p-4 flex justify-between items-center mb-8">
                  <div>
                    <span className="font-bold text-slate-800 block text-xs mb-1" style={{ fontFamily: 'Kanit' }}>จำนวนเงินรวมทั้งสิ้น</span>
                    <span className="text-xs font-semibold text-slate-600">
                      ({bahtText(Math.max(0, (receiptData.invoice.items?.reduce((sum, i) => sum + Number(i.amount), 0) || 0) + receiptAdjustments.reduce((sum, adj) => sum + adj.amount, 0)))})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black font-mono text-slate-900">
                      {Math.max(0, (receiptData.invoice.items?.reduce((sum, i) => sum + Number(i.amount), 0) || 0) + receiptAdjustments.reduce((sum, adj) => sum + adj.amount, 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Bottom Segment: Paid By and Signatures */}
                <div className="grid grid-cols-2 gap-8 text-sm mt-auto pt-6 border-t border-slate-200">
                  {/* Payment Method Option */}
                  <div className="space-y-4">
                    <span className="font-bold text-slate-800 block mb-2" style={{ fontFamily: 'Kanit' }}>ชำระเงินโดย</span>
                    <div className="space-y-3 pl-1">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full border-2 border-slate-800 flex items-center justify-center">
                          {receiptPaymentMethod === "cash" && (
                            <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                          )}
                        </div>
                        <span className="text-slate-800 font-semibold" style={{ fontFamily: 'Kanit' }}>เงินสด</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full border-2 border-slate-800 flex items-center justify-center">
                          {receiptPaymentMethod === "transfer" && (
                            <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                          )}
                        </div>
                        <span className="text-slate-800 font-semibold" style={{ fontFamily: 'Kanit' }}>โอนผ่านบัญชี</span>
                      </div>
                    </div>

                    {receiptPaymentMethod === "transfer" && (
                      <div className="mt-4 flex flex-col items-start gap-1">
                        <div className="bg-white p-2 border border-slate-300 rounded-lg flex flex-col items-center">
                          <QRCodeCanvas
                            value={generatePromptPayPayload(
                              PROMPTPAY_ID,
                              Math.max(0, (receiptData.invoice.items?.reduce((sum, i) => sum + Number(i.amount), 0) || 0) + receiptAdjustments.reduce((sum, adj) => sum + adj.amount, 0)),
                            )}
                            size={100}
                            level={"M"}
                            includeMargin={false}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold" style={{ fontFamily: 'Kanit' }}>
                          พร้อมเพย์: {PROMPTPAY_ID}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Signatures */}
                  <div className="space-y-8 flex flex-col justify-end pt-4">
                    <div className="space-y-1.5 text-right pr-2">
                      <div className="flex justify-between items-end gap-2">
                        <div className="border-b border-dotted border-slate-500 flex-1 min-w-[120px] h-6 text-center text-slate-500 font-medium">
                          {receiptData.tenant?.full_name || receiptData.invoice.tenant_name}
                        </div>
                        <span className="font-bold text-slate-800 text-xs tracking-wider" style={{ fontFamily: 'Kanit' }}>ผู้ชำระ</span>
                      </div>
                      <div className="flex justify-between items-end gap-2 text-slate-500 text-xs">
                        <span>วันที่</span>
                        <div className="border-b border-dotted border-slate-500 flex-1 h-5 text-center">
                          {formatThaiDate(receiptDate)}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-right pr-2">
                      <div className="flex justify-between items-end gap-2">
                        <div className="border-b border-dotted border-slate-500 flex-1 min-w-[120px] h-6 text-center text-slate-850 font-semibold" style={{ fontFamily: 'Kanit' }}>
                          ศศินันท์ วงษ์วิโรจน์
                        </div>
                        <span className="font-bold text-slate-800 text-xs tracking-wider" style={{ fontFamily: 'Kanit' }}>ผู้รับชำระ</span>
                      </div>
                      <div className="flex justify-between items-end gap-2 text-slate-500 text-xs">
                        <span>วันที่</span>
                        <div className="border-b border-dotted border-slate-500 flex-1 h-5 text-center">
                          {formatThaiDate(receiptDate)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
