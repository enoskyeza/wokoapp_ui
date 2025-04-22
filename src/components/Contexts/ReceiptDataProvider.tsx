// types and context for Receipts
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {Receipt, Pagination, PaginatedResponse} from "@/types";
import {API_BASE} from "@/components/utils/UrlBase";

export interface ReceiptFilters {
  search?: string;
  program?: number;
  status?: 'paid' | 'refunded';
  page?: number;
  page_size?: number | 'all';
}


interface ReceiptsContextData {
  receipts: Receipt[];
  pagination: Pagination | null;
  loading: boolean;
  error: Error | null;
  filters: ReceiptFilters;
  setFilters: (filters: ReceiptFilters) => void;
  fetchReceipt: (id: number) => Promise<Receipt>;
  clearFilters: () => void;
}

const initialFilters: ReceiptFilters = { page: 1, page_size: 25 };
const ReceiptsContext = createContext<ReceiptsContextData | undefined>(undefined);


export const ReceiptsProvider = ({ children }: { children: ReactNode }) => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<ReceiptFilters>(initialFilters);


  const buildQuery = (f: ReceiptFilters) => {
    const params = new URLSearchParams();
    if (f.search)      params.append('search', f.search);
    if (f.program !== undefined) params.append('program', String(f.program));
    if (f.status)      params.append('status', f.status);
    if (f.page)        params.append('page', String(f.page));
    if (f.page_size)   params.append('page_size', String(f.page_size));
    return params.toString();
  };

  // Clear filters back to defaults
  const clearFilters = () => {
    setFilters(initialFilters);
  };

  // Fetch list of receipts whenever filters change
  useEffect(() => {
    const fetchReceipts = async () => {
      setLoading(true);
      setError(null);
      try {
        const qs = buildQuery(filters);
        const res = await fetch(`${API_BASE}register/receipts/?${qs}`);
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data: PaginatedResponse<Receipt> = await res.json();
        setReceipts(data.results);
        setPagination(data.pagination);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    fetchReceipts();
  }, [filters]);

  // Fetch a single receipt by ID
  const fetchReceipt = async (id: number): Promise<Receipt> => {
    const res = await fetch(`/register/receipts/${id}/`);
    if (!res.ok) throw new Error(`Error fetching receipt ${id}: ${res.status}`);
    return res.json();
  };

  return (
    <ReceiptsContext.Provider value={{
      receipts,
      pagination,
      loading,
      error,
      filters,
      setFilters,
      fetchReceipt,
      clearFilters,
    }}>
      {children}
    </ReceiptsContext.Provider>
  );
};

// 5. Custom hook to consume the context
export const useReceipts = (): ReceiptsContextData => {
  const ctx = useContext(ReceiptsContext);
  if (!ctx) throw new Error('useReceipts must be used within a ReceiptsProvider');
  return ctx;
};
