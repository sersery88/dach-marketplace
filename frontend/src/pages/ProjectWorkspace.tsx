import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Clock, DollarSign, User, MessageSquare,
  CheckCircle, AlertCircle, Loader2, FileText, Upload, Send,
  Package, Milestone, RefreshCw, Star
} from 'lucide-react';
import { Button, Card, Skeleton } from '@/components/ui';
import { Textarea } from '@/components/ui/Textarea';
import { useSuccessToast, useErrorToast } from '@/components/ui/Toast';
import { useAuthStore } from '@/stores/authStore';
import { useProject, useDeliverProject, useCompleteProject, useRequestRevision, useCreateReview } from '@/hooks';
import type { Project, ProjectStatus } from '@/types';

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

const statusConfig: Record<ProjectStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Ausstehend', color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-4 h-4" /> },
  accepted: { label: 'Angenommen', color: 'bg-blue-100 text-blue-700', icon: <CheckCircle className="w-4 h-4" /> },
  paid: { label: 'Bezahlt', color: 'bg-green-100 text-green-700', icon: <DollarSign className="w-4 h-4" /> },
  in_progress: { label: 'In Bearbeitung', color: 'bg-primary-100 text-primary-700', icon: <RefreshCw className="w-4 h-4" /> },
  delivered: { label: 'Geliefert', color: 'bg-purple-100 text-purple-700', icon: <Package className="w-4 h-4" /> },
  revision: { label: 'Überarbeitung', color: 'bg-orange-100 text-orange-700', icon: <RefreshCw className="w-4 h-4" /> },
  completed: { label: 'Abgeschlossen', color: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-4 h-4" /> },
  cancelled: { label: 'Abgebrochen', color: 'bg-red-100 text-red-700', icon: <AlertCircle className="w-4 h-4" /> },
  disputed: { label: 'Streitfall', color: 'bg-red-100 text-red-700', icon: <AlertCircle className="w-4 h-4" /> },
  refunded: { label: 'Erstattet', color: 'bg-neutral-100 text-neutral-700', icon: <DollarSign className="w-4 h-4" /> },
};

