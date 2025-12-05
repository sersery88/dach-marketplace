import { define } from '@/utils.ts';
import { api, endpoints } from '@/lib/api.ts';
import type { Service, ExpertProfile } from '@/types/index.ts';
import { Star, Zap, Search as SearchIcon } from 'lucide-preact';
import { formatCurrency, getInitials } from '@/lib/utils.ts';

interface SearchResults {
  services: Service[];
  experts: ExpertProfile[];
}

interface PageData {
  query: string;
  type: string;
  results: SearchResults;
}

export const handler = define.handlers({
  async GET(ctx) {
    const url = new URL(ctx.req.url);
    const q = url.searchParams.get('q') || '';
    const type = url.searchParams.get('type') || 'all';

    let results: SearchResults = { services: [], experts: [] };

    if (q) {
      try {
        const [servicesRes, expertsRes] = await Promise.allSettled([
          type !== 'experts' ? api.get<{ data: Service[] }>(endpoints.services.search, { q }) : Promise.resolve({ data: [] }),
          type !== 'services' ? api.get<{ data: ExpertProfile[] }>(endpoints.experts.search, { q }) : Promise.resolve({ data: [] }),
        ]);

        if (servicesRes.status === 'fulfilled') results.services = servicesRes.value.data || [];
        if (expertsRes.status === 'fulfilled') results.experts = expertsRes.value.data || [];
      } catch (e) {
        console.error('Search failed:', e);
      }
    }

    return { data: { query: q, type, results } };
  },
});

export default define.page<typeof handler>(({ data }) => {
  const { query, type, results } = data as PageData;
  const totalResults = results.services.length + results.experts.length;

  return (
    <div class="min-h-screen bg-gray-50">
      <div class="bg-white border-b border-gray-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form action="/search" method="GET" class="max-w-2xl">
            <div class="relative">
              <SearchIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Suchen Sie nach Services oder Experten..."
                class="input pl-12 pr-24 py-4 text-lg"
              />
              <button type="submit" class="absolute right-2 top-1/2 -translate-y-1/2 btn btn-primary">
                Suchen
              </button>
            </div>
          </form>
          
          {query && (
            <p class="mt-4 text-gray-600">
              {totalResults} Ergebnisse für "{query}"
            </p>
          )}
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Type Tabs */}
        <div class="flex gap-4 mb-8">
          {[
            { value: 'all', label: 'Alle' },
            { value: 'services', label: 'Services' },
            { value: 'experts', label: 'Experten' },
          ].map((tab) => (
            <a
              key={tab.value}
              href={`/search?q=${encodeURIComponent(query)}&type=${tab.value}`}
              class={`px-4 py-2 rounded-lg font-medium transition-colors ${
                type === tab.value ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </a>
          ))}
        </div>

        {/* Services */}
        {(type === 'all' || type === 'services') && results.services.length > 0 && (
          <div class="mb-12">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Services</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.services.map((service) => (
                <a key={service.id} href={`/services/${service.slug || service.id}`} class="card group hover:shadow-lg transition-all">
                  <div class="h-32 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg mb-4 flex items-center justify-center">
                    <Zap class="w-10 h-10 text-blue-400" />
                  </div>
                  <h3 class="font-semibold text-gray-900 mb-1 line-clamp-1">{service.title}</h3>
                  <p class="text-sm text-gray-600 mb-3 line-clamp-2">{service.shortDescription}</p>
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-1">
                      <Star class="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span class="text-sm font-medium">{service.ratingAverage?.toFixed(1) || '5.0'}</span>
                    </div>
                    <span class="font-semibold text-blue-600">{formatCurrency(service.price / 100, service.currency)}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Experts */}
        {(type === 'all' || type === 'experts') && results.experts.length > 0 && (
          <div>
            <h2 class="text-xl font-bold text-gray-900 mb-4">Experten</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.experts.map((expert) => {
                const name = expert.user?.firstName && expert.user?.lastName ? `${expert.user.firstName} ${expert.user.lastName}` : 'Expert';
                const initials = expert.user?.firstName && expert.user?.lastName ? getInitials(expert.user.firstName, expert.user.lastName) : 'E';
                return (
                  <a key={expert.id} href={`/experts/${expert.id}`} class="card group hover:shadow-lg transition-all">
                    <div class="flex items-center gap-4">
                      <div class="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-lg font-bold">{initials}</div>
                      <div>
                        <h3 class="font-semibold text-gray-900">{name}</h3>
                        <p class="text-sm text-gray-600 line-clamp-1">{expert.headline}</p>
                      </div>
                    </div>
                    <div class="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <div class="flex items-center gap-1">
                        <Star class="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span class="font-medium">{expert.ratingAverage?.toFixed(1) || '5.0'}</span>
                      </div>
                      <span class="font-semibold text-blue-600">{formatCurrency(expert.hourlyRate / 100, expert.currency)}/h</span>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* No Results */}
        {query && totalResults === 0 && (
          <div class="text-center py-12">
            <SearchIcon class="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">Keine Ergebnisse gefunden</h3>
            <p class="text-gray-600">Versuchen Sie eine andere Suche</p>
          </div>
        )}
      </div>
    </div>
  );
});

