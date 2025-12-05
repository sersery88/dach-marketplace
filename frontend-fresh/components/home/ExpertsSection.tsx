import { Star, ArrowRight } from 'lucide-preact';
import type { ExpertProfile } from '@/types/index.ts';
import { formatCurrency, getInitials } from '@/lib/utils.ts';

interface Props {
  experts: ExpertProfile[];
}

export function ExpertsSection({ experts }: Props) {
  return (
    <section class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center mb-12">
          <div>
            <h2 class="text-3xl font-bold text-gray-900 mb-2">Top Experten</h2>
            <p class="text-gray-600">Verifizierte Automatisierungs-Profis</p>
          </div>
          <a href="/experts" class="btn btn-outline hidden sm:inline-flex items-center gap-2">
            Alle Experten
            <ArrowRight class="w-4 h-4" />
          </a>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {experts.length > 0 ? (
            experts.slice(0, 4).map((expert) => {
              const displayName = expert.user?.firstName && expert.user?.lastName
                ? `${expert.user.firstName} ${expert.user.lastName}`
                : expert.user?.email?.split('@')[0] || 'Expert';
              const initials = expert.user?.firstName && expert.user?.lastName
                ? getInitials(expert.user.firstName, expert.user.lastName)
                : displayName.charAt(0).toUpperCase();

              return (
                <a
                  key={expert.id}
                  href={`/experts/${expert.id}`}
                  class="card text-center group hover:shadow-lg transition-all duration-200"
                >
                  <div class="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold group-hover:scale-105 transition-transform">
                    {initials}
                  </div>
                  <h3 class="font-semibold text-gray-900 mb-1">{displayName}</h3>
                  <p class="text-sm text-gray-600 mb-3 line-clamp-1">{expert.headline}</p>
                  <div class="flex items-center justify-center gap-2 text-sm">
                    <Star class="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span class="font-medium">{expert.ratingAverage?.toFixed(1) || '5.0'}</span>
                    <span class="text-gray-400">•</span>
                    <span class="text-blue-600 font-medium">
                      {formatCurrency(expert.hourlyRate / 100, expert.currency)}/h
                    </span>
                  </div>
                </a>
              );
            })
          ) : (
            // Placeholder cards
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} class="card text-center">
                <div class="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 animate-pulse" />
                <div class="h-4 bg-gray-100 rounded w-24 mx-auto mb-2 animate-pulse" />
                <div class="h-3 bg-gray-100 rounded w-32 mx-auto animate-pulse" />
              </div>
            ))
          )}
        </div>

        <div class="text-center mt-8 sm:hidden">
          <a href="/experts" class="btn btn-outline inline-flex items-center gap-2">
            Alle Experten
            <ArrowRight class="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

