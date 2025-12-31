import React, { useEffect, useState } from "react";
import axios from "axios";

const RoomDashboard = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/rooms");
      setRooms(response.data);
    } catch (error) {
      console.error("Failed to fetch rooms", error);
      // Fallback data for demo if backend is empty/down
      setRooms([
        {
          room_id: 1,
          room_number: "101",
          status: "occupied",
          building_name: "Building A",
        },
        {
          room_id: 2,
          room_number: "102",
          status: "vacant",
          building_name: "Building A",
        },
        {
          room_id: 3,
          room_number: "103",
          status: "maintenance",
          building_name: "Building A",
        },
        {
          room_id: 4,
          room_number: "201",
          status: "reserved",
          building_name: "Building B",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "vacant":
        return "bg-green-100 border-green-500 text-green-700";
      case "occupied":
        return "bg-red-100 border-red-500 text-red-700";
      case "reserved":
        return "bg-yellow-100 border-yellow-500 text-yellow-700";
      case "maintenance":
        return "bg-gray-200 border-gray-500 text-gray-700";
      default:
        return "bg-white border-gray-200";
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-3xl font-bold text-slate-800 mb-6">
        Room Status Dashboard
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {rooms.map((room) => (
          <div
            key={room.room_id}
            className={`p-6 rounded-xl border-l-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${getStatusColor(
              room.status
            )}`}
          >
            <div className="flex justifying-between items-start">
              <div>
                <h3 className="text-2xl font-bold">{room.room_number}</h3>
                <p className="text-sm font-medium opacity-80">
                  {room.building_name}
                </p>
              </div>
              <span className="px-2 py-1 text-xs font-bold uppercase tracking-wide rounded-full bg-white/50">
                {room.status}
              </span>
            </div>
            <div className="mt-4 pt-4 border-t border-black/10 text-sm">
              <p>Rent: ${room.base_rent || "0.00"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomDashboard;
