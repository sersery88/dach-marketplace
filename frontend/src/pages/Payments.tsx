import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard, Download, ArrowDownLeft, Clock,
  Wallet, FileText, TrendingUp, AlertCircle, Loader2
} from 'lucide-react';
import { Button, Skeleton } from '@/components/ui';
import { cn } from '@/lib/utils';
import { usePayments, usePayouts, useInvoices, usePaymentStats, useConnectStatus, useRequestPayout } from '@/hooks';
import { useSuccessToast, useErrorToast } from '@/components/ui/Toast';
import type { Invoice } from '@/types';

type TabType = 'overview' | 'payments' | 'payouts' | 'invoices';

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  succeeded: 'bg-green-100 text-green-700',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-neutral-100 text-neutral-700',
  disputed: 'bg-red-100 text-red-700',
  in_transit: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-neutral-100 text-neutral-700',
  draft: 'bg-neutral-100 text-neutral-700',
  open: 'bg-amber-100 text-amber-700',
  void: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
  pending: 'Ausstehend',
  succeeded: 'Erfolgreich',
  paid: 'Bezahlt',
  failed: 'Fehlgeschlagen',
  refunded: 'Erstattet',
  disputed: 'Streitig',
  in_transit: 'Unterwegs',
  cancelled: 'Storniert',
  draft: 'Entwurf',
  open: 'Offen',
  void: 'Storniert',
};

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount / 100);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function Payments() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const showSuccess = useSuccessToast();
  const showError = useErrorToast();

  // Fetch data from API
  const { data: payments = [], isLoading: paymentsLoading } = usePayments();
  const { data: payouts = [], isLoading: payoutsLoading } = usePayouts();
  const { data: invoices = [], isLoading: invoicesLoading } = useInvoices();
  const { stats, isLoading: statsLoading } = usePaymentStats();
  const { data: connectStatus } = useConnectStatus();
  const requestPayoutMutation = useRequestPayout();

  const tabs = [
    { id: 'overview' as const, label: 'Übersicht', icon: TrendingUp },
    { id: 'payments' as const, label: 'Zahlungen', icon: CreditCard },
    { id: 'payouts' as const, label: 'Auszahlungen', icon: Wallet },
    { id: 'invoices' as const, label: 'Rechnungen', icon: FileText },
  ];

  const handleRequestPayout = async () => {
    if (stats.pendingBalance <= 0) {
      showError('Kein Guthaben für Auszahlung verfügbar');
      return;
    }
    try {
      await requestPayoutMutation.mutateAsync(stats.pendingBalance);
      showSuccess('Auszahlung wurde angefordert');
    } catch {
      showError('Auszahlung konnte nicht angefordert werden');
    }
  };

  const handleDownloadInvoice = async (invoice: Invoice) => {
    if (invoice.pdfUrl) {
      window.open(invoice.pdfUrl, '_blank');
    } else {
      // Open HTML invoice in new tab for printing/saving as PDF
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      window.open(`${apiUrl}/invoices/${invoice.id}/html`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Finanzen</h1>
          <p className="text-neutral-600 mt-1">Verwalten Sie Ihre Zahlungen, Auszahlungen und Rechnungen</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap',
                activeTab === tab.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-6 border border-neutral-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-sm text-neutral-600">Gesamteinnahmen</span>
                </div>
                {statsLoading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <div className="text-2xl font-bold text-neutral-900">{formatCurrency(stats.totalEarnings, stats.currency)}</div>
                )}
              </div>
              <div className="bg-white rounded-xl p-6 border border-neutral-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm text-neutral-600">Diesen Monat</span>
                </div>
                {statsLoading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <div className="text-2xl font-bold text-neutral-900">{formatCurrency(stats.thisMonthEarnings, stats.currency)}</div>
                )}
              </div>
              <div className="bg-white rounded-xl p-6 border border-neutral-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <span className="text-sm text-neutral-600">Ausstehend</span>
                </div>
                {statsLoading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <div className="text-2xl font-bold text-neutral-900">{formatCurrency(stats.pendingBalance, stats.currency)}</div>
                )}
              </div>
            </div>

            {/* Connect Status Alert */}
            {connectStatus && !connectStatus.onboardingComplete && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-amber-800">Stripe-Konto einrichten</h3>
                  <p className="text-sm text-amber-700 mt-1">
                    Um Auszahlungen zu erhalten, müssen Sie Ihr Stripe-Konto vervollständigen.
                  </p>
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Letzte Aktivitäten</h2>
              {paymentsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <div>
                          <Skeleton className="h-4 w-32 mb-1" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                      <Skeleton className="h-6 w-24" />
                    </div>
                  ))}
                </div>
              ) : payments.length === 0 ? (
                <p className="text-neutral-500 text-center py-8">Noch keine Zahlungen vorhanden</p>
              ) : (
                <div className="space-y-3">
                  {payments.slice(0, 3).map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-100">
                          <ArrowDownLeft className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-neutral-900">{payment.serviceTitle || 'Zahlung'}</div>
                          <div className="text-sm text-neutral-500">{formatDate(payment.createdAt)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">
                          +{formatCurrency(payment.expertPayout || payment.amount, payment.currency)}
                        </div>
                        <span className={cn('text-xs px-2 py-0.5 rounded-full', statusColors[payment.status] || statusColors.pending)}>
                          {statusLabels[payment.status] || payment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl border border-neutral-200">
            <div className="p-6 border-b border-neutral-100">
              <h2 className="text-lg font-semibold text-neutral-900">Zahlungsverlauf</h2>
            </div>
            {paymentsLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-40 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-28" />
                  </div>
                ))}
              </div>
            ) : payments.length === 0 ? (
              <p className="text-neutral-500 text-center py-12">Noch keine Zahlungen vorhanden</p>
            ) : (
              <div className="divide-y divide-neutral-100">
                {payments.map((payment) => (
                  <div key={payment.id} className="p-4 flex items-center justify-between hover:bg-neutral-50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-100">
                        <ArrowDownLeft className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-neutral-900">{payment.serviceTitle || 'Zahlung'}</div>
                        <div className="text-sm text-neutral-500">{formatDate(payment.createdAt)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={cn('text-xs px-2 py-1 rounded-full', statusColors[payment.status] || statusColors.pending)}>
                        {statusLabels[payment.status] || payment.status}
                      </span>
                      <div className="font-semibold text-green-600">
                        +{formatCurrency(payment.expertPayout || payment.amount, payment.currency)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Payouts Tab */}
        {activeTab === 'payouts' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm opacity-80">Verfügbares Guthaben</div>
                  {statsLoading ? (
                    <Skeleton className="h-9 w-40 bg-white/20" />
                  ) : (
                    <div className="text-3xl font-bold mt-1">{formatCurrency(stats.pendingBalance, stats.currency)}</div>
                  )}
                </div>
                <Button
                  variant="secondary"
                  className="bg-white text-primary-600 hover:bg-neutral-100"
                  onClick={handleRequestPayout}
                  disabled={requestPayoutMutation.isPending || stats.pendingBalance <= 0}
                >
                  {requestPayoutMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Wird verarbeitet...</>
                  ) : (
                    'Auszahlung anfordern'
                  )}
                </Button>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-neutral-200">
              <div className="p-6 border-b border-neutral-100">
                <h2 className="text-lg font-semibold text-neutral-900">Auszahlungsverlauf</h2>
              </div>
              {payoutsLoading ? (
                <div className="p-6 space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div>
                          <Skeleton className="h-4 w-32 mb-1" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-6 w-20" />
                    </div>
                  ))}
                </div>
              ) : payouts.length === 0 ? (
                <p className="text-neutral-500 text-center py-12">Noch keine Auszahlungen vorhanden</p>
              ) : (
                <div className="divide-y divide-neutral-100">
                  {payouts.map((payout) => (
                    <div key={payout.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Wallet className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-neutral-900">{formatCurrency(payout.amount, payout.currency)}</div>
                          <div className="text-sm text-neutral-500">Ankunft: {formatDate(payout.arrivalDate || payout.createdAt)}</div>
                        </div>
                      </div>
                      <span className={cn('text-xs px-2 py-1 rounded-full', statusColors[payout.status] || statusColors.pending)}>
                        {statusLabels[payout.status] || payout.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl border border-neutral-200">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">Rechnungen</h2>
            </div>
            {invoicesLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-28" />
                  </div>
                ))}
              </div>
            ) : invoices.length === 0 ? (
              <p className="text-neutral-500 text-center py-12">Noch keine Rechnungen vorhanden</p>
            ) : (
              <div className="divide-y divide-neutral-100">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="p-4 flex items-center justify-between hover:bg-neutral-50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-neutral-600" />
                      </div>
                      <div>
                        <div className="font-medium text-neutral-900">{invoice.invoiceNumber}</div>
                        <div className="text-sm text-neutral-500">Fällig: {formatDate(invoice.dueDate || invoice.createdAt)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={cn('text-xs px-2 py-1 rounded-full', statusColors[invoice.status] || statusColors.pending)}>
                        {statusLabels[invoice.status] || invoice.status}
                      </span>
                      <div className="font-semibold text-neutral-900">{formatCurrency(invoice.total, invoice.currency)}</div>
                      <Button variant="ghost" size="sm" onClick={() => handleDownloadInvoice(invoice)}>
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Payments;

