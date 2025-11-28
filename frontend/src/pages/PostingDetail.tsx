import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Clock, DollarSign, Zap, Calendar, Briefcase, Star,
  CheckCircle, XCircle, AlertCircle, Loader2, User, MessageSquare
} from 'lucide-react';
import { Button, Card, Skeleton } from '@/components/ui';
import { useSuccessToast, useErrorToast } from '@/components/ui/Toast';
import { usePosting, useProposals, useAcceptProposal } from '@/hooks';
import type { Proposal, ProposalStatus } from '@/types';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatPrice(cents: number, currency: string) {
  return `${(cents / 100).toLocaleString('de-CH')} ${currency.toUpperCase()}`;
}

const statusConfig: Record<ProposalStatus, { label: string; color: string }> = {
  pending: { label: 'Ausstehend', color: 'bg-yellow-100 text-yellow-700' },
  shortlisted: { label: 'Vorgemerkt', color: 'bg-blue-100 text-blue-700' },
  accepted: { label: 'Angenommen', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Abgelehnt', color: 'bg-red-100 text-red-700' },
  withdrawn: { label: 'Zurückgezogen', color: 'bg-neutral-100 text-neutral-700' },
};

function PostingDetailSkeleton() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <Card className="p-8 mb-6">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3 mb-6" />
        </Card>
        <Card className="p-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export function PostingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const showSuccess = useSuccessToast();
  const showError = useErrorToast();

  const { data: posting, isLoading: postingLoading, isError: postingError } = usePosting(id || '');
  const { data: proposalsData, isLoading: proposalsLoading } = useProposals(id || '');
  const acceptProposalMutation = useAcceptProposal();

  const proposals: Proposal[] = proposalsData?.data ?? [];

  const handleAcceptProposal = async (proposalId: string) => {
    if (!id) return;
    try {
      await acceptProposalMutation.mutateAsync({ postingId: id, proposalId });
      showSuccess('Angebot angenommen! Das Projekt wurde gestartet.');
    } catch {
      showError('Fehler beim Annehmen des Angebots');
    }
  };

  if (postingLoading) return <PostingDetailSkeleton />;

  if (postingError || !posting) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-neutral-600 mb-4">{t('projects.notFound', 'Projekt nicht gefunden')}</p>
          <Button onClick={() => navigate('/postings')}>Zurück zur Übersicht</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <Link to="/postings" className="inline-flex items-center text-neutral-600 hover:text-neutral-900 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zurück zu meinen Projekten
        </Link>

        {/* Project Summary Card */}
        <Card className="p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-neutral-900">{posting.title}</h1>
              <p className="text-neutral-600 text-sm mt-1 line-clamp-2">{posting.description}</p>
            </div>
            {posting.isUrgent && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium shrink-0">
                <Zap className="w-4 h-4" /> Dringend
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-neutral-600">
            <span className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              {posting.budgetMin && posting.budgetMax
                ? `${posting.budgetMin.toLocaleString('de-CH')} - ${posting.budgetMax.toLocaleString('de-CH')} ${posting.currency.toUpperCase()}`
                : 'Auf Anfrage'}
            </span>
            {posting.deadline && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Deadline: {formatDate(posting.deadline)}
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
        </Card>

        {/* Proposals Section */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Eingegangene Angebote ({proposals.length})
          </h2>

          {proposalsLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          )}

          {!proposalsLoading && proposals.length === 0 && (
            <div className="text-center py-8">
              <Briefcase className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-500">Noch keine Angebote eingegangen</p>
              <p className="text-sm text-neutral-400 mt-1">Experten können Angebote für Ihr Projekt einreichen</p>
            </div>
          )}

          {!proposalsLoading && proposals.length > 0 && (
            <div className="space-y-4">
              {proposals.map((proposal: Proposal, i: number) => (
                <motion.div
                  key={proposal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border border-neutral-200 rounded-lg p-5 hover:border-neutral-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        {proposal.expert?.avatarUrl ? (
                          <img src={proposal.expert.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
                        ) : (
                          <User className="w-6 h-6 text-primary-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-neutral-900">
                          {proposal.expert?.firstName} {proposal.expert?.lastName}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-neutral-500">
                          {proposal.expert && (
                            <span className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                              4.8
                            </span>
                          )}
                          <span>•</span>
                          <span>{formatDate(proposal.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig[proposal.status].color}`}>
                      {statusConfig[proposal.status].label}
                    </span>
                  </div>

                  <p className="text-neutral-700 mb-4 line-clamp-3">{proposal.coverLetter}</p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600 mb-4">
                    <span className="flex items-center gap-1 font-medium text-neutral-900">
                      <DollarSign className="w-4 h-4" />
                      {formatPrice(proposal.proposedPrice, proposal.currency)}
                    </span>
                    {proposal.proposedDuration && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {proposal.proposedDuration}
                      </span>
                    )}
                  </div>

                  {proposal.status === 'pending' && posting.status === 'open' && (
                    <div className="flex gap-3 pt-4 border-t border-neutral-100">
                      <Button
                        size="sm"
                        onClick={() => handleAcceptProposal(proposal.id)}
                        disabled={acceptProposalMutation.isPending}
                      >
                        {acceptProposalMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        )}
                        Annehmen
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Nachricht
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <XCircle className="w-4 h-4 mr-2" />
                        Ablehnen
                      </Button>
                    </div>
                  )}

                  {proposal.status === 'accepted' && (
                    <div className="flex gap-3 pt-4 border-t border-neutral-100">
                      <Button size="sm" onClick={() => navigate(`/messages?expert=${proposal.expertId}`)}>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Nachricht senden
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/checkout?proposal=${proposal.id}`)}>
                        <DollarSign className="w-4 h-4 mr-2" />
                        Zahlung starten
                      </Button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

