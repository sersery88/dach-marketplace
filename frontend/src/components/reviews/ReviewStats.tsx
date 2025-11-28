import { StarRating } from './StarRating';
import { cn } from '@/lib/utils';

interface ReviewStatsProps {
  stats: {
    total_reviews: number;
    average_rating: number;
    rating_distribution: {
      five_star: number;
      four_star: number;
      three_star: number;
      two_star: number;
      one_star: number;
    };
    average_communication?: number;
    average_quality?: number;
    average_timeliness?: number;
    average_value?: number;
  };
  className?: string;
}

export function ReviewStats({ stats, className }: ReviewStatsProps) {
  const distribution = [
    { stars: 5, count: stats.rating_distribution.five_star },
    { stars: 4, count: stats.rating_distribution.four_star },
    { stars: 3, count: stats.rating_distribution.three_star },
    { stars: 2, count: stats.rating_distribution.two_star },
    { stars: 1, count: stats.rating_distribution.one_star },
  ];

  const maxCount = Math.max(...distribution.map(d => d.count), 1);

  return (
    <div className={cn('bg-white rounded-xl border border-neutral-200 p-6', className)}>
      {/* Overall Rating */}
      <div className="flex items-center gap-6 mb-6">
        <div className="text-center">
          <div className="text-5xl font-bold text-neutral-900">{stats.average_rating.toFixed(1)}</div>
          <StarRating rating={stats.average_rating} size="lg" className="justify-center mt-2" />
          <div className="text-sm text-neutral-500 mt-1">{stats.total_reviews} Bewertungen</div>
        </div>

        {/* Distribution Bars */}
        <div className="flex-1 space-y-2">
          {distribution.map(({ stars, count }) => (
            <div key={stars} className="flex items-center gap-2">
              <span className="w-8 text-sm text-neutral-600 text-right">{stars}★</span>
              <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
              </div>
              <span className="w-8 text-sm text-neutral-500">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Averages */}
      {(stats.average_communication || stats.average_quality || stats.average_timeliness || stats.average_value) && (
        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-neutral-100">
          {stats.average_communication && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">Kommunikation</span>
              <div className="flex items-center gap-2">
                <StarRating rating={stats.average_communication} size="sm" />
                <span className="text-sm font-medium">{stats.average_communication.toFixed(1)}</span>
              </div>
            </div>
          )}
          {stats.average_quality && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">Qualität</span>
              <div className="flex items-center gap-2">
                <StarRating rating={stats.average_quality} size="sm" />
                <span className="text-sm font-medium">{stats.average_quality.toFixed(1)}</span>
              </div>
            </div>
          )}
          {stats.average_timeliness && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">Pünktlichkeit</span>
              <div className="flex items-center gap-2">
                <StarRating rating={stats.average_timeliness} size="sm" />
                <span className="text-sm font-medium">{stats.average_timeliness.toFixed(1)}</span>
              </div>
            </div>
          )}
          {stats.average_value && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">Preis-Leistung</span>
              <div className="flex items-center gap-2">
                <StarRating rating={stats.average_value} size="sm" />
                <span className="text-sm font-medium">{stats.average_value.toFixed(1)}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ReviewStats;

