import api from "./api";

export interface Room {
  room_id: number;
  house_number: string;
  bedrooms: number;
  bathrooms: number;
  base_rent: number;
  status: RoomStatus;
  // Tenant information
  current_tenant_id?: number | null;
  tenant_name?: string | null;
  tenant_phone?: string | null;
  water_rate?: number;
  elec_rate?: number;
}

export type RoomStatus = "vacant" | "occupied" | "reserved" | "maintenance";

export interface CreateRoomData {
  house_number: string;
  bedrooms: number;
  bathrooms: number;
  base_rent: number;
  status?: "vacant" | "occupied" | "reserved" | "maintenance";
  current_tenant_id?: number | null;
  water_rate?: number;
  elec_rate?: number;
}

export interface UpdateRoomData {
  house_number?: string;
  bedrooms?: number;
  bathrooms?: number;
  base_rent?: number;
  status?: "vacant" | "occupied" | "reserved" | "maintenance";
  current_tenant_id?: number | null;
  water_rate?: number;
  elec_rate?: number;
}

const roomService = {
  // Get all rooms
  getRooms: async (): Promise<Room[]> => {
    const response = await api.get("/rooms");
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