function ProjectWorkspaceSkeleton() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </Card>
            <Card className="p-6">
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-24 w-full" />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProjectWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const showSuccess = useSuccessToast();
  const showError = useErrorToast();

  const [deliveryMessage, setDeliveryMessage] = useState('');
  const [revisionReason, setRevisionReason] = useState('');
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [communicationRating, setCommunicationRating] = useState(5);
  const [qualityRating, setQualityRating] = useState(5);
  const [timelinessRating, setTimelinessRating] = useState(5);

  // API hooks
  const { data: project, isLoading, isError } = useProject(id || '');
  const deliverMutation = useDeliverProject();
  const completeMutation = useCompleteProject();
  const revisionMutation = useRequestRevision();
  const reviewMutation = useCreateReview();

  const isExpert = user?.role === 'expert';
  const isClient = user?.role === 'client';

  const handleSubmitDelivery = async () => {
    if (!deliveryMessage.trim() || !id) {
      showError('Bitte beschreiben Sie die Lieferung');
      return;
    }
    try {
      await deliverMutation.mutateAsync({ projectId: id, data: { message: deliveryMessage } });
      showSuccess('Lieferung erfolgreich eingereicht!');
      setDeliveryMessage('');
    } catch {
      showError('Fehler beim Einreichen der Lieferung');
    }
  };

  const handleCompleteProject = async () => {
    if (!id) return;
    try {
      await completeMutation.mutateAsync(id);
      showSuccess('Projekt abgeschlossen! Zahlung wird freigegeben.');
    } catch {
      showError('Fehler beim Abschließen des Projekts');
    }
  };

  const handleRequestRevision = async () => {
    if (!revisionReason.trim() || !id) {
      showError('Bitte geben Sie einen Grund für die Überarbeitung an');
      return;
    }
    try {
      await revisionMutation.mutateAsync({ projectId: id, data: { reason: revisionReason } });
      showSuccess('Überarbeitung angefordert');
      setRevisionReason('');
      setShowRevisionForm(false);
    } catch {
      showError('Fehler beim Anfordern der Überarbeitung');
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewContent.trim() || reviewContent.length < 20 || !id || !project) {
      showError('Bewertung muss mindestens 20 Zeichen lang sein');
      return;
    }
    try {
      const proj = project as Project;
      await reviewMutation.mutateAsync({
        projectId: id,
        serviceId: proj.serviceId,
        rating: reviewRating,
        title: reviewTitle || undefined,
        content: reviewContent,
        communicationRating,
        qualityRating,
        timelinessRating,
        isPublic: true,
      });
      showSuccess('Vielen Dank für Ihre Bewertung!');
      setShowReviewForm(false);
    } catch {
      showError('Fehler beim Einreichen der Bewertung');
    }
  };

  if (isLoading) return <ProjectWorkspaceSkeleton />;

  if (isError || !project) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-neutral-600 mb-4">Projekt nicht gefunden</p>
          <Button onClick={() => navigate('/dashboard')}>Zurück zum Dashboard</Button>
        </div>
      </div>
    );
  }

  // Type assertion after null check
  const typedProject = project as Project;
  const status = typedProject.status as ProjectStatus;

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <Link to="/dashboard" className="inline-flex items-center text-neutral-600 hover:text-neutral-900 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zurück zum Dashboard
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Header */}
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-xl font-bold text-neutral-900">{typedProject.title}</h1>
                  <p className="text-neutral-600 mt-1">{typedProject.description}</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig[status].color}`}>
                  {statusConfig[status].icon}
                  {statusConfig[status].label}
                </span>
              </div>

              {typedProject.requirements && (
                <div className="mt-4 pt-4 border-t border-neutral-200">
                  <h3 className="text-sm font-medium text-neutral-700 mb-2">Anforderungen</h3>
                  <p className="text-neutral-600 text-sm">{typedProject.requirements}</p>
                </div>
              )}
            </Card>

            {/* Activity Timeline */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <Milestone className="w-5 h-5" />
                Projektverlauf
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="w-0.5 h-full bg-neutral-200 mt-2" />
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-medium text-neutral-900">Projekt gestartet</p>
                    <p className="text-sm text-neutral-500">{formatDate(typedProject.createdAt)}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <RefreshCw className="w-4 h-4 text-primary-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900">In Bearbeitung</p>
                    <p className="text-sm text-neutral-500">Experte arbeitet am Projekt</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Delivery Section (Expert only) */}
            {isExpert && (status === 'in_progress' || status === 'revision') && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  {status === 'revision' ? 'Überarbeitung einreichen' : 'Lieferung einreichen'}
                </h2>
                {status === 'revision' && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                    <p className="text-orange-700 text-sm">
                      Der Kunde hat eine Überarbeitung angefordert. Bitte reichen Sie die überarbeitete Version ein.
                    </p>
                  </div>
                )}
                <div className="space-y-4">
                  <Textarea
                    value={deliveryMessage}
                    onChange={(e) => setDeliveryMessage(e.target.value)}
                    placeholder="Beschreiben Sie die Lieferung und fügen Sie relevante Links hinzu..."
                    rows={4}
                  />
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Dateien anhängen
                    </Button>
                    <Button onClick={handleSubmitDelivery} disabled={deliverMutation.isPending}>
                      {deliverMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      Lieferung einreichen
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Review Delivery (Client only) */}
            {isClient && status === 'delivered' && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">Lieferung prüfen</h2>
                <p className="text-neutral-600 mb-4">Der Experte hat die Arbeit eingereicht. Bitte prüfen Sie die Lieferung.</p>

                {!showRevisionForm ? (
                  <div className="flex gap-3">
                    <Button onClick={handleCompleteProject} disabled={completeMutation.isPending}>
                      {completeMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      Akzeptieren & Zahlung freigeben
                    </Button>
                    <Button variant="outline" onClick={() => setShowRevisionForm(true)}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Überarbeitung anfordern ({typedProject.revisionsUsed}/{typedProject.revisionsAllowed})
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Textarea
                      value={revisionReason}
                      onChange={(e) => setRevisionReason(e.target.value)}
                      placeholder="Beschreiben Sie, was überarbeitet werden soll..."
                      rows={4}
                    />
                    <div className="flex gap-3">
                      <Button onClick={handleRequestRevision} disabled={revisionMutation.isPending}>
                        {revisionMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4 mr-2" />
                        )}
                        Überarbeitung anfordern
                      </Button>
                      <Button variant="outline" onClick={() => setShowRevisionForm(false)}>
                        Abbrechen
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Review Prompt (Client only, after completion) */}
            {isClient && status === 'completed' && !showReviewForm && (
              <Card className="p-6 bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-200 flex items-center justify-center flex-shrink-0">
                    <Star className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-neutral-900 mb-2">Wie war Ihre Erfahrung?</h2>
                    <p className="text-neutral-600 mb-4">
                      Ihr Projekt wurde erfolgreich abgeschlossen! Teilen Sie Ihre Erfahrung mit anderen Kunden.
                    </p>
                    <Button onClick={() => setShowReviewForm(true)}>
                      <Star className="w-4 h-4 mr-2" />
                      Bewertung schreiben
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Review Form */}
            {isClient && showReviewForm && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Bewertung schreiben
                </h2>
                <div className="space-y-6">
                  {/* Overall Rating */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Gesamtbewertung *
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-8 h-8 ${star <= reviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-300'}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category Ratings */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Kommunikation</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button key={star} type="button" onClick={() => setCommunicationRating(star)} className="focus:outline-none">
                            <Star className={`w-5 h-5 ${star <= communicationRating ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-300'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Qualität</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button key={star} type="button" onClick={() => setQualityRating(star)} className="focus:outline-none">
                            <Star className={`w-5 h-5 ${star <= qualityRating ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-300'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Pünktlichkeit</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button key={star} type="button" onClick={() => setTimelinessRating(star)} className="focus:outline-none">
                            <Star className={`w-5 h-5 ${star <= timelinessRating ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-300'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Titel (optional)</label>
                    <input
                      type="text"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      placeholder="Zusammenfassung Ihrer Erfahrung"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      maxLength={200}
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Ihre Bewertung * (min. 20 Zeichen)</label>
                    <Textarea
                      value={reviewContent}
                      onChange={(e) => setReviewContent(e.target.value)}
                      placeholder="Beschreiben Sie Ihre Erfahrung mit diesem Experten..."
                      rows={4}
                    />
                    <p className="text-xs text-neutral-500 mt-1">{reviewContent.length}/2000 Zeichen</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button onClick={handleSubmitReview} disabled={reviewMutation.isPending}>
                      {reviewMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Star className="w-4 h-4 mr-2" />
                      )}
                      Bewertung absenden
                    </Button>
                    <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                      Abbrechen
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Details */}
            <Card className="p-6">
              <h3 className="font-semibold text-neutral-900 mb-4">Projektdetails</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Preis</span>
                  <span className="font-medium">{formatPrice(typedProject.price, typedProject.currency)}</span>
                </div>
                {typedProject.deliveryDate && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Lieferdatum</span>
                    <span className="font-medium">{formatDate(typedProject.deliveryDate)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-neutral-500">Erstellt</span>
                  <span className="font-medium">{formatDate(typedProject.createdAt)}</span>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="font-semibold text-neutral-900 mb-4">Aktionen</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/messages')}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Nachricht senden
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Dateien anzeigen
                </Button>
              </div>
            </Card>

            {/* Participant Info */}
            <Card className="p-6">
              <h3 className="font-semibold text-neutral-900 mb-4">
                {isExpert ? 'Auftraggeber' : 'Experte'}
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-neutral-900">Max Mustermann</p>
                  <p className="text-sm text-neutral-500">Mitglied seit 2024</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

