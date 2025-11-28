import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, CheckCircle, XCircle,
  Filter, Loader2, MessageSquare, User, FileText, Star
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  useContentReports, useResolveReport, useDismissReport,
  type ContentReport, type ReportFilters, type ReportStatus, 
  type ReportedType, type ReportAction
} from '@/hooks/useAdmin';

const statusLabels: Record<ReportStatus, string> = {
  pending: 'Ausstehend',
  reviewing: 'In Prüfung',
  resolved: 'Gelöst',
  dismissed: 'Abgelehnt',
};

const typeLabels: Record<ReportedType, string> = {
  service: 'Service',
  review: 'Bewertung',
  message: 'Nachricht',
  user: 'Benutzer',
  project_posting: 'Projektausschreibung',
};

const typeIcons: Record<ReportedType, React.ReactNode> = {
  service: <FileText className="w-4 h-4" />,
  review: <Star className="w-4 h-4" />,
  message: <MessageSquare className="w-4 h-4" />,
  user: <User className="w-4 h-4" />,
  project_posting: <FileText className="w-4 h-4" />,
};

const reasonLabels: Record<string, string> = {
  spam: 'Spam',
  inappropriate: 'Unangemessen',
  fraud: 'Betrug',
  harassment: 'Belästigung',
  copyright: 'Urheberrecht',
  other: 'Sonstiges',
};

const actionLabels: Record<ReportAction, string> = {
  none: 'Keine Aktion',
  warning: 'Verwarnung',
  content_removed: 'Inhalt entfernt',
  user_suspended: 'Benutzer gesperrt',
  user_banned: 'Benutzer gebannt',
};

export function ContentModeration() {
  const [filters, setFilters] = useState<ReportFilters>({ status: 'pending' });
  const [selectedReport, setSelectedReport] = useState<ContentReport | null>(null);
  const [selectedAction, setSelectedAction] = useState<ReportAction>('none');
  const [notes, setNotes] = useState('');

  const { data: reportsData, isLoading } = useContentReports(filters);
  const resolveReport = useResolveReport();
  const dismissReport = useDismissReport();

  const reports = reportsData?.data || [];

  const handleResolve = async () => {
    if (!selectedReport) return;
    await resolveReport.mutateAsync({ id: selectedReport.id, data: { action: selectedAction, notes } });
    setSelectedReport(null);
    setNotes('');
    setSelectedAction('none');
  };

  const handleDismiss = async (id: string) => {
    await dismissReport.mutateAsync(id);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-4 items-center">
        <Filter className="w-5 h-5 text-neutral-400" />
        <select
          value={filters.status || ''}
          onChange={(e) => setFilters({ ...filters, status: e.target.value as ReportStatus || undefined })}
          className="px-3 py-2 border border-neutral-200 rounded-lg text-sm"
        >
          <option value="">Alle Status</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select
          value={filters.reportedType || ''}
          onChange={(e) => setFilters({ ...filters, reportedType: e.target.value as ReportedType || undefined })}
          className="px-3 py-2 border border-neutral-200 rounded-lg text-sm"
        >
          <option value="">Alle Typen</option>
          {Object.entries(typeLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Reports List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12 text-neutral-500">
          <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Keine Meldungen gefunden</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 border border-neutral-200 rounded-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="flex items-center gap-1 text-sm bg-neutral-100 px-2 py-0.5 rounded">
                      {typeIcons[report.reportedType]} {typeLabels[report.reportedType]}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      report.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      report.status === 'resolved' ? 'bg-green-100 text-green-700' :
                      'bg-neutral-100 text-neutral-600'
                    }`}>
                      {statusLabels[report.status]}
                    </span>
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                      {reasonLabels[report.reason] || report.reason}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600 mb-1">
                    Gemeldet von: <span className="font-medium">{report.reporterName}</span> ({report.reporterEmail})
                  </p>
                  {report.description && (
                    <p className="text-sm text-neutral-700 mt-2">{report.description}</p>
                  )}
                  <p className="text-xs text-neutral-400 mt-2">
                    {new Date(report.createdAt).toLocaleDateString('de-DE', { 
                      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                    })}
                  </p>
                </div>
                {report.status === 'pending' && (
                  <div className="flex gap-2 ml-4">
                    <Button size="sm" variant="outline" onClick={() => setSelectedReport(report)}>
                      <AlertTriangle className="w-4 h-4 mr-1" /> Bearbeiten
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDismiss(report.id)}
                      disabled={dismissReport.isPending} className="text-neutral-600">
                      <XCircle className="w-4 h-4 mr-1" /> Ablehnen
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Resolve Modal */}
      <AnimatePresence>
        {selectedReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setSelectedReport(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Meldung bearbeiten</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Aktion</label>
                  <select
                    value={selectedAction}
                    onChange={(e) => setSelectedAction(e.target.value as ReportAction)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                  >
                    {Object.entries(actionLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Notizen</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg h-24"
                    placeholder="Optionale Notizen zur Entscheidung..."
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setSelectedReport(null)}>Abbrechen</Button>
                  <Button onClick={handleResolve} disabled={resolveReport.isPending}>
                    {resolveReport.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                    Lösen
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

