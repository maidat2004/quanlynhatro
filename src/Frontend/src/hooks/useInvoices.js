import { useState, useEffect } from 'react';
import { invoiceService } from '../services';

export function useInvoices(tenantId = null) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, [tenantId]);

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (tenantId) {
        data = await invoiceService.getInvoicesByTenant(tenantId);
      } else {
        data = await invoiceService.getInvoices();
      }
      setInvoices(data);
    } catch (err) {
      setError(err.message);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const payInvoice = async (id, paymentMethod) => {
    try {
      await invoiceService.payInvoice(id, paymentMethod);
      await fetchInvoices();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  return {
    invoices,
    loading,
    error,
    refresh: fetchInvoices,
    payInvoice
  };
}
