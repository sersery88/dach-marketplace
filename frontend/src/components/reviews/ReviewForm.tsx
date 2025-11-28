import { useState } from 'react';
import { motion } from 'framer-motion';
import { StarRating } from './StarRating';
import { Button, Input } from '@/components/ui';
import { cn } from '@/lib/utils';

interface ReviewFormProps {
  onSubmit: (review: ReviewFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

export interface ReviewFormData {
  rating: number;
  title: string;
  content: string;
  communication_rating?: number;
  quality_rating?: number;
  timeliness_rating?: number;
  value_rating?: number;
}

export function ReviewForm({ onSubmit, onCancel, isLoading, className }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [communicationRating, setCommunicationRating] = useState(0);
  const [qualityRating, setQualityRating] = useState(0);
  const [timelinessRating, setTimelinessRating] = useState(0);
  const [valueRating, setValueRating] = useState(0);
  const [showDetailedRatings, setShowDetailedRatings] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || content.length < 20) return;

    onSubmit({
      rating,
      title,
      content,
      communication_rating: communicationRating || undefined,
      quality_rating: qualityRating || undefined,
      timeliness_rating: timelinessRating || undefined,
      value_rating: valueRating || undefined,
    });
  };

  const isValid = rating > 0 && content.length >= 20;

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className={cn('bg-white rounded-xl border border-neutral-200 p-6', className)}
    >
      <h3 className="text-lg font-semibold text-neutral-900 mb-6">Bewertung schreiben</h3>

      {/* Overall Rating */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Gesamtbewertung *
        </label>
        <StarRating rating={rating} size="lg" interactive onChange={setRating} />
        {rating === 0 && (
          <p className="text-sm text-red-500 mt-1">Bitte wählen Sie eine Bewertung</p>
        )}
      </div>

      {/* Title */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Titel (optional)
        </label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Zusammenfassung Ihrer Erfahrung"
          maxLength={200}
        />
      </div>

      {/* Content */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Ihre Bewertung * (min. 20 Zeichen)
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Beschreiben Sie Ihre Erfahrung mit diesem Experten..."
          rows={4}
          className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 resize-none"
          maxLength={2000}
        />
        <div className="flex justify-between text-xs text-neutral-500 mt-1">
          <span>{content.length < 20 ? `Noch ${20 - content.length} Zeichen` : '✓ Mindestlänge erreicht'}</span>
          <span>{content.length}/2000</span>
        </div>
      </div>

      {/* Detailed Ratings Toggle */}
      <button
        type="button"
        onClick={() => setShowDetailedRatings(!showDetailedRatings)}
        className="text-sm text-primary-600 hover:text-primary-700 mb-4"
      >
        {showDetailedRatings ? '− Detaillierte Bewertungen ausblenden' : '+ Detaillierte Bewertungen hinzufügen'}
      </button>

      {/* Detailed Ratings */}
      {showDetailedRatings && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="grid grid-cols-2 gap-4 mb-6 p-4 bg-neutral-50 rounded-lg"
        >
          <div>
            <label className="block text-sm text-neutral-600 mb-2">Kommunikation</label>
            <StarRating rating={communicationRating} size="md" interactive onChange={setCommunicationRating} />
          </div>
          <div>
            <label className="block text-sm text-neutral-600 mb-2">Qualität</label>
            <StarRating rating={qualityRating} size="md" interactive onChange={setQualityRating} />
          </div>
          <div>
            <label className="block text-sm text-neutral-600 mb-2">Pünktlichkeit</label>
            <StarRating rating={timelinessRating} size="md" interactive onChange={setTimelinessRating} />
          </div>
          <div>
            <label className="block text-sm text-neutral-600 mb-2">Preis-Leistung</label>
            <StarRating rating={valueRating} size="md" interactive onChange={setValueRating} />
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Abbrechen
          </Button>
        )}
        <Button type="submit" disabled={!isValid || isLoading} className="flex-1">
          {isLoading ? 'Wird gesendet...' : 'Bewertung absenden'}
        </Button>
      </div>
    </motion.form>
  );
}

export default ReviewForm;

