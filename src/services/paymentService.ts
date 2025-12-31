import api from "./api";

export interface Payment {
  payment_id: number;
  invoice_id: number;
  amount: number;
  slip_image_url?: string;
  payment_date: string;
  status: "pending" | "approved";
  approved_by?: number;
}

export interface CreatePaymentData {
  invoice_id: number;
  amount: number;
  slip_image_url?: string;
  payment_date?: string;
}

const paymentService = {
  // Get all payments or filter by invoice
  getPayments: async (invoiceId?: number): Promise<Payment[]> => {
    const url = invoiceId ? `/payments?invoice_id=${invoiceId}` : "/payments";
    const response = await api.get(url);
    return response.data;
  },

  // Get payment by ID
  getPaymentById: async (id: number): Promise<Payment> => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },

  // Create new payment
  createPayment: async (data: CreatePaymentData): Promise<Payment> => {
    const response = await api.post("/payments", data);
    return response.data;
  },

  // Upload payment slip
  uploadPaymentSlip: async (
    id: number,
    file: File
  ): Promise<{ slip_image_url: string }> => {
    const formData = new FormData();
    formData.append("slip", file);

    const response = await api.post(`/payments/${id}/slip`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Approve payment
  approvePayment: async (id: number, userId: number): Promise<Payment> => {
    const response = await api.patch(`/payments/${id}/approve`, {
      status: "approved",
      approved_by: userId,
    });
    return response.data;
  },

  // Get pending payments
  getPendingPayments: async (): Promise<Payment[]> => {
    const response = await api.get("/payments?status=pending");
    return response.data;
  },
};

export default paymentService;
