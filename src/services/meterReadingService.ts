import api from "./api";

export interface MeterReading {
  reading_id: number;
  room_id: number;
  reading_date: string;
  water_reading: number;
  elec_reading: number;
  month_year: string;
  recorded_by?: number;
  created_at: string;
}

export interface CreateMeterReadingData {
  room_id: number;
  reading_date: string;
  water_reading: number;
  elec_reading: number;
  month_year: string;
  recorded_by?: number;
}

export interface UpdateMeterReadingData {
  reading_date?: string;
  water_reading?: number;
  elec_reading?: number;
  month_year?: string;
}

const meterReadingService = {
  // Get meter readings with optional filters
  getMeterReadings: async (
    roomId?: number,
    monthYear?: string
  ): Promise<MeterReading[]> => {
    let url = "/meter-readings";
    const params = new URLSearchParams();

    if (roomId) params.append("room_id", roomId.toString());
    if (monthYear) params.append("month_year", monthYear);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await api.get(url);
    return response.data;
  },

  // Get meter reading by ID
  getMeterReadingById: async (id: number): Promise<MeterReading> => {
    const response = await api.get(`/meter-readings/${id}`);
    return response.data;
  },

  // Create new meter reading
  createMeterReading: async (
    data: CreateMeterReadingData
  ): Promise<MeterReading> => {
    const response = await api.post("/meter-readings", data);
    return response.data;
  },

  // Update meter reading
  updateMeterReading: async (
    id: number,
    data: UpdateMeterReadingData
  ): Promise<MeterReading> => {
    const response = await api.put(`/meter-readings/${id}`, data);
    return response.data;
  },

  // Delete meter reading
  deleteMeterReading: async (id: number): Promise<void> => {
    await api.delete(`/meter-readings/${id}`);
  },
};

export default meterReadingService;
