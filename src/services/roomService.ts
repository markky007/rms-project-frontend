import api from "./api";

export interface Room {
  room_id: number;
  building_id: number;
  room_number: string;
  floor: number;
  base_rent: number;
  status: "vacant" | "occupied" | "reserved" | "maintenance";
}

export interface CreateRoomData {
  building_id: number;
  room_number: string;
  floor: number;
  base_rent: number;
  status?: "vacant" | "occupied" | "reserved" | "maintenance";
}

export interface UpdateRoomData {
  building_id?: number;
  room_number?: string;
  floor?: number;
  base_rent?: number;
  status?: "vacant" | "occupied" | "reserved" | "maintenance";
}

const roomService = {
  // Get all rooms or filter by building
  getRooms: async (buildingId?: number): Promise<Room[]> => {
    const url = buildingId ? `/rooms?building_id=${buildingId}` : "/rooms";
    const response = await api.get(url);
    return response.data;
  },

  // Get room by ID
  getRoomById: async (id: number): Promise<Room> => {
    const response = await api.get(`/rooms/${id}`);
    return response.data;
  },

  // Create new room
  createRoom: async (data: CreateRoomData): Promise<Room> => {
    const response = await api.post("/rooms", data);
    return response.data;
  },

  // Update room
  updateRoom: async (id: number, data: UpdateRoomData): Promise<Room> => {
    const response = await api.put(`/rooms/${id}`, data);
    return response.data;
  },

  // Delete room
  deleteRoom: async (id: number): Promise<void> => {
    await api.delete(`/rooms/${id}`);
  },

  // Update room status
  updateRoomStatus: async (
    id: number,
    status: "vacant" | "occupied" | "reserved" | "maintenance"
  ): Promise<Room> => {
    const response = await api.patch(`/rooms/${id}/status`, { status });
    return response.data;
  },
};

export default roomService;
