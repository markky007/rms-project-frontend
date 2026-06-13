import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Wallet,
  Clock,
  Home,
  ListChecks,
  FileWarning,
  Wrench,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

import roomService, { Room, RoomStatus } from "../services/roomService";
import invoiceService, { Invoice } from "../services/invoiceService";
import maintenanceService, { MaintenanceRequest } from "../services/maintenanceService";

import PageHeader from "../components/patterns/PageHeader";
import Card from "../components/composites/Card";
import IncomeChart, { IncomeChartDatum } from "../components/dashboard/IncomeChart";
import {
  formatTHBCompact,
  currentMonthYear,
  currentMonthLabel,
  thaiMonthShort,
} from "../utils/currency";

// ── Helpers ──────────────────────────────────────────────────────────────

const monthKey = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

/** An invoice counts as overdue if explicitly overdue, or still pending past its due date */
const isOverdue = (inv: Invoice, today: Date): boolean => {
  if (inv.status === "overdue") return true;
  if (inv.status === "pending" && inv.due_date) {
    return new Date(inv.due_date) < today;
  }
  return false;
};

// ── Sub-components ───────────────────────────────────────────────────────

interface StatTileProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconClass: string; // background + text color utility classes for the icon chip
}

const StatTile: React.FC<StatTileProps> = ({ label, value, icon, iconClass }) => (
  <Card borderOnly className="flex flex-col gap-3">
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs font-medium text-muted truncate">{label}</span>
      <div className={`w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0 ${iconClass}`}>
        {icon}
      </div>
    </div>
    <span className="font-mono text-2xl font-bold text-ink leading-none tracking-tight truncate">
      {value}
    </span>
  </Card>
);

interface ActionRowProps {
  to: string;
  icon: React.ReactNode;
  iconClass: string;
  label: string;
  count: number;
}

const ActionRow: React.FC<ActionRowProps> = ({ to, icon, iconClass, label, count }) => (
  <Link
    to={to}
    className="flex items-center gap-3 px-3 py-3 rounded-md min-h-[44px] hover:bg-surface active:bg-surface transition-colors duration-150 group"
  >
    <div className={`w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0 ${iconClass}`}>
      {icon}
    </div>
    <span className="flex-1 text-sm font-medium text-ink truncate">{label}</span>
    <span className="font-mono text-sm font-bold text-ink tabular-nums">{count}</span>
    <ChevronRight className="w-4 h-4 text-muted group-hover:text-ink flex-shrink-0" />
  </Link>
);

// ── Page ─────────────────────────────────────────────────────────────────

const roomStatusMeta: Record<RoomStatus, { label: string; dot: string; text: string }> = {
  vacant: { label: "ว่าง", dot: "bg-success", text: "text-success" },
  occupied: { label: "มีผู้เช่า", dot: "bg-info", text: "text-info" },
  reserved: { label: "จองแล้ว", dot: "bg-warning", text: "text-warning" },
  maintenance: { label: "ซ่อมบำรุง", dot: "bg-error", text: "text-error" },
};

