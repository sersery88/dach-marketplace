import { HttpError } from 'fresh';
import { define } from '@/utils.ts';
import { api, endpoints } from '@/lib/api.ts';
import type { ExpertProfile, ApiResponse } from '@/types/index.ts';
import { Star, MapPin, CheckCircle, Clock, Briefcase, MessageCircle } from 'lucide-preact';
import { formatCurrency, getInitials } from '@/lib/utils.ts';

export const handler = define.handlers({
  async GET(ctx) {
    const { id } = ctx.params;

    let expert: ExpertProfile | null = null;

    try {
      const res = await api.get<ApiResponse<ExpertProfile>>(endpoints.experts.get(id));
      expert = res.data;
    } catch (e) {
      console.error('Failed to fetch expert:', e);
    }

    if (!expert) {
      throw new HttpError(404);
    }

    return { data: { expert } };
  },
});

export default define.page<typeof handler>(({ data }) => {
  const { expert } = data;
  const displayName = expert.user?.firstName && expert.user?.lastName
    ? `${expert.user.firstName} ${expert.user.lastName}`
    : 'Expert';
  const initials = expert.user?.firstName && expert.user?.lastName
    ? getInitials(expert.user.firstName, expert.user.lastName)
    : 'E';
  const country = expert.user?.country?.toUpperCase() || 'CH';
  const countryFlag = country === 'CH' ? '🇨🇭' : country === 'DE' ? '🇩🇪' : '🇦🇹';

  return (
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div class="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <div class="card">
              <div class="flex items-start gap-6">
                <div class="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                  {initials}
                </div>
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <h1 class="text-2xl font-bold text-gray-900">{displayName}</h1>
                    {expert.isVerified && (
                      <CheckCircle class="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                  <p class="text-gray-600 mb-3">{expert.headline}</p>
                  <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div class="flex items-center gap-1">
                      <MapPin class="w-4 h-4" />
                      <span>{countryFlag} {country === 'CH' ? 'Schweiz' : country === 'DE' ? 'Deutschland' : 'Österreich'}</span>
                    </div>
                    <div class="flex items-center gap-1">
                      <Briefcase class="w-4 h-4" />
                      <span>{expert.yearsExperience || 0} Jahre Erfahrung</span>
                    </div>
                    <div class="flex items-center gap-1">
                      <Clock class="w-4 h-4" />
                      <span>{expert.responseTimeHours || 24}h Antwortzeit</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* About */}
            <div class="card">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Über mich</h2>
              <p class="text-gray-600 whitespace-pre-line">{expert.bio || 'Keine Beschreibung verfügbar.'}</p>
            </div>

            {/* Skills */}
            {expert.skills && expert.skills.length > 0 && (
              <div class="card">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Skills</h2>
                <div class="flex flex-wrap gap-2">
                  {expert.skills.map((skill, i) => (
                    <span key={i} class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tools */}
            {expert.tools && expert.tools.length > 0 && (
              <div class="card">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Tools & Technologien</h2>
                <div class="flex flex-wrap gap-2">
                  {expert.tools.map((tool, i) => (
                    <span key={i} class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div class="lg:col-span-1">
            <div class="card sticky top-24">
              <div class="flex items-center gap-2 mb-4">
                <Star class="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span class="text-xl font-bold">{expert.ratingAverage?.toFixed(1) || '5.0'}</span>
                <span class="text-gray-500">({expert.ratingCount || 0} Bewertungen)</span>
              </div>
              
              <div class="text-3xl font-bold text-gray-900 mb-6">
                {formatCurrency(expert.hourlyRate / 100, expert.currency)}/h
              </div>

              <div class="space-y-3 mb-6 text-sm text-gray-600">
                <div>{expert.totalProjects || 0} abgeschlossene Projekte</div>
                <div>{expert.completionRate || 100}% Abschlussrate</div>
              </div>

              <a 
                href={`/messages?expertId=${expert.id}`}
                class="btn btn-primary w-full inline-flex items-center justify-center gap-2"
              >
                <MessageCircle class="w-4 h-4" />
                Kontaktieren
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

