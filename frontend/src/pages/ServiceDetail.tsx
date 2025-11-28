import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Star, Clock, MessageSquare, ShoppingCart, ChevronRight, Check, Heart, Share2, AlertCircle } from 'lucide-react';
import { Button, Card, Skeleton } from '@/components/ui';
import { useService } from '@/hooks';
import { useAuthStore } from '@/stores/authStore';
import type { ServicePackage } from '@/types';

// Format price from cents to display value
function formatPrice(cents: number, currency: string): string {
  const value = cents / 100;
  return `${currency.toUpperCase()} ${value.toLocaleString('de-CH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

// Loading skeleton for service detail
function ServiceDetailSkeleton() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <Skeleton className="aspect-video rounded-xl mb-6" />
              <Skeleton className="h-4 w-48 mb-2" />
              <Skeleton className="h-10 w-3/4 mb-4" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
            <Card padding="lg">
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </Card>
          </div>
          <aside>
            <Card padding="none" className="overflow-hidden">
              <Skeleton className="h-12 w-full" />
              <div className="p-6 space-y-4">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}

export function ServiceDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [selectedPackageIndex, setSelectedPackageIndex] = useState(1); // Default to middle package

  // Fetch service data
  const { data: service, isLoading, isError, error } = useService(id);

  // Handle contact expert
  const handleContactExpert = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/services/${id}` } });
      return;
    }
    // TODO: Navigate to messages or open chat modal
    navigate(`/messages?expert=${service?.expertId}`);
  };

  // Handle order
  const handleOrder = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/services/${id}` } });
      return;
    }
    // TODO: Navigate to checkout
    navigate(`/checkout?service=${id}&package=${selectedPackageIndex}`);
  };

  if (isLoading) {
    return <ServiceDetailSkeleton />;
  }

  if (isError || !service) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Card padding="lg" className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">{t('service.notFound', 'Service nicht gefunden')}</h2>
          <p className="text-neutral-600 mb-4">
            {error instanceof Error ? error.message : t('service.notFoundMessage', 'Der angeforderte Service existiert nicht oder wurde entfernt.')}
          </p>
          <Button onClick={() => navigate('/services')}>{t('service.backToServices', 'Zurück zu Services')}</Button>
        </Card>
      </div>
    );
  }

  // Use service packages if available, otherwise create default package from service data
  const packages: ServicePackage[] = service.packages && service.packages.length > 0
    ? service.packages
    : [{
        id: 'default',
        serviceId: service.id,
        name: 'Standard',
        description: service.shortDescription,
        price: service.price,
        deliveryTimeDays: service.deliveryTimeDays,
        revisionsIncluded: service.revisionsIncluded,
        features: service.features,
        isPopular: true,
        sortOrder: 0,
      }];

  const selectedPackage = packages[Math.min(selectedPackageIndex, packages.length - 1)];

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* Service Image or Gradient */}
              {service.images && service.images.length > 0 ? (
                <img src={service.images[0]} alt={service.title} className="aspect-video w-full object-cover rounded-xl mb-6" />
              ) : (
                <div className="aspect-video bg-linear-to-br from-primary-100 to-primary-200 rounded-xl mb-6" />
              )}

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-500 mb-2">
                {service.tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 bg-neutral-100 rounded">{tag}</span>
                ))}
              </div>

              <h1 className="text-3xl font-bold text-neutral-900 mb-4">{service.title}</h1>

              {/* Expert Card - simplified since we don't have full expert data */}
              <Link to={`/experts/${service.expertId}`} className="flex items-center gap-3 p-4 bg-white rounded-lg border border-neutral-200 hover:border-primary-300 transition-colors">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold">
                  {service.title.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{t('service.viewExpert', 'Experte anzeigen')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-500">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span>{service.ratingAverage?.toFixed(1) || '0.0'}</span>
                    <span>({service.ratingCount || 0} {t('service.reviews', 'Bewertungen')})</span>
                    <span>•</span>
                    <span>{service.orderCount || 0} {t('service.orders', 'Bestellungen')}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-neutral-400" />
              </Link>
            </motion.div>

            {/* Description */}
            <Card padding="lg">
              <h2 className="text-xl font-semibold mb-4">{t('service.description', 'Beschreibung')}</h2>
              <div className="prose prose-neutral max-w-none">
                {service.description.split('\n').map((p, i) => (
                  <p key={i} className="text-neutral-600 mb-3">{p}</p>
                ))}
              </div>
            </Card>

            {/* Features */}
            {service.features && service.features.length > 0 && (
              <Card padding="lg">
                <h2 className="text-xl font-semibold mb-4">{t('service.features', 'Leistungen')}</h2>
                <ul className="space-y-2">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500 shrink-0" />
                      <span className="text-neutral-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Requirements */}
            {service.requirements && (
              <Card padding="lg">
                <h2 className="text-xl font-semibold mb-4">{t('service.requirements', 'Anforderungen')}</h2>
                <p className="text-neutral-600">{service.requirements}</p>
              </Card>
            )}

            {/* Reviews placeholder - will be populated when reviews API is connected */}
            <Card padding="lg">
              <h2 className="text-xl font-semibold mb-4">
                {t('service.reviews', 'Bewertungen')} ({service.ratingCount || 0})
              </h2>
              {service.ratingCount === 0 ? (
                <p className="text-neutral-500">{t('service.noReviews', 'Noch keine Bewertungen vorhanden.')}</p>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold">{service.ratingAverage?.toFixed(1) || '0.0'}</div>
                  <div>
                    <div className="flex gap-0.5 mb-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${i <= Math.round(service.ratingAverage || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-neutral-300'}`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-neutral-500">
                      {t('service.basedOn', 'Basierend auf')} {service.ratingCount} {t('service.reviews', 'Bewertungen')}
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar - Packages */}
          <aside className="space-y-6">
            <Card padding="none" className="sticky top-4 overflow-hidden">
              {/* Package tabs */}
              {packages.length > 1 && (
                <div className="flex border-b border-neutral-200">
                  {packages.map((pkg, index) => (
                    <button
                      key={pkg.id}
                      onClick={() => setSelectedPackageIndex(index)}
                      className={`flex-1 py-3 text-sm font-medium transition-colors ${
                        selectedPackageIndex === index
                          ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-600'
                          : 'text-neutral-500 hover:text-neutral-700'
                      }`}
                    >
                      {pkg.name}
                      {pkg.isPopular && <span className="ml-1 text-xs">⭐</span>}
                    </button>
                  ))}
                </div>
              )}

              <div className="p-6">
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-bold">
                    {formatPrice(selectedPackage.price, service.currency)}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-neutral-500 mb-6">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{selectedPackage.deliveryTimeDays} {t('service.days', 'Tage')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>
                      {selectedPackage.revisionsIncluded === -1 ? '∞' : selectedPackage.revisionsIncluded} {t('service.revisions', 'Revisionen')}
                    </span>
                  </div>
                </div>

                {/* Package features */}
                <ul className="space-y-2 mb-6">
                  {selectedPackage.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Action buttons */}
                <div className="space-y-3">
                  <Button className="w-full gap-2" onClick={handleOrder}>
                    <ShoppingCart className="w-4 h-4" />
                    {t('service.orderNow', 'Jetzt bestellen')}
                  </Button>
                  <Button variant="outline" className="w-full gap-2" onClick={handleContactExpert}>
                    <MessageSquare className="w-4 h-4" />
                    {t('service.contactExpert', 'Nachricht senden')}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Save & Share buttons */}
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="flex-1 gap-2">
                <Heart className="w-4 h-4" />
                {t('service.save', 'Speichern')}
              </Button>
              <Button variant="ghost" size="sm" className="flex-1 gap-2">
                <Share2 className="w-4 h-4" />
                {t('service.share', 'Teilen')}
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

