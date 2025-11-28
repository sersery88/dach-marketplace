import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Star, Clock, CheckCircle, Calendar, MessageSquare, Briefcase, Play, ChevronRight, AlertCircle, ThumbsUp, Loader2 } from 'lucide-react';
import { Button, Card, Skeleton } from '@/components/ui';
import { useExpert, useReviews, useReviewSummary, useMarkReviewHelpful } from '@/hooks';
import { useAuthStore } from '@/stores/authStore';
import type { ExpertProfile as ExpertProfileType, Service, PortfolioItem, ReviewWithReviewer } from '@/types';

const countryFlags: Record<string, string> = { CH: '🇨🇭', DE: '🇩🇪', AT: '🇦🇹', ch: '🇨🇭', de: '🇩🇪', at: '🇦🇹' };

// Loading skeleton for expert profile
function ExpertProfileSkeleton() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-linear-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <Skeleton className="w-32 h-32 rounded-2xl" />
            <div className="flex-1">
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-6 w-96 mb-4" />
              <div className="flex gap-4">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
            <Skeleton className="w-[280px] h-48 rounded-xl" />
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card padding="lg">
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </Card>
          </div>
          <aside>
            <Card padding="md">
              <Skeleton className="h-5 w-20 mb-3" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}

export function ExpertProfile() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'about' | 'portfolio' | 'reviews' | 'services'>('about');

  // Fetch expert data
  const { data: expert, isLoading, isError, error } = useExpert(id);

  // Handle contact expert
  const handleContactExpert = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/experts/${id}` } });
      return;
    }
    navigate(`/messages?expert=${id}`);
  };

  if (isLoading) {
    return <ExpertProfileSkeleton />;
  }

  if (isError || !expert) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Card padding="lg" className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">{t('expert.notFound', 'Experte nicht gefunden')}</h2>
          <p className="text-neutral-600 mb-4">
            {error instanceof Error ? error.message : t('expert.notFoundMessage', 'Der angeforderte Experte existiert nicht oder wurde entfernt.')}
          </p>
          <Button onClick={() => navigate('/experts')}>{t('expert.backToExperts', 'Zurück zu Experten')}</Button>
        </Card>
      </div>
    );
  }

  const isAvailable = expert.availabilityStatus === 'available';
  const displayName = expert.user ? `${expert.user.firstName} ${expert.user.lastName}` : expert.headline;
  const initials = displayName.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  const country = expert.user?.country?.toUpperCase() || '';
  const location = expert.timezone.split('/').pop()?.replace('_', ' ') || country;

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-linear-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative">
              {expert.user?.avatarUrl ? (
                <img src={expert.user.avatarUrl} alt={displayName} className="w-32 h-32 rounded-2xl object-cover" />
              ) : (
                <div className="w-32 h-32 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-4xl font-bold">
                  {initials}
                </div>
              )}
              {expert.isVerified && <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 shadow-lg"><CheckCircle className="w-5 h-5 text-white" /></div>}
            </motion.div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{displayName}</h1>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">{countryFlags[country] || '🌍'} {location}</span>
              </div>
              <p className="text-xl text-white/90 mb-4">{expert.headline}</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2"><Star className="w-5 h-5 text-yellow-400 fill-yellow-400" /><span className="font-semibold">{expert.ratingAverage?.toFixed(1) || '0.0'}</span><span className="text-white/70">({expert.ratingCount || 0})</span></div>
                <div className="flex items-center gap-2 text-white/80"><Briefcase className="w-4 h-4" /><span>{expert.totalProjects || 0} {t('expert.projects', 'Projekte')}</span></div>
                {expert.responseTimeHours && <div className="flex items-center gap-2 text-white/80"><Clock className="w-4 h-4" /><span>~{expert.responseTimeHours}h</span></div>}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-6 min-w-[280px]">
              <div className="text-center mb-4"><span className="text-3xl font-bold">{expert.currency.toUpperCase()} {expert.hourlyRate}</span><span className="text-white/70">/h</span></div>
              <div className={`flex items-center justify-center gap-2 mb-4 ${isAvailable ? 'text-green-400' : 'text-yellow-400'}`}>
                <div className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-green-400' : 'bg-yellow-400'}`} />
                <span>{isAvailable ? `${expert.availableHoursPerWeek}h/${t('expert.week', 'Woche')}` : t('expert.busy', 'Beschäftigt')}</span>
              </div>
              <div className="space-y-3">
                <Button variant="secondary" className="w-full gap-2" onClick={handleContactExpert}><MessageSquare className="w-4 h-4" />{t('expert.message', 'Nachricht')}</Button>
                <Button variant="outline" className="w-full gap-2 border-white/30 text-white hover:bg-white/10"><Calendar className="w-4 h-4" />{t('expert.schedule', 'Termin')}</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-8">
            {(['about', 'portfolio', 'reviews', 'services'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`py-4 border-b-2 font-medium ${activeTab === tab ? 'border-primary-600 text-primary-600' : 'border-transparent text-neutral-500'}`}>
                {tab === 'about' && t('expert.about', 'Über mich')}
                {tab === 'portfolio' && t('expert.portfolio', 'Portfolio')}
                {tab === 'reviews' && t('expert.reviews', 'Bewertungen')}
                {tab === 'services' && t('expert.services', 'Services')}
              </button>
            ))}
          </nav>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {activeTab === 'about' && <AboutTab expert={expert} />}
            {activeTab === 'portfolio' && <PortfolioTab portfolio={[]} expertId={expert.id} />}
            {activeTab === 'reviews' && <ReviewsTab expertId={expert.id} />}
            {activeTab === 'services' && <ServicesTab services={[]} expertId={expert.id} />}
          </div>
          <aside className="space-y-6"><SkillsCard skills={expert.skills} tools={expert.tools} /><StatsCard expert={expert} /></aside>
        </div>
      </div>
    </div>
  );
}

