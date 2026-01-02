import api from "./api";

export interface InvoiceItem {
  item_id: number;
  invoice_id: number;
  description: string;
  amount: number;
  item_type: "rent" | "water" | "electric" | "other";
}

export interface Invoice {
  invoice_id: number;
  contract_id: number;
  month_year: string;
  total_amount: number;
  status: "pending" | "paid" | "overdue" | "cancelled";
  issue_date: string;
  due_date?: string;
  created_at: string;
  items?: InvoiceItem[];
}

export interface CreateInvoiceData {
  contract_id: number;
  month_year: string;
  total_amount: number;
  status?: "pending" | "paid" | "overdue" | "cancelled";
  issue_date?: string;
  due_date?: string;
  items?: Omit<InvoiceItem, "item_id" | "invoice_id">[];
}

export interface UpdateInvoiceData {
  total_amount?: number;
  status?: "pending" | "paid" | "overdue" | "cancelled";
  due_date?: string;
}

const invoiceService = {
  // Get invoices with optional filters
  getInvoices: async (
    status?: string,
    monthYear?: string
  ): Promise<Invoice[]> => {
    let url = "/billing";
    const params = new URLSearchParams();

    if (status) params.append("status", status);
    if (monthYear) params.append("month_year", monthYear);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await api.get(url);
    return response.data;
  },

  // Get invoice by ID with items
  getInvoiceById: async (id: number): Promise<Invoice> => {
    const response = await api.get(`/billing/${id}`);
    return response.data;
  },

  // Create new invoice
  createInvoice: async (data: CreateInvoiceData): Promise<Invoice> => {
    const response = await api.post("/billing/create-invoice", data);
    return response.data;
  },

  // Update invoice status
  updateInvoiceStatus: async (
    id: number,
    status: "pending" | "paid" | "overdue" | "cancelled"
  ): Promise<Invoice> => {
    const response = await api.patch(`/billing/${id}/status`, { status });
    return response.data;
  },

  // Delete invoice
  deleteInvoice: async (id: number): Promise<void> => {
    await api.delete(`/billing/${id}`);
  },

  // Bulk update invoice status
  bulkUpdateStatus: async (
    invoiceIds: number[],
    status: "pending" | "paid" | "overdue" | "cancelled"
  ): Promise<{ message: string; updated_count: number }> => {
    const response = await api.patch("/billing/bulk-status", {
      invoice_ids: invoiceIds,
      status,
    });
    return response.data;
  },

  // Get invoices by contract
  getInvoicesByContract: async (contractId: number): Promise<Invoice[]> => {
    const response = await api.get(`/contracts/${contractId}/invoices`);
    return response.data;
  },
};

export default invoiceService;
