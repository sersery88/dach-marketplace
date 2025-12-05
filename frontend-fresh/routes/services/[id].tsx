import { HttpError } from 'fresh';
import { define } from '@/utils.ts';
import { api, endpoints } from '@/lib/api.ts';
import type { Service, ApiResponse } from '@/types/index.ts';
import { Star, Clock, RefreshCw, CheckCircle } from 'lucide-preact';
import { formatCurrency } from '@/lib/utils.ts';
import { ContactExpertButton } from '@/islands/ContactExpertButton.tsx';

export const handler = define.handlers({
  async GET(ctx) {
    const { id } = ctx.params;

    let service: Service | null = null;

    try {
      const res = await api.get<ApiResponse<Service>>(endpoints.services.get(id));
      service = res.data;
    } catch (e) {
      console.error('Failed to fetch service:', e);
    }

    if (!service) {
      throw new HttpError(404);
    }

    return { data: { service } };
  },
});

export default define.page<typeof handler>(({ data }) => {
  const { service } = data;
  const expertName = service.expert?.user?.firstName && service.expert?.user?.lastName
    ? `${service.expert.user.firstName} ${service.expert.user.lastName}`
    : 'Expert';

  return (
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div class="lg:col-span-2 space-y-6">
            {/* Hero */}
            <div class="card">
              <h1 class="text-2xl font-bold text-gray-900 mb-4">{service.title}</h1>
              <div class="flex items-center gap-4 text-sm text-gray-600 mb-6">
                <div class="flex items-center gap-1">
                  <Star class="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span class="font-medium">{service.ratingAverage?.toFixed(1) || '5.0'}</span>
                  <span>({service.ratingCount || 0} Bewertungen)</span>
                </div>
                <span>•</span>
                <span>{service.orderCount || 0} Bestellungen</span>
              </div>
              <p class="text-gray-600">{service.description || service.shortDescription}</p>
            </div>

            {/* Features */}
            {service.features && service.features.length > 0 && (
              <div class="card">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Was ist enthalten</h2>
                <ul class="space-y-2">
                  {service.features.map((feature, i) => (
                    <li key={i} class="flex items-start gap-2">
                      <CheckCircle class="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span class="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Expert */}
            <div class="card">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Über den Experten</h2>
              <div class="flex items-center gap-4">
                <div class="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {expertName.charAt(0)}
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900">{expertName}</h3>
                  <p class="text-sm text-gray-600">{service.expert?.headline || 'Automatisierungs-Experte'}</p>
                  {service.expert && (
                    <div class="flex items-center gap-2 mt-1 text-sm">
                      <Star class="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span>{service.expert.ratingAverage?.toFixed(1) || '5.0'}</span>
                      <span class="text-gray-400">•</span>
                      <span>{service.expert.totalProjects || 0} Projekte</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div class="lg:col-span-1">
            <div class="card sticky top-24">
              <div class="text-3xl font-bold text-gray-900 mb-4">
                {formatCurrency(service.price / 100, service.currency)}
              </div>
              
              <div class="space-y-3 mb-6">
                <div class="flex items-center gap-3 text-sm">
                  <Clock class="w-5 h-5 text-gray-400" />
                  <span>Lieferung in {service.deliveryTimeDays} Tagen</span>
                </div>
                <div class="flex items-center gap-3 text-sm">
                  <RefreshCw class="w-5 h-5 text-gray-400" />
                  <span>{service.revisionsIncluded} Revisionen inklusive</span>
                </div>
              </div>

              <ContactExpertButton 
                serviceId={service.id} 
                expertId={service.expertId} 
              />
              
              <a 
                href={`/checkout?serviceId=${service.id}`}
                class="btn btn-primary w-full mt-3"
              >
                Jetzt buchen
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

