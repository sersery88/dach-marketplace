import { motion } from 'framer-motion';
import {
  TrendingUp,
  Users,
  DollarSign,
  BarChart3,
  Star,
  Briefcase,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { usePlatformAnalytics } from '@/hooks/useAdmin';

export function PlatformAnalytics() {
  const { data: analytics, isLoading, error } = usePlatformAnalytics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="text-center py-12 text-red-600">
        Fehler beim Laden der Analytics
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF',
    }).format(amount / 100);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('de-CH').format(num);
  };

  const proposalAcceptRate = analytics.conversions.totalProposals > 0
    ? ((analytics.conversions.acceptedProposals / analytics.conversions.totalProposals) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Gesamtumsatz (GMV)"
          value={formatCurrency(analytics.revenue.totalGmv)}
          icon={DollarSign}
          color="green"
        />
        <MetricCard
          title="Plattform-Einnahmen"
          value={formatCurrency(analytics.revenue.totalPlatformRevenue)}
          icon={TrendingUp}
          color="blue"
        />
        <MetricCard
          title="Transaktionen"
          value={formatNumber(analytics.revenue.totalTransactions)}
          icon={BarChart3}
          color="purple"
        />
        <MetricCard
          title="Ø Bestellwert"
          value={formatCurrency(analytics.revenue.averageOrderValue)}
          icon={DollarSign}
          color="orange"
        />
      </div>

      {/* Growth Metrics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary-600" />
          Wachstum
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <GrowthStat label="Neue Nutzer (30 Tage)" value={analytics.userGrowth.newUsers30d} />
          <GrowthStat label="Neue Nutzer (7 Tage)" value={analytics.userGrowth.newUsers7d} />
          <GrowthStat label="Neue Experten (30 Tage)" value={analytics.userGrowth.newExperts30d} />
          <GrowthStat label="Neue Services (30 Tage)" value={analytics.userGrowth.newServices30d} />
        </div>
      </div>

      {/* Conversion Metrics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-primary-600" />
          Projekt-Konversionen
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <ConversionStat label="Offene Ausschreibungen" value={analytics.conversions.openPostings} />
          <ConversionStat label="Aktive Projekte" value={analytics.conversions.activeProjects} />
          <ConversionStat label="Abgeschlossen" value={analytics.conversions.completedPostings} />
          <ConversionStat label="Angebote gesamt" value={analytics.conversions.totalProposals} />
          <ConversionStat label="Annahmequote" value={`${proposalAcceptRate}%`} highlight />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Categories */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary-600" />
            Beliebte Kategorien
          </h3>
          <div className="space-y-3">
            {analytics.popularCategories.slice(0, 5).map((cat, index) => (
              <div key={cat.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500 w-6">{index + 1}.</span>
                  <span className="text-sm font-medium text-gray-900">{cat.name}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{cat.serviceCount} Services</span>
                  <span className="font-medium text-primary-600">{cat.totalOrders} Bestellungen</span>
                </div>
              </div>
            ))}
            {analytics.popularCategories.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">Keine Daten verfügbar</p>
            )}
          </div>
        </div>

        {/* Top Experts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-primary-600" />
            Top Experten
          </h3>
          <div className="space-y-3">
            {analytics.topExperts.slice(0, 5).map((expert, index) => (
              <div key={expert.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500 w-6">{index + 1}.</span>
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      {expert.firstName} {expert.lastName}
                    </span>
                    {expert.headline && (
                      <p className="text-xs text-gray-500 truncate max-w-[200px]">{expert.headline}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-600">{expert.completedProjects} Projekte</span>
                  <span className="font-medium text-green-600">{formatCurrency(expert.totalEarnings)}</span>
                </div>
              </div>
            ))}
            {analytics.topExperts.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">Keine Daten verfügbar</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'green' | 'blue' | 'purple' | 'orange';
  trend?: { value: number; isPositive: boolean };
}

function MetricCard({ title, value, icon: Icon, color, trend }: MetricCardProps) {
  const colorClasses = {
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {trend.value}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{title}</p>
    </motion.div>
  );
}

function GrowthStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center p-4 bg-gray-50 rounded-lg">
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function ConversionStat({ label, value, highlight }: { label: string; value: number | string; highlight?: boolean }) {
  return (
    <div className={`text-center p-4 rounded-lg ${highlight ? 'bg-primary-50' : 'bg-gray-50'}`}>
      <p className={`text-2xl font-bold ${highlight ? 'text-primary-600' : 'text-gray-900'}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

