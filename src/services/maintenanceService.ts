import api from "./api";

export interface MaintenanceRequest {
  request_id: number;
  room_id: number;
  title: string;
  description?: string;
  photo_url?: string;
  status: "pending" | "in_progress" | "completed";
  cost: number;
  reported_date: string;
  resolved_date?: string;
}

export interface CreateMaintenanceRequestData {
  room_id: number;
  title: string;
  description?: string;
  photo_url?: string;
}

export interface UpdateMaintenanceRequestData {
  title?: string;
  description?: string;
  status?: "pending" | "in_progress" | "completed";
  cost?: number;
  resolved_date?: string;
}

const maintenanceService = {
  // Get maintenance requests with optional filters
  getMaintenanceRequests: async (
    roomId?: number,
    status?: "pending" | "in_progress" | "completed"
  ): Promise<MaintenanceRequest[]> => {
    let url = "/maintenance";
    const params = new URLSearchParams();

    if (roomId) params.append("room_id", roomId.toString());
    if (status) params.append("status", status);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await api.get(url);
    return response.data;
  },

  // Get maintenance request by ID
  getMaintenanceRequestById: async (
    id: number
  ): Promise<MaintenanceRequest> => {
    const response = await api.get(`/maintenance/${id}`);
    return response.data;
  },

  // Create new maintenance request
  createMaintenanceRequest: async (
    data: CreateMaintenanceRequestData
  ): Promise<MaintenanceRequest> => {
    const response = await api.post("/maintenance", data);
    return response.data;
  },

  // Update maintenance request
  updateMaintenanceRequest: async (
    id: number,
    data: UpdateMaintenanceRequestData
  ): Promise<MaintenanceRequest> => {
    const response = await api.put(`/maintenance/${id}`, data);
    return response.data;
  },

  // Update maintenance status
  updateMaintenanceStatus: async (
    id: number,
    status: "pending" | "in_progress" | "completed",
    cost?: number
  ): Promise<MaintenanceRequest> => {
    const updateData: any = { status };
    if (cost !== undefined) {
      updateData.cost = cost;
    }
    if (status === "completed") {
      updateData.resolved_date = new Date().toISOString();
    }

    const response = await api.patch(`/maintenance/${id}/status`, updateData);
    return response.data;
  },

  // Upload maintenance photo
  uploadMaintenancePhoto: async (
    id: number,
    file: File
  ): Promise<{ photo_url: string }> => {
    const formData = new FormData();
    formData.append("photo", file);

    const response = await api.post(`/maintenance/${id}/photo`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};

export default maintenanceService;
