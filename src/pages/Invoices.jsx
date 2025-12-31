import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FileText,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/billing");
        setInvoices(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch invoices", err);
        setError("Failed to load invoices. Please try again later.");
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
            <CheckCircle size={14} /> Paid
          </span>
        );
      case "pending":
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
            <Clock size={14} /> Pending
          </span>
        );
      case "overdue":
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
            <AlertCircle size={14} /> Overdue
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <FileText className="text-blue-600" />
        Invoices
      </h2>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Invoice ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Room
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Tenant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Issue Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200 text-sm">
              {invoices.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    No invoices found
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr
                    key={invoice.invoice_id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-slate-600">
                      #{String(invoice.invoice_id).padStart(5, "0")}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {invoice.room_number
                        ? `Room ${invoice.room_number}`
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {invoice.tenant_name || "-"}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} className="text-slate-400" />
                        {invoice.month_year}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      ฿
                      {parseFloat(invoice.total_amount).toLocaleString(
                        "en-US",
                        { minimumFractionDigits: 2 }
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(invoice.status)}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(invoice.issue_date).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Invoices;