export const Dashboard: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async (): Promise<void> => {
    try {
      const [roomsData, invoicesData, maintenanceData] = await Promise.all([
        roomService.getRooms(),
        invoiceService.getInvoices(),
        maintenanceService.getMaintenanceRequests(),
      ]);
      setRooms(roomsData);
      setInvoices(invoicesData);
      setMaintenance(maintenanceData);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] font-sans">
        <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-xs text-muted mt-2">กำลังโหลดข้อมูลภาพรวม...</span>
      </div>
    );
  }

  const today = new Date();
  const thisMonth = currentMonthYear();

  // ── Financial summary ──
  // Income = invoices marked as "paid" (the payment-recording feature is not live yet)
  const paidInvoices = invoices.filter((inv) => inv.status === "paid");

  const incomeThisMonth = paidInvoices
    .filter((inv) => inv.month_year === thisMonth)
    .reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);

  const outstanding = invoices
    .filter((inv) => inv.status === "pending" || inv.status === "overdue")
    .reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);

  // ── Room occupancy ──
  const roomCounts = {
    total: rooms.length,
    vacant: rooms.filter((r) => r.status === "vacant").length,
    occupied: rooms.filter((r) => r.status === "occupied").length,
    reserved: rooms.filter((r) => r.status === "reserved").length,
    maintenance: rooms.filter((r) => r.status === "maintenance").length,
  };

  // ── Action items ──
  const overdueInvoicesCount = invoices.filter((inv) => isOverdue(inv, today)).length;
  const openMaintenanceCount = maintenance.filter(
    (m) => m.status === "pending" || m.status === "in_progress"
  ).length;
  const totalActions = overdueInvoicesCount + openMaintenanceCount;

  // ── 6-month income trend (paid invoices by month_year) ──
  const trend: IncomeChartDatum[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const key = monthKey(d);
    const value = paidInvoices
      .filter((inv) => inv.month_year === key)
      .reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);
    trend.push({ label: thaiMonthShort(d.getMonth()), value, isCurrent: i === 0 });
  }

  return (
    <div className="flex flex-col gap-6 font-sans">
      <PageHeader
        title="ภาพรวม"
        description={`สรุปภาพรวมบ้านเช่าประจำเดือน${currentMonthLabel()}`}
      />

      {/* Summary tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          label="รายได้เดือนนี้"
          value={formatTHBCompact(incomeThisMonth)}
          icon={<Wallet className="w-5 h-5" />}
          iconClass="bg-primary-light text-primary"
        />
        <StatTile
          label="ยอดค้างชำระ"
          value={formatTHBCompact(outstanding)}
          icon={<Clock className="w-5 h-5" />}
          iconClass="bg-warning-light text-warning"
        />
        <StatTile
          label="ห้องมีผู้เช่า"
          value={`${roomCounts.occupied}/${roomCounts.total}`}
          icon={<Home className="w-5 h-5" />}
          iconClass="bg-info-light text-info"
        />
        <StatTile
          label="งานที่ต้องทำ"
          value={String(totalActions)}
          icon={<ListChecks className="w-5 h-5" />}
          iconClass="bg-surface text-ink"
        />
      </div>

      {/* Income chart + action list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-base font-semibold text-ink">รายได้ย้อนหลัง 6 เดือน</h2>
            <span className="text-[11px] text-muted">เฉพาะใบแจ้งหนี้ที่ชำระแล้ว</span>
          </div>
          <IncomeChart data={trend} />
        </Card>

        <Card className="flex flex-col gap-2">
          <h2 className="font-heading text-base font-semibold text-ink mb-1">งานที่ต้องทำ</h2>
          {totalActions === 0 ? (
            <div className="flex flex-col items-center justify-center text-center gap-2 py-8 select-none">
              <CheckCircle2 className="w-10 h-10 text-success" />
              <p className="text-sm text-muted">ไม่มีงานค้าง ทุกอย่างเรียบร้อยดี 🎉</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {overdueInvoicesCount > 0 && (
                <ActionRow
                  to="/invoices"
                  icon={<FileWarning className="w-5 h-5" />}
                  iconClass="bg-error-light text-error"
                  label="ใบแจ้งหนี้เกินกำหนด"
                  count={overdueInvoicesCount}
                />
              )}
              {openMaintenanceCount > 0 && (
                <ActionRow
                  to="/maintenance"
                  icon={<Wrench className="w-5 h-5" />}
                  iconClass="bg-warning-light text-warning"
                  label="งานแจ้งซ่อมค้าง"
                  count={openMaintenanceCount}
                />
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Room status snapshot */}
      <Card className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base font-semibold text-ink">สถานะห้องพัก</h2>
          <Link
            to="/room-status"
            className="text-xs font-medium text-primary hover:underline flex items-center gap-0.5"
          >
            ดูทั้งหมด
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {roomCounts.total === 0 ? (
          <p className="text-sm text-muted py-4 text-center select-none">ยังไม่มีข้อมูลห้องพักในระบบ</p>
        ) : (
          <>
            {/* Proportion bar */}
            <div className="flex h-2.5 w-full rounded-full overflow-hidden bg-surface">
              {(Object.keys(roomStatusMeta) as RoomStatus[]).map((status) => {
                const count = roomCounts[status];
                if (count === 0) return null;
                return (
                  <div
                    key={status}
                    className={roomStatusMeta[status].dot}
                    style={{ width: `${(count / roomCounts.total) * 100}%` }}
                    title={`${roomStatusMeta[status].label}: ${count}`}
                  />
                );
              })}
            </div>

            {/* Legend / counts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(Object.keys(roomStatusMeta) as RoomStatus[]).map((status) => (
                <div key={status} className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${roomStatusMeta[status].dot}`} />
                  <span className="text-xs text-muted">{roomStatusMeta[status].label}</span>
                  <span className="font-mono text-sm font-bold text-ink ml-auto tabular-nums">
                    {roomCounts[status]}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
