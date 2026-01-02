import React, { useEffect, useState } from "react";
import {
  Building2,
  Users,
  Wallet,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";
import roomService, {
  type Room,
  type RoomStatus,
} from "../services/roomService";

interface StatusConfig {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: React.ComponentType<{ size?: number }>;
}

type StatusConfigMap = Record<RoomStatus, StatusConfig>;

const RoomDashboard: React.FC = () => {
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

  const statusConfig: StatusConfigMap = {
    vacant: {
      label: "ว่าง",
      color: "text-green-700",
      bg: "bg-green-100",
      border: "border-green-200",
      icon: CheckCircle2,
    },
    occupied: {
      label: "มีผู้เช่า",
      color: "text-blue-700",
      bg: "bg-blue-100",
      border: "border-blue-200",
      icon: Users,
    },
    reserved: {
      label: "จองแล้ว",
      color: "text-yellow-700",
      bg: "bg-yellow-100",
      border: "border-yellow-200",
      icon: Clock,
    },
    maintenance: {
      label: "ซ่อมบำรุง",
      color: "text-red-700",
      bg: "bg-red-100",
      border: "border-red-200",
      icon: AlertTriangle,
    },
  };

  const getStatusStyle = (status: RoomStatus): StatusConfig => {
    return statusConfig[status] || statusConfig.vacant;
  };

  const handleStatusFilter = (status: RoomStatus) => {
    if (filterStatus === status) {
      setFilterStatus("all");
    } else {
      setFilterStatus(status);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
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

  const filteredRooms =
    filterStatus === "all"
      ? rooms
      : rooms.filter((room) => room.status === filterStatus);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">บ้านเช่า</h1>
      <div className="space-y-4">
        <div>
          <p className="text-gray-500 text-lg">
            จัดการและตรวจสอบสถานะบ้านเช่าทั้งหมดของคุณ
          </p>
        </div>

        <div className="flex gap-4 flex-wrap">
          <button
            onClick={() => handleStatusFilter("vacant")}
            className={`px-6 py-2 rounded-xl shadow-sm border flex items-center gap-2 min-w-[100px] justify-center transition-all ${
              filterStatus === "vacant"
                ? "bg-green-100 border-green-300 ring-2 ring-green-500 ring-offset-2"
                : "bg-white border-gray-200 hover:bg-gray-50"
            }`}
          >
            <span className="text-gray-800 font-medium">
              ว่าง: <span className="font-bold">{stats.vacant}</span>
            </span>
          </button>
          <button
            onClick={() => handleStatusFilter("occupied")}
            className={`px-6 py-2 rounded-xl shadow-sm border flex items-center gap-2 min-w-[100px] justify-center transition-all ${
              filterStatus === "occupied"
                ? "bg-blue-100 border-blue-300 ring-2 ring-blue-500 ring-offset-2"
                : "bg-white border-gray-200 hover:bg-gray-50"
            }`}
          >
            <span className="text-gray-800 font-medium">
              มีผู้เช่า: <span className="font-bold">{stats.occupied}</span>
            </span>
          </button>
          <button
            onClick={() => handleStatusFilter("maintenance")}
            className={`px-6 py-2 rounded-xl shadow-sm border flex items-center gap-2 min-w-[100px] justify-center transition-all ${
              filterStatus === "maintenance"
                ? "bg-red-100 border-red-300 ring-2 ring-red-500 ring-offset-2"
                : "bg-white border-gray-200 hover:bg-gray-50"
            }`}
          >
            <span className="text-gray-800 font-medium">
              กำลังซ่อม: <span className="font-bold">{stats.maintenance}</span>
            </span>
          </button>
          <button
            onClick={() => handleStatusFilter("reserved")}
            className={`px-6 py-2 rounded-xl shadow-sm border flex items-center gap-2 min-w-[100px] justify-center transition-all ${
              filterStatus === "reserved"
                ? "bg-yellow-100 border-yellow-300 ring-2 ring-yellow-500 ring-offset-2"
                : "bg-white border-gray-200 hover:bg-gray-50"
            }`}
          >
            <span className="text-gray-800 font-medium">
              จองแล้ว: <span className="font-bold">{stats.reserved}</span>
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {filteredRooms.map((room) => {
          const status = getStatusStyle(room.status);
          const StatusIcon = status.icon;

          return (
            <div
              key={room.room_id}
              className={`rounded-2xl border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer flex flex-col h-full ${status.bg} ${status.border}`}
            >
              {/* Card Header */}
              <div className="px-6 py-4 flex justify-between items-center border-b border-black/5">
                <span className="text-2xl font-bold text-gray-800">
                  {room.house_number}
                </span>
                <div
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold bg-white/50 shadow-sm ring-1 ring-black/5 ${status.color}`}
                >
                  <StatusIcon size={18} />
                  <span>{status.label}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-4 flex-grow">
                {/* House Details */}
                <div className="flex items-start gap-4">
                  <div className="text-gray-600 shrink-0 mt-1">
                    <Building2 size={20} />
                  </div>
                  <div className="pt-0.5">
                    <p className="text-xs text-gray-500 font-medium mb-0.5">
                      รายละเอียด
                    </p>
                    <p className="text-base font-bold text-gray-800 leading-tight">
                      {room.bedrooms} ห้องนอน, {room.bathrooms} ห้องน้ำ
                    </p>
                  </div>
                </div>

                {/* Tenant Info */}
                <div className="flex items-start gap-4">
                  <div
                    className={`shrink-0 mt-1 ${
                      room.tenant_name ? "text-blue-600" : "text-gray-400"
                    }`}
                  >
                    <Users size={20} />
                  </div>
                  <div className="pt-0.5">
                    <p className="text-xs text-gray-500 font-medium mb-0.5">
                      ผู้เช่า
                    </p>
                    <p
                      className={`text-base font-bold leading-tight ${
                        room.tenant_name
                          ? "text-gray-800"
                          : "text-gray-500 italic"
                      }`}
                    >
                      {room.tenant_name || "ไม่มีผู้เช่า"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Price Footer */}
              <div className="px-6 py-4 border-t border-black/5 flex justify-between items-center">
                <div className="flex items-center gap-2 text-gray-700">
                  <Wallet size={16} />
                  <span className="text-sm font-medium">ค่าเช่า</span>
                </div>
                <span className="text-emerald-700 text-lg font-bold">
                  ฿{Number(room.base_rent).toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoomDashboard;