function AboutTab({ expert }: { expert: ExpertProfileType }) {
  const { t } = useTranslation();
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card padding="lg">
        <h2 className="text-xl font-semibold mb-4">{t('expert.about', 'Über mich')}</h2>
        <div className="prose prose-neutral max-w-none">
          {expert.bio.split('\n').map((p, i) => <p key={i} className="text-neutral-600 mb-3">{p}</p>)}
        </div>
        {expert.languagesSpoken.length > 0 && (
          <div className="mt-6 pt-6 border-t border-neutral-100">
            <h3 className="font-medium mb-3">{t('expert.languages', 'Sprachen')}</h3>
            <div className="flex flex-wrap gap-2">
              {expert.languagesSpoken.map(l => (
                <span key={l} className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm">{l}</span>
              ))}
            </div>
          </div>
        )}
        {expert.industries.length > 0 && (
          <div className="mt-6 pt-6 border-t border-neutral-100">
            <h3 className="font-medium mb-3">{t('expert.industries', 'Branchen')}</h3>
            <div className="flex flex-wrap gap-2">
              {expert.industries.map(i => (
                <span key={i} className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm">{i}</span>
              ))}
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

function PortfolioTab({ portfolio, expertId: _expertId }: { portfolio: PortfolioItem[]; expertId: string }) {
  const { t } = useTranslation();
  // TODO: Fetch portfolio items from API using expertId

  if (portfolio.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card padding="lg" className="text-center">
          <Play className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500">{t('expert.noPortfolio', 'Noch keine Portfolio-Einträge vorhanden.')}</p>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {portfolio.map((item) => (
        <Card key={item.id} variant="interactive" className="overflow-hidden">
          {item.imageUrls && item.imageUrls.length > 0 ? (
            <img src={item.imageUrls[0]} alt={item.title} className="aspect-video w-full object-cover" />
          ) : (
            <div className="aspect-video bg-linear-to-br from-primary-100 to-primary-200 flex items-center justify-center">
              <Play className="w-12 h-12 text-primary-600" />
            </div>
          )}
          <div className="p-4">
            <h3 className="font-semibold mb-2">{item.title}</h3>
            {item.description && <p className="text-sm text-neutral-600 mb-2 line-clamp-2">{item.description}</p>}
            <div className="flex flex-wrap gap-1">
              {item.toolsUsed.map((tool: string) => (
                <span key={tool} className="px-2 py-0.5 bg-neutral-100 text-neutral-600 text-xs rounded">{tool}</span>
              ))}
            </div>
          </div>
        </Card>
      ))}
    </motion.div>
  );
}

