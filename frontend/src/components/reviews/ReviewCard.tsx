import { useState } from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, MessageCircle, CheckCircle, Flag, ChevronDown, ChevronUp } from 'lucide-react';
import { StarRating } from './StarRating';
import { cn } from '@/lib/utils';

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    title?: string;
    content: string;
    communication_rating?: number;
    quality_rating?: number;
    timeliness_rating?: number;
    value_rating?: number;
    is_verified: boolean;
    helpful_count: number;
    response?: string;
    response_at?: string;
    created_at: string;
    reviewer_name: string;
    reviewer_avatar?: string;
    reviewer_country: string;
  };
  onHelpful?: (id: string) => void;
  onReport?: (id: string) => void;
  className?: string;
}

export function ReviewCard({ review, onHelpful, onReport, className }: ReviewCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('de-CH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const hasDetailedRatings = review.communication_rating || review.quality_rating || 
                              review.timeliness_rating || review.value_rating;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('bg-white rounded-xl border border-neutral-200 p-6', className)}
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-lg shrink-0">
          {review.reviewer_avatar ? (
            <img src={review.reviewer_avatar} alt={review.reviewer_name} className="w-full h-full rounded-full object-cover" />
          ) : (
            review.reviewer_name.charAt(0)
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-neutral-900">{review.reviewer_name}</span>
            {review.is_verified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                <CheckCircle className="w-3 h-3" />
                Verifiziert
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <span>{review.reviewer_country}</span>
            <span>•</span>
            <span>{formatDate(review.created_at)}</span>
          </div>
        </div>
        <div className="text-right">
          <StarRating rating={review.rating} size="md" />
        </div>
      </div>

      {/* Title & Content */}
      {review.title && (
        <h4 className="font-semibold text-neutral-900 mb-2">{review.title}</h4>
      )}
      <p className="text-neutral-700 leading-relaxed">{review.content}</p>

      {/* Detailed Ratings */}
      {hasDetailedRatings && (
        <div className="mt-4">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
          >
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Detaillierte Bewertungen
          </button>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="grid grid-cols-2 gap-3 mt-3 p-4 bg-neutral-50 rounded-lg"
            >
              {review.communication_rating && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Kommunikation</span>
                  <StarRating rating={review.communication_rating} size="sm" />
                </div>
              )}
              {review.quality_rating && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Qualität</span>
                  <StarRating rating={review.quality_rating} size="sm" />
                </div>
              )}
              {review.timeliness_rating && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Pünktlichkeit</span>
                  <StarRating rating={review.timeliness_rating} size="sm" />
                </div>
              )}
              {review.value_rating && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Preis-Leistung</span>
                  <StarRating rating={review.value_rating} size="sm" />
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}

      {/* Expert Response */}
      {review.response && (
        <div className="mt-4 p-4 bg-primary-50 rounded-lg border-l-4 border-primary-500">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-4 h-4 text-primary-600" />
            <span className="font-medium text-primary-900">Antwort des Experten</span>
          </div>
          <p className="text-neutral-700 text-sm">{review.response}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100">
        <button
          onClick={() => onHelpful?.(review.id)}
          className="flex items-center gap-2 text-sm text-neutral-600 hover:text-primary-600 transition-colors"
        >
          <ThumbsUp className="w-4 h-4" />
          Hilfreich ({review.helpful_count})
        </button>
        <button
          onClick={() => onReport?.(review.id)}
          className="flex items-center gap-1 text-sm text-neutral-400 hover:text-red-500 transition-colors"
        >
          <Flag className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

export default ReviewCard;

