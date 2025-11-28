import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, endpoints } from '@/api/client';
import type { Payment, Payout, Invoice, ConnectAccountStatus, ApiResponse, PaginatedResponse } from '@/types';

// Query keys
export const paymentKeys = {
  all: ['payments'] as const,
  list: () => [...paymentKeys.all, 'list'] as const,
  payouts: () => [...paymentKeys.all, 'payouts'] as const,
  invoices: () => [...paymentKeys.all, 'invoices'] as const,
  connectStatus: () => [...paymentKeys.all, 'connect-status'] as const,
  stats: () => [...paymentKeys.all, 'stats'] as const,
};

interface PaymentStats {
  totalEarnings: number;
  thisMonthEarnings: number;
  pendingBalance: number;
  currency: string;
}

// Fetch payments
async function fetchPayments(): Promise<Payment[]> {
  try {
    const response = await api.get<ApiResponse<PaginatedResponse<Payment>>>(endpoints.payments.list);
    return response.data?.data || [];
  } catch {
    return [];
  }
}

// Fetch payouts
async function fetchPayouts(): Promise<Payout[]> {
  try {
    const response = await api.get<ApiResponse<PaginatedResponse<Payout>>>(endpoints.payouts.list);
    return response.data?.data || [];
  } catch {
    return [];
  }
}

// Fetch invoices
async function fetchInvoices(): Promise<Invoice[]> {
  try {
    const response = await api.get<ApiResponse<PaginatedResponse<Invoice>>>(endpoints.invoices.list);
    return response.data?.data || [];
  } catch {
    return [];
  }
}

// Fetch Connect account status
async function fetchConnectStatus(): Promise<ConnectAccountStatus> {
  try {
    const response = await api.get<ApiResponse<ConnectAccountStatus>>(endpoints.payments.connectStatus);
    return response.data;
  } catch {
    return { hasAccount: false, chargesEnabled: false, payoutsEnabled: false, onboardingComplete: false };
  }
}

// Hook for payments list
export function usePayments() {
  return useQuery({
    queryKey: paymentKeys.list(),
    queryFn: fetchPayments,
    staleTime: 1000 * 60 * 2,
  });
}

// Hook for payouts list
export function usePayouts() {
  return useQuery({
    queryKey: paymentKeys.payouts(),
    queryFn: fetchPayouts,
    staleTime: 1000 * 60 * 2,
  });
}

// Hook for invoices list
export function useInvoices() {
  return useQuery({
    queryKey: paymentKeys.invoices(),
    queryFn: fetchInvoices,
    staleTime: 1000 * 60 * 2,
  });
}

// Hook for Connect account status
export function useConnectStatus() {
  return useQuery({
    queryKey: paymentKeys.connectStatus(),
    queryFn: fetchConnectStatus,
    staleTime: 1000 * 60 * 5,
  });
}

// Hook for payment stats (derived from payments)
export function usePaymentStats() {
  const { data: payments = [], isLoading } = usePayments();
  
  const stats: PaymentStats = {
    totalEarnings: 0,
    thisMonthEarnings: 0,
    pendingBalance: 0,
    currency: 'EUR',
  };

  if (payments.length > 0) {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    payments.forEach((payment) => {
      if (payment.status === 'succeeded') {
        stats.totalEarnings += payment.expertPayout || payment.amount;
        const paymentDate = new Date(payment.createdAt);
        if (paymentDate.getMonth() === thisMonth && paymentDate.getFullYear() === thisYear) {
          stats.thisMonthEarnings += payment.expertPayout || payment.amount;
        }
      } else if (payment.status === 'pending') {
        stats.pendingBalance += payment.expertPayout || payment.amount;
      }
    });

    stats.currency = payments[0]?.currency?.toUpperCase() || 'EUR';
  }

  return { stats, isLoading };
}

// Mutation for requesting payout
export function useRequestPayout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (amount: number) => {
      const response = await api.post<ApiResponse<Payout>>(endpoints.payouts.request, { amount });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.payouts() });
      queryClient.invalidateQueries({ queryKey: paymentKeys.list() });
    },
  });
}

// Mutation for creating Connect account
export function useCreateConnectAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (country: string) => {
      const response = await api.post<ApiResponse<{ accountId: string; onboardingUrl: string }>>(
        endpoints.payments.connectCreate,
        { country }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.connectStatus() });
    },
  });
}

