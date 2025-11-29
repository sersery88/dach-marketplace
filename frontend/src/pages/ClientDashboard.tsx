import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase, FileText, Clock, Plus, Settings,
  TrendingUp, Users, CheckCircle, ChevronRight, MessageSquare, Search
} from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Skeleton } from '@/components/ui';
import { useMyPostings, useProjects, usePayments } from '@/hooks';
import { useAuthStore } from '@/stores/authStore';

export function ClientDashboard() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'postings' | 'projects'>('overview');

  // Fetch real data
  const { data: postingsData, isLoading: postingsLoading } = useMyPostings();
  const { data: projectsData, isLoading: projectsLoading } = useProjects({ role: 'client' });
  const { data: payments = [], isLoading: paymentsLoading } = usePayments();

  const postings = postingsData?.data ?? [];
  const projects = projectsData ?? [];
  const isLoading = postingsLoading || projectsLoading;

  // Calculate stats
  const activeProjects = projects.filter(p => p.status === 'in_progress').length;
  const openPostings = postings.filter(p => p.status === 'open').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const totalSpent = payments.reduce((sum, p) => p.status === 'succeeded' ? sum + p.amount : sum, 0);

  const statusColors: Record<string, string> = {
    open: 'bg-green-100 text-green-700',
    in_review: 'bg-yellow-100 text-yellow-700',
    assigned: 'bg-blue-100 text-blue-700',
    completed: 'bg-neutral-100 text-neutral-700',
    pending: 'bg-yellow-100 text-yellow-700',
    accepted: 'bg-green-100 text-green-700',
    declined: 'bg-red-100 text-red-700',
    in_progress: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  const statusLabels: Record<string, string> = {
    open: 'Offen',
    in_review: 'In Prüfung',
    assigned: 'Vergeben',
    completed: 'Abgeschlossen',
    pending: 'Ausstehend',
    accepted: 'Akzeptiert',
    declined: 'Abgelehnt',
    in_progress: 'In Bearbeitung',
    cancelled: 'Abgebrochen',
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
            <p className="text-neutral-600 mt-1">Willkommen zurück, {user?.firstName}! Hier ist Ihre Übersicht.</p>
          </div>
          <div className="flex gap-3 mt-4 sm:mt-0">
            <Link to="/postings/new">
              <Button leftIcon={<Plus className="w-4 h-4" />}>
                Neues Projekt
              </Button>
            </Link>
            <Link to="/settings">
              <Button variant="outline" leftIcon={<Settings className="w-4 h-4" />}>
                Einstellungen
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Briefcase, label: 'Aktive Projekte', value: activeProjects, color: 'text-blue-600 bg-blue-100', loading: isLoading },
            { icon: FileText, label: 'Offene Ausschreibungen', value: openPostings, color: 'text-yellow-600 bg-yellow-100', loading: isLoading },
            { icon: CheckCircle, label: 'Abgeschlossen', value: completedProjects, color: 'text-green-600 bg-green-100', loading: isLoading },
            { icon: TrendingUp, label: 'Ausgaben', value: `${(totalSpent / 100).toLocaleString('de-CH')} CHF`, color: 'text-purple-600 bg-purple-100', loading: paymentsLoading },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="p-4">
                {stat.loading ? (
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-12" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                      <p className="text-sm text-neutral-500">{stat.label}</p>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-neutral-100 p-1 rounded-lg w-fit">
          {[
            { key: 'overview', label: 'Übersicht' },
            { key: 'postings', label: 'Ausschreibungen' },
            { key: 'projects', label: 'Projekte' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Postings */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle>Aktuelle Ausschreibungen</CardTitle>
                <Link to="/postings" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
                  Alle anzeigen <ChevronRight className="w-4 h-4" />
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {postingsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3">
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))
                ) : postings.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                    <p>Noch keine Ausschreibungen</p>
                    <Link to="/postings/new">
                      <Button size="sm" className="mt-3">Erste Ausschreibung erstellen</Button>
                    </Link>
                  </div>
                ) : (
                  postings.slice(0, 4).map((posting) => (
                    <Link
                      key={posting.id}
                      to={`/postings/${posting.id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-900 truncate">{posting.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[posting.status] || 'bg-neutral-100'}`}>
                            {statusLabels[posting.status] || posting.status}
                          </span>
                          <span className="text-xs text-neutral-500">{posting.proposalCount ?? 0} Angebote</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0" />
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Recent Projects */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle>Aktuelle Projekte</CardTitle>
                <Link to="/projects" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
                  Alle anzeigen <ChevronRight className="w-4 h-4" />
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {projectsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))
                ) : projects.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500">
                    <Briefcase className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                    <p>Noch keine Projekte</p>
                    <Link to="/experts">
                      <Button size="sm" variant="outline" className="mt-3">Experten finden</Button>
                    </Link>
                  </div>
                ) : (
                  projects.slice(0, 4).map((project) => (
                    <Link key={project.id} to={`/workspace/${project.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900 line-clamp-1">{project.title}</p>
                          <p className="text-sm text-neutral-500">{project.expert?.firstName ?? 'Experte'}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[project.status] || 'bg-neutral-100'}`}>
                        {statusLabels[project.status] || project.status}
                      </span>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle>Schnellaktionen</CardTitle></CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Link to="/postings/new" className="flex items-center gap-3 p-4 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
                    <Plus className="w-8 h-8 text-primary-600" />
                    <div>
                      <p className="font-medium text-neutral-900">Neues Projekt</p>
                      <p className="text-sm text-neutral-500">Ausschreibung erstellen</p>
                    </div>
                  </Link>
                  <Link to="/experts" className="flex items-center gap-3 p-4 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
                    <Search className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="font-medium text-neutral-900">Experten finden</p>
                      <p className="text-sm text-neutral-500">Spezialisten suchen</p>
                    </div>
                  </Link>
                  <Link to="/messages" className="flex items-center gap-3 p-4 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
                    <MessageSquare className="w-8 h-8 text-purple-600" />
                    <div>
                      <p className="font-medium text-neutral-900">Nachrichten</p>
                      <p className="text-sm text-neutral-500">Kommunikation</p>
                    </div>
                  </Link>
                  <Link to="/services" className="flex items-center gap-3 p-4 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
                    <Briefcase className="w-8 h-8 text-emerald-600" />
                    <div>
                      <p className="font-medium text-neutral-900">Services</p>
                      <p className="text-sm text-neutral-500">Angebote durchsuchen</p>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Postings Tab */}
        {activeTab === 'postings' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Meine Ausschreibungen ({postings.length})</CardTitle>
              <Link to="/postings/new"><Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>Neue Ausschreibung</Button></Link>
            </CardHeader>
            <CardContent>
              {postings.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-neutral-300" />
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">Noch keine Ausschreibungen</h3>
                  <p className="text-neutral-500 mb-4">Erstellen Sie Ihre erste Projektausschreibung und finden Sie Experten.</p>
                  <Link to="/postings/new"><Button>Erste Ausschreibung erstellen</Button></Link>
                </div>
              ) : (
                <div className="divide-y divide-neutral-100">
                  {postings.map((posting) => (
                    <Link key={posting.id} to={`/postings/${posting.id}`} className="flex items-center justify-between py-4 hover:bg-neutral-50 -mx-4 px-4 transition-colors">
                      <div>
                        <h4 className="font-medium text-neutral-900">{posting.title}</h4>
                        <div className="flex items-center gap-3 text-sm text-neutral-500 mt-1">
                          <span>{posting.proposalCount ?? 0} Angebote</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(posting.createdAt).toLocaleDateString('de-CH')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[posting.status] || 'bg-neutral-100'}`}>{statusLabels[posting.status] || posting.status}</span>
                        <ChevronRight className="w-5 h-5 text-neutral-400" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <Card>
            <CardHeader><CardTitle>Meine Projekte ({projects.length})</CardTitle></CardHeader>
            <CardContent>
              {projects.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="w-16 h-16 mx-auto mb-4 text-neutral-300" />
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">Noch keine Projekte</h3>
                  <p className="text-neutral-500 mb-4">Sobald Sie einen Experten beauftragen, erscheinen die Projekte hier.</p>
                  <Link to="/experts"><Button variant="outline">Experten finden</Button></Link>
                </div>
              ) : (
                <div className="divide-y divide-neutral-100">
                  {projects.map((project) => (
                    <Link key={project.id} to={`/workspace/${project.id}`} className="flex items-center justify-between py-4 hover:bg-neutral-50 -mx-4 px-4 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                          <Briefcase className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-neutral-900">{project.title}</h4>
                          <div className="flex items-center gap-3 text-sm text-neutral-500 mt-1">
                            <span>{project.expert?.firstName ?? 'Experte'}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(project.createdAt).toLocaleDateString('de-CH')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[project.status]}`}>{statusLabels[project.status]}</span>
                        <ChevronRight className="w-5 h-5 text-neutral-400" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

