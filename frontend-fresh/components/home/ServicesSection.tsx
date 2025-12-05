import { Star, Zap, ArrowRight } from 'lucide-preact';
import type { Service } from '@/types/index.ts';
import { formatCurrency } from '@/lib/utils.ts';

interface Props {
  services: Service[];
}

export function ServicesSection({ services }: Props) {
  return (
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center mb-12">
          <div>
            <h2 class="text-3xl font-bold text-gray-900 mb-2">Beliebte Services</h2>
            <p class="text-gray-600">Top-bewertete Automatisierungslösungen</p>
          </div>
          <a href="/services" class="btn btn-outline hidden sm:inline-flex items-center gap-2">
            Alle Services
            <ArrowRight class="w-4 h-4" />
          </a>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.length > 0 ? (
            services.slice(0, 6).map((service) => (
              <a
                key={service.id}
                href={`/services/${service.slug || service.id}`}
                class="card group hover:shadow-lg transition-all duration-200"
              >
                <div class="h-40 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg mb-4 flex items-center justify-center group-hover:from-blue-200 group-hover:to-blue-100 transition-colors">
                  <Zap class="w-12 h-12 text-blue-400" />
                </div>
                <h3 class="font-semibold text-gray-900 mb-1 line-clamp-1">{service.title}</h3>
                <p class="text-sm text-gray-600 mb-3 line-clamp-2">{service.shortDescription}</p>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-1">
                    <Star class="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span class="text-sm font-medium">{service.ratingAverage?.toFixed(1) || '5.0'}</span>
                  </div>
                  <span class="font-semibold text-blue-600">
                    {formatCurrency(service.price / 100, service.currency)}
                  </span>
                </div>
              </a>
            ))
          ) : (
            // Placeholder cards
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} class="card">
                <div class="h-40 bg-gray-100 rounded-lg mb-4 animate-pulse" />
                <div class="h-4 bg-gray-100 rounded w-3/4 mb-2 animate-pulse" />
                <div class="h-3 bg-gray-100 rounded w-1/2 animate-pulse" />
              </div>
            ))
          )}
        </div>

        <div class="text-center mt-8 sm:hidden">
          <a href="/services" class="btn btn-outline inline-flex items-center gap-2">
            Alle Services
            <ArrowRight class="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

