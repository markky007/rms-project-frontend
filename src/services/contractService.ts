import api from "./api";

export interface Contract {
  contract_id: number;
  room_id: number;
  tenant_id: number;
  start_date: string;
  end_date: string;
  deposit: number;
  rent_amount: number;
  is_active: boolean;
  created_at: string;
}

export interface CreateContractData {
  room_id: number;
  tenant_id: number;
  start_date: string;
  end_date: string;
  deposit: number;
  rent_amount: number;
}

export interface UpdateContractData {
  room_id?: number;
  tenant_id?: number;
  start_date?: string;
  end_date?: string;
  deposit?: number;
  rent_amount?: number;
  is_active?: boolean;
}

const contractService = {
  // Get all contracts with optional filters
  getContracts: async (
    roomId?: number,
    tenantId?: number
  ): Promise<Contract[]> => {
    let url = "/contracts";
    const params = new URLSearchParams();

    if (roomId) params.append("room_id", roomId.toString());
    if (tenantId) params.append("tenant_id", tenantId.toString());

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await api.get(url);
    return response.data;
  },

  // Get contract by ID
  getContractById: async (id: number): Promise<Contract> => {
    const response = await api.get(`/contracts/${id}`);
    return response.data;
  },

  // Create new contract
  createContract: async (data: CreateContractData): Promise<Contract> => {
    const response = await api.post("/contracts", data);
    return response.data;
  },

  // Update contract
  updateContract: async (
    id: number,
    data: UpdateContractData
  ): Promise<Contract> => {
    const response = await api.put(`/contracts/${id}`, data);
    return response.data;
  },

  // Terminate contract
  terminateContract: async (id: number): Promise<Contract> => {
    const response = await api.patch(`/contracts/${id}/terminate`, {
      is_active: false,
    });
    return response.data;
  },

  // Get active contracts
  getActiveContracts: async (): Promise<Contract[]> => {
    const response = await api.get("/contracts?is_active=true");
    return response.data;
  },
};

export default contractService;
