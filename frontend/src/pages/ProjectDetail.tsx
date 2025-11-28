import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Clock, DollarSign, Zap, Calendar, Briefcase,
  Send, CheckCircle, AlertCircle, Loader2
} from 'lucide-react';
import { Button, Card, Input, Skeleton } from '@/components/ui';
import { Textarea } from '@/components/ui/Textarea';
import { useSuccessToast, useErrorToast } from '@/components/ui/Toast';
import { usePosting, useCreateProposal } from '@/hooks';
import { useAuthStore } from '@/stores/authStore';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatBudget(min?: number, max?: number, currency?: string) {
  const curr = (currency || 'chf').toUpperCase();
  if (min && max) return `${min.toLocaleString('de-CH')} - ${max.toLocaleString('de-CH')} ${curr}`;
  if (min) return `ab ${min.toLocaleString('de-CH')} ${curr}`;
  if (max) return `bis ${max.toLocaleString('de-CH')} ${curr}`;
  return 'Auf Anfrage';
}

function ProjectDetailSkeleton() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <Card className="p-8">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3 mb-6" />
          <div className="flex gap-4 mb-6">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-32 w-full" />
        </Card>
      </div>
    </div>
  );
}

export function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuthStore();
  const showSuccess = useSuccessToast();
  const showError = useErrorToast();

  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposalData, setProposalData] = useState({
    coverLetter: '',
    proposedPrice: '',
    proposedDuration: '',
  });

  const { data: posting, isLoading, isError } = usePosting(id || '');
  const createProposalMutation = useCreateProposal(id || '');

  const handleSubmitProposal = async () => {
    if (!proposalData.coverLetter || !proposalData.proposedPrice) {
      showError('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }

    try {
      await createProposalMutation.mutateAsync({
        coverLetter: proposalData.coverLetter,
        proposedPrice: parseFloat(proposalData.proposedPrice) * 100, // Convert to cents
        currency: posting?.currency || 'chf',
        proposedDuration: proposalData.proposedDuration || undefined,
      });
      showSuccess('Angebot erfolgreich eingereicht!');
      setShowProposalForm(false);
      setProposalData({ coverLetter: '', proposedPrice: '', proposedDuration: '' });
    } catch {
      showError('Fehler beim Einreichen des Angebots');
    }
  };

  if (isLoading) return <ProjectDetailSkeleton />;

  if (isError || !posting) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-neutral-600 mb-4">{t('projects.notFound', 'Projekt nicht gefunden')}</p>
          <Button onClick={() => navigate('/projects')}>Zurück zur Übersicht</Button>
        </div>
      </div>
    );
  }

  const isExpert = user?.role === 'expert';
  const canSubmitProposal = isAuthenticated && isExpert && posting.status === 'open';

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <Link to="/projects" className="inline-flex items-center text-neutral-600 hover:text-neutral-900 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common.back', 'Zurück')}
        </Link>

        {/* Project Details Card */}
        <Card className="p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-2xl font-bold text-neutral-900">{posting.title}</h1>
            {posting.isUrgent && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                <Zap className="w-4 h-4" /> Dringend
              </span>
            )}
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap gap-4 text-sm text-neutral-600 mb-6 pb-6 border-b border-neutral-200">
            <span className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              {formatBudget(posting.budgetMin, posting.budgetMax, posting.currency)}
            </span>
            {posting.deadline && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Deadline: {formatDate(posting.deadline)}
              </span>
            )}
            {posting.estimatedDuration && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {posting.estimatedDuration}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Briefcase className="w-4 h-4" />
              {posting.proposalCount} Angebote
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Erstellt: {formatDate(posting.createdAt)}
            </span>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-3">Projektbeschreibung</h2>
            <p className="text-neutral-700 whitespace-pre-wrap">{posting.description}</p>
          </div>

          {/* Requirements */}
          {posting.requirements && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-3">Anforderungen</h2>
              <p className="text-neutral-700 whitespace-pre-wrap">{posting.requirements}</p>
            </div>
          )}

          {/* Skills & Tools */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {posting.skillsRequired.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-neutral-700 mb-2">Benötigte Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {posting.skillsRequired.map((skill: string) => (
                    <span key={skill} className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm">{skill}</span>
                  ))}
                </div>
              </div>
            )}
            {posting.toolsRequired.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-neutral-700 mb-2">Benötigte Tools</h3>
                <div className="flex flex-wrap gap-2">
                  {posting.toolsRequired.map((tool: string) => (
                    <span key={tool} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm">{tool}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Proposal Button */}
          {canSubmitProposal && !showProposalForm && (
            <Button onClick={() => setShowProposalForm(true)} className="w-full md:w-auto">
              <Send className="w-4 h-4 mr-2" />
              Angebot einreichen
            </Button>
          )}

          {!isAuthenticated && (
            <div className="bg-neutral-50 rounded-lg p-4 text-center">
              <p className="text-neutral-600 mb-3">Melden Sie sich an, um ein Angebot einzureichen</p>
              <Button onClick={() => navigate('/login', { state: { from: `/projects/${id}` } })}>
                Anmelden
              </Button>
            </div>
          )}

          {isAuthenticated && !isExpert && (
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-blue-700 mb-3">Nur Experten können Angebote einreichen</p>
              <Button variant="outline" onClick={() => navigate('/become-expert')}>
                Experte werden
              </Button>
            </div>
          )}
        </Card>

        {/* Proposal Form */}
        {showProposalForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-8">
              <h2 className="text-xl font-bold text-neutral-900 mb-6">Angebot einreichen</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Anschreiben <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    value={proposalData.coverLetter}
                    onChange={(e) => setProposalData({ ...proposalData, coverLetter: e.target.value })}
                    placeholder="Beschreiben Sie, warum Sie der richtige Experte für dieses Projekt sind..."
                    rows={6}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Ihr Preis ({(posting.currency || 'chf').toUpperCase()}) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      value={proposalData.proposedPrice}
                      onChange={(e) => setProposalData({ ...proposalData, proposedPrice: e.target.value })}
                      placeholder="z.B. 3000"
                    />
                    <p className="text-xs text-neutral-500 mt-1">
                      Budget: {formatBudget(posting.budgetMin, posting.budgetMax, posting.currency)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Geschätzte Dauer
                    </label>
                    <Input
                      value={proposalData.proposedDuration}
                      onChange={(e) => setProposalData({ ...proposalData, proposedDuration: e.target.value })}
                      placeholder="z.B. 2 Wochen"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={handleSubmitProposal}
                    disabled={createProposalMutation.isPending}
                  >
                    {createProposalMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Wird gesendet...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Angebot absenden
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setShowProposalForm(false)}>
                    Abbrechen
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

