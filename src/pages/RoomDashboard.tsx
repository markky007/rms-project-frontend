import React, { useEffect, useState } from "react";
import roomService, { Room, RoomStatus } from "../services/roomService";
import PageHeader from "../components/patterns/PageHeader";
import Badge from "../components/primitives/Badge";
import Card from "../components/composites/Card";
import EmptyState from "../components/patterns/EmptyState";

interface StatusMeta {
  label: string;
  variant: "success" | "info" | "warning" | "error";
  count: number;
}

export const RoomDashboard: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<RoomStatus | "all">("all");

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async (): Promise<void> => {
    try {
      const data = await roomService.getRooms();
      setRooms(data);
    } catch (error) {
      console.error("Failed to fetch rooms", error);
    } finally {
      setLoading(false);
    }
  };

  const statusMap: Record<RoomStatus, { label: string; variant: "success" | "info" | "warning" | "error" }> = {
    vacant: { label: "ว่าง", variant: "success" },
    occupied: { label: "มีผู้เช่า", variant: "info" },
    reserved: { label: "จองแล้ว", variant: "warning" },
    maintenance: { label: "ซ่อมบำรุง", variant: "error" },
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] font-sans">
        <svg
          className="animate-spin h-8 w-8 text-primary"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span className="text-xs text-muted mt-2">กำลังโหลดข้อมูลห้องพัก...</span>
      </div>
    );
  }

  // Calculate statistics
  const stats = {
    total: rooms.length,
    vacant: rooms.filter((r) => r.status === "vacant").length,
    occupied: rooms.filter((r) => r.status === "occupied").length,
    maintenance: rooms.filter((r) => r.status === "maintenance").length,
    reserved: rooms.filter((r) => r.status === "reserved").length,
  };

  const filters: { label: string; status: RoomStatus | "all"; count: number; activeClass: string }[] = [
    {
      label: "ทั้งหมด",
      status: "all",
      count: stats.total,
      activeClass: "bg-primary text-white border-primary ring-2 ring-primary/20",
    },
    {
      label: "ห้องว่าง",
      status: "vacant",
      count: stats.vacant,
      activeClass: "bg-success-light text-success border-success/30 ring-2 ring-success/20",
    },
    {
      label: "มีผู้เช่า",
      status: "occupied",
      count: stats.occupied,
      activeClass: "bg-info-light text-info border-info/30 ring-2 ring-info/20",
    },
    {
      label: "จองแล้ว",
      status: "reserved",
      count: stats.reserved,
      activeClass: "bg-warning text-white border-warning ring-2 ring-warning/20",
    },
    {
      label: "ซ่อมบำรุง",
      status: "maintenance",
      count: stats.maintenance,
      activeClass: "bg-error text-white border-error ring-2 ring-error/20",
    },
  ];

  const filteredRooms =
    filterStatus === "all"
      ? rooms
      : rooms.filter((room) => room.status === filterStatus);

  return (
    <div className="flex flex-col gap-6 font-sans">
      <PageHeader
        title="ภาพรวมบ้านเช่า"
        description="ตรวจสอบสถานะและข้อมูลการเช่าบ้านพักทั้งหมดในระบบแบบเรียลไทม์"
      />

      {/* Filter toolbar */}
      <div className="flex gap-2 items-center select-none pb-2 border-b border-border-subtle overflow-x-auto scrollbar-none flex-nowrap -mx-4 px-4 lg:mx-0 lg:px-0 lg:flex-wrap">
        {filters.map((f) => {
          const isActive = filterStatus === f.status;
          return (
            <button
              key={f.status}
              onClick={() => setFilterStatus(f.status)}
              className={`px-4 py-1.5 rounded-full border text-xs font-semibold transition-all duration-150 cursor-pointer flex items-center gap-1.5 select-none touch-target flex-shrink-0 ${
                isActive
                  ? f.activeClass
                  : "bg-white text-ink border-border hover:bg-surface hover:border-border"
              }`}
            >
              <span>{f.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  isActive
                    ? f.status === "all" || f.status === "reserved" || f.status === "maintenance"
                      ? "bg-white/20 text-white"
                      : f.status === "vacant"
                        ? "bg-success/25 text-success"
                        : "bg-info/25 text-info"
                    : "bg-surface text-muted"
                }`}
              >
                {f.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Compact Grid of Rooms */}
      {filteredRooms.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredRooms.map((room) => {
            const meta = statusMap[room.status] || { label: "ไม่ระบุ", variant: "neutral" };
            return (
              <Card
                key={room.room_id}
                hoverLift
                className="flex flex-col gap-4 border border-border-subtle justify-between min-h-[170px]"
              >
                {/* Top: Room number + Status badge */}
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="font-heading text-lg font-bold text-ink leading-tight select-all">
                      {room.house_number}
                    </span>
                    <span className="text-[10px] text-muted font-sans select-none">
                      บ้านเช่า
                    </span>
                  </div>
                  <Badge variant={meta.variant} showIcon>
                    {meta.label}
                  </Badge>
                </div>

                {/* Middle: Details (Bedrooms & Bathrooms + Tenant Name) */}
                <div className="flex flex-col gap-2.5 font-sans">
                  {/* Bed icon + details */}
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span>
                      {room.bedrooms} นอน · {room.bathrooms} น้ำ
                    </span>
                  </div>

                  {/* Users icon + Tenant */}
                  <div className="flex items-center gap-2 text-xs">
                    <svg className="w-4 h-4 flex-shrink-0 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {room.tenant_name ? (
                      <span className="text-ink font-semibold truncate max-w-[150px]">
                        คุณ {room.tenant_name}
                      </span>
                    ) : (
                      <span className="text-muted italic select-none">
                        ไม่มีผู้เช่า
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom: Rent Price */}
                <div className="flex items-center justify-between pt-3 border-t border-border-subtle select-none">
                  <span className="text-[10px] font-semibold text-muted font-sans uppercase">
                    ค่าเช่ารายเดือน
                  </span>
                  <span className="font-mono text-sm text-primary font-bold">
                    ฿{Number(room.base_rent).toLocaleString()}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="ไม่พบห้องพักตามตัวกรองนี้"
          description="ลองเปลี่ยนสถานะตัวกรองด้านบนเพื่อตรวจสอบรายการห้องพักแบบอื่นในระบบ"
        />
      )}
    </div>
  );
};

export default RoomDashboard;