function ReviewsTab({ expertId }: { expertId: string }) {
  const { t } = useTranslation();
  const { data: reviewsData, isLoading: reviewsLoading } = useReviews({ expertId }, 1, 20);
  const { data: summary, isLoading: summaryLoading } = useReviewSummary(expertId);
  const markHelpfulMutation = useMarkReviewHelpful();

  const reviews = reviewsData?.data || [];
  const rating = summary?.averageRating || 0;
  const count = summary?.totalReviews || 0;

  if (reviewsLoading || summaryLoading) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <Card padding="lg">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Summary Card */}
      <Card padding="lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600">{rating.toFixed(1)}</div>
            <div className="flex gap-0.5 my-1">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className={`w-4 h-4 ${i <= Math.round(rating) ? 'text-yellow-500 fill-yellow-500' : 'text-neutral-300'}`} />
              ))}
            </div>
            <div className="text-sm text-neutral-500">{count} {t('expert.reviews', 'Bewertungen')}</div>
          </div>
          {summary && (
            <div className="flex-1 space-y-2">
              {[
                { label: '5', count: summary.ratingDistribution.fiveStar },
                { label: '4', count: summary.ratingDistribution.fourStar },
                { label: '3', count: summary.ratingDistribution.threeStar },
                { label: '2', count: summary.ratingDistribution.twoStar },
                { label: '1', count: summary.ratingDistribution.oneStar },
              ].map(({ label, count: starCount }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-sm text-neutral-500 w-4">{label}</span>
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full"
                      style={{ width: count > 0 ? `${(starCount / count) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-sm text-neutral-500 w-8">{starCount}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Card padding="lg" className="text-center">
          <Star className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500">{t('expert.noReviews', 'Noch keine Bewertungen vorhanden.')}</p>
        </Card>
      ) : (
        reviews.map((r: ReviewWithReviewer) => (
          <Card key={r.review.id} padding="md">
            <div className="flex items-start gap-4">
              {r.reviewerAvatar ? (
                <img src={r.reviewerAvatar} alt={r.reviewerName} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-medium">
                  {r.reviewerName.charAt(0)}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{r.reviewerName}</span>
                    <span className="text-sm text-neutral-400">{r.reviewerCountry}</span>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} className={`w-3 h-3 ${i <= r.review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-neutral-300'}`} />
                    ))}
                  </div>
                </div>
                {r.review.title && <h4 className="font-medium mb-1">{r.review.title}</h4>}
                <p className="text-neutral-600">{r.review.content}</p>

                {/* Category ratings */}
                {(r.review.communicationRating || r.review.qualityRating || r.review.timelinessRating) && (
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-neutral-500">
                    {r.review.communicationRating && <span>Kommunikation: {r.review.communicationRating}/5</span>}
                    {r.review.qualityRating && <span>Qualität: {r.review.qualityRating}/5</span>}
                    {r.review.timelinessRating && <span>Pünktlichkeit: {r.review.timelinessRating}/5</span>}
                  </div>
                )}

                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm text-neutral-400">{new Date(r.review.createdAt).toLocaleDateString('de-DE')}</span>
                  <button
                    onClick={() => markHelpfulMutation.mutate(r.review.id)}
                    className="flex items-center gap-1 text-sm text-neutral-500 hover:text-primary-600"
                    disabled={markHelpfulMutation.isPending}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>Hilfreich ({r.review.helpfulCount})</span>
                  </button>
                </div>

                {/* Expert response */}
                {r.review.response && (
                  <div className="mt-4 pl-4 border-l-2 border-primary-200 bg-primary-50 p-3 rounded-r-lg">
                    <p className="text-sm font-medium text-primary-700 mb-1">Antwort des Experten:</p>
                    <p className="text-sm text-neutral-600">{r.review.response}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))
      )}
    </motion.div>
  );
}

function ServicesTab({ services, expertId: _expertId }: { services: Service[]; expertId: string }) {
  const { t } = useTranslation();
  // TODO: Fetch services from API using expertId

  if (services.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card padding="lg" className="text-center">
          <Briefcase className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500">{t('expert.noServices', 'Noch keine Services vorhanden.')}</p>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {services.map(s => (
        <Link key={s.id} to={`/services/${s.id}`}>
          <Card variant="interactive" padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">{s.title}</h3>
                <p className="text-neutral-500">{t('service.deliveryIn', 'Lieferung in')} {s.deliveryTimeDays} {t('service.days', 'Tagen')}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary-600">{s.currency.toUpperCase()} {(s.price / 100).toLocaleString()}</div>
                <Button size="sm" className="mt-2">{t('service.order', 'Bestellen')} <ChevronRight className="w-4 h-4" /></Button>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </motion.div>
  );
}

function SkillsCard({ skills, tools }: { skills: string[]; tools: string[] }) {
  const { t } = useTranslation();
  return (
    <Card padding="md">
      <h3 className="font-semibold mb-3">{t('expert.skills', 'Skills')}</h3>
      <div className="flex flex-wrap gap-2 mb-4">
        {skills.map(s => <span key={s} className="px-2 py-1 bg-primary-50 text-primary-700 text-sm rounded-full">{s}</span>)}
      </div>
      <h3 className="font-semibold mb-3">{t('expert.tools', 'Tools')}</h3>
      <div className="flex flex-wrap gap-2">
        {tools.map(t => <span key={t} className="px-2 py-1 bg-neutral-100 text-neutral-700 text-sm rounded-full">{t}</span>)}
      </div>
    </Card>
  );
}

function StatsCard({ expert }: { expert: ExpertProfileType }) {
  const { t } = useTranslation();
  const memberSince = new Date(expert.createdAt).getFullYear();

  return (
    <Card padding="md">
      <h3 className="font-semibold mb-4">{t('expert.stats', 'Statistiken')}</h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-neutral-500">{t('expert.projects', 'Projekte')}</span>
          <span className="font-medium">{expert.totalProjects || 0}</span>
        </div>
        {expert.completionRate !== undefined && (
          <div className="flex justify-between">
            <span className="text-neutral-500">{t('expert.successRate', 'Erfolgsrate')}</span>
            <span className="font-medium text-green-600">{expert.completionRate}%</span>
          </div>
        )}
        {expert.responseTimeHours !== undefined && (
          <div className="flex justify-between">
            <span className="text-neutral-500">{t('expert.responseTime', 'Antwortzeit')}</span>
            <span className="font-medium">~{expert.responseTimeHours}h</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-neutral-500">{t('expert.memberSince', 'Mitglied seit')}</span>
          <span className="font-medium">{memberSince}</span>
        </div>
      </div>
    </Card>
  );
}

