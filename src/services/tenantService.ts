import api from "./api";

export interface Tenant {
  tenant_id: number;
  full_name: string;
  id_card: string;
  phone?: string;
  line_id?: string;
  address?: string;
  photo_url?: string;
  created_at: string;
}

export interface CreateTenantData {
  full_name: string;
  id_card: string;
  phone?: string;
  line_id?: string;
  address?: string;
  photo_url?: string;
}

export interface UpdateTenantData {
  full_name?: string;
  id_card?: string;
  phone?: string;
  line_id?: string;
  address?: string;
  photo_url?: string;
}

const tenantService = {
  // Get all tenants
  getTenants: async (): Promise<Tenant[]> => {
    const response = await api.get("/tenants");
    return response.data;
  },

  // Get tenant by ID
  getTenantById: async (id: number): Promise<Tenant> => {
    const response = await api.get(`/tenants/${id}`);
    return response.data;
  },

  // Create new tenant
  createTenant: async (data: CreateTenantData): Promise<Tenant> => {
    const response = await api.post("/tenants", data);
    return response.data;
  },

  // Update tenant
  updateTenant: async (id: number, data: UpdateTenantData): Promise<Tenant> => {
    const response = await api.put(`/tenants/${id}`, data);
    return response.data;
  },

  // Delete tenant
  deleteTenant: async (id: number): Promise<void> => {
    await api.delete(`/tenants/${id}`);
  },

  // Upload tenant photo
  uploadTenantPhoto: async (
    id: number,
    file: File
  ): Promise<{ photo_url: string }> => {
    const formData = new FormData();
    formData.append("photo", file);

    const response = await api.post(`/tenants/${id}/photo`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};

export default tenantService;
