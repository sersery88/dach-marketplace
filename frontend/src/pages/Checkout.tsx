import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ShoppingCart, Shield, Clock, CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { Button, Card, Skeleton } from '@/components/ui';
import { useService } from '@/hooks';
import { api, endpoints } from '@/api/client';
import { useErrorToast } from '@/components/ui/Toast';
import type { ApiResponse, CheckoutSessionResponse, ServicePackage } from '@/types';

export function Checkout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const showError = useErrorToast();

  const serviceId = searchParams.get('service');
  const packageIndex = parseInt(searchParams.get('package') || '0', 10);

  const { data: service, isLoading, isError } = useService(serviceId || '');

  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(null);

  // Set selected package when service loads
  useEffect(() => {
    if (service?.packages && service.packages.length > 0) {
      const pkg = service.packages[packageIndex] || service.packages[0];
      setSelectedPackage(pkg);
    }
  }, [service, packageIndex]);

  const handleCheckout = async () => {
    if (!serviceId) return;

    setIsProcessing(true);
    try {
      const response = await api.post<ApiResponse<CheckoutSessionResponse>>(
        endpoints.payments.checkout,
        {
          serviceId,
          packageTier: selectedPackage?.name?.toLowerCase(),
        }
      );

      if (response.data?.checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = response.data.checkoutUrl;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      showError(error instanceof Error ? error.message : t('checkout.error', 'Checkout failed'));
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  if (!serviceId) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <Card padding="lg" className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">{t('checkout.noService', 'Kein Service ausgewählt')}</h2>
          <p className="text-neutral-600 mb-4">{t('checkout.selectService', 'Bitte wählen Sie einen Service aus.')}</p>
          <Button onClick={() => navigate('/services')}>{t('checkout.browseServices', 'Services durchsuchen')}</Button>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-64 rounded-xl" />
            </div>
            <div>
              <Skeleton className="h-80 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !service) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <Card padding="lg" className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">{t('checkout.serviceNotFound', 'Service nicht gefunden')}</h2>
          <p className="text-neutral-600 mb-4">{t('checkout.serviceNotFoundDesc', 'Der ausgewählte Service existiert nicht mehr.')}</p>
          <Button onClick={() => navigate('/services')}>{t('checkout.browseServices', 'Services durchsuchen')}</Button>
        </Card>
      </div>
    );
  }

  const price = selectedPackage?.price || service.price;
  const deliveryDays = selectedPackage?.deliveryTimeDays || service.deliveryTimeDays;
  const features = selectedPackage?.features || service.features;

  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Link */}
        <Link to={`/services/${serviceId}`} className="inline-flex items-center gap-2 text-neutral-600 hover:text-primary-600 mb-6">
          <ArrowLeft className="w-4 h-4" />
          {t('checkout.backToService', 'Zurück zum Service')}
        </Link>

        <h1 className="text-2xl font-bold text-neutral-900 mb-8">{t('checkout.title', 'Bestellung abschließen')}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 space-y-6">
            {/* Service Info */}
            <Card padding="lg">
              <h2 className="text-lg font-semibold mb-4">{t('checkout.orderDetails', 'Bestelldetails')}</h2>
              <div className="flex gap-4">
                {service.images?.[0] && (
                  <img src={service.images[0]} alt={service.title} className="w-24 h-24 rounded-lg object-cover" />
                )}
                <div className="flex-1">
                  <h3 className="font-medium text-neutral-900">{service.title}</h3>
                  <p className="text-sm text-neutral-600 mt-1">{service.shortDescription}</p>
                  {selectedPackage && (
                    <span className="inline-block mt-2 px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded">
                      {selectedPackage.name}
                    </span>
                  )}
                </div>
              </div>
            </Card>

            {/* Package Selection (if multiple packages) */}
            {service.packages && service.packages.length > 1 && (
              <Card padding="lg">
                <h2 className="text-lg font-semibold mb-4">{t('checkout.selectPackage', 'Paket auswählen')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {service.packages.map((pkg: ServicePackage) => (
                    <button
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        selectedPackage?.id === pkg.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className="font-medium text-neutral-900">{pkg.name}</div>
                      <div className="text-lg font-bold text-primary-600 mt-1">
                        {formatCurrency(pkg.price, service.currency)}
                      </div>
                      <div className="text-sm text-neutral-500 mt-1">
                        {pkg.deliveryTimeDays} {t('checkout.days', 'Tage')}
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
            )}

            {/* What's Included */}
            <Card padding="lg">
              <h2 className="text-lg font-semibold mb-4">{t('checkout.included', 'Inklusive')}</h2>
              <ul className="space-y-2">
                {features.map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-neutral-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>

          {/* Order Summary */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card padding="lg" className="sticky top-24">
              <h2 className="text-lg font-semibold mb-4">{t('checkout.summary', 'Zusammenfassung')}</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-neutral-600">
                  <span>{selectedPackage?.name || t('checkout.service', 'Service')}</span>
                  <span>{formatCurrency(price, service.currency)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <Clock className="w-4 h-4" />
                  <span>{deliveryDays} {t('checkout.deliveryDays', 'Tage Lieferzeit')}</span>
                </div>
              </div>

              <div className="border-t border-neutral-200 pt-4 mb-6">
                <div className="flex justify-between text-lg font-bold">
                  <span>{t('checkout.total', 'Gesamt')}</span>
                  <span className="text-primary-600">{formatCurrency(price, service.currency)}</span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">{t('checkout.vatIncluded', 'inkl. MwSt.')}</p>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    {t('checkout.processing', 'Wird verarbeitet...')}
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {t('checkout.payNow', 'Jetzt bezahlen')}
                  </>
                )}
              </Button>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-neutral-200">
                <div className="flex items-center gap-2 text-sm text-neutral-600 mb-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>{t('checkout.securePayment', 'Sichere Zahlung mit Stripe')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{t('checkout.moneyBack', 'Geld-zurück-Garantie')}</span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;

