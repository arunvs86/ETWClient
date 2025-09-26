// src/hooks/useMyPurchases.ts
import { useQuery } from '@tanstack/react-query';
import { listMyPurchases, type PurchaseKind, type PurchasesResponse } from '@/lib/purchases.api';

export function useMyPurchases(params?: {
  kinds?: PurchaseKind[] | string;
  q?: string;
  page?: number;
  limit?: number;
}) {
  const queryKey = ['me','purchases', params || {}];
  return useQuery({
    queryKey,
    queryFn: () => listMyPurchases(params),
    staleTime: 15_000,
    keepPreviousData: true,
  });
}
