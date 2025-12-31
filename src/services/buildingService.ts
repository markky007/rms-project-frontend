import api from "./api";

export interface Building {
  building_id: number;
  name: string;
  address: string;
  water_rate: number;
  elec_rate: number;
  created_at: string;
}

export interface CreateBuildingData {
  name: string;
  address?: string;
  water_rate?: number;
  elec_rate?: number;
}

export interface UpdateBuildingData {
  name?: string;
  address?: string;
  water_rate?: number;
  elec_rate?: number;
}

const buildingService = {
  // Get all buildings
  getBuildings: async (): Promise<Building[]> => {
    const response = await api.get("/buildings");
    return response.data;
  },

  // Get building by ID
  getBuildingById: async (id: number): Promise<Building> => {
    const response = await api.get(`/buildings/${id}`);
    return response.data;
  },

  // Create new building
  createBuilding: async (data: CreateBuildingData): Promise<Building> => {
    const response = await api.post("/buildings", data);
    return response.data;
  },

  // Update building
  updateBuilding: async (
    id: number,
    data: UpdateBuildingData
  ): Promise<Building> => {
    const response = await api.put(`/buildings/${id}`, data);
    return response.data;
  },

  // Delete building
  deleteBuilding: async (id: number): Promise<void> => {
    await api.delete(`/buildings/${id}`);
  },
};

export default buildingService;
