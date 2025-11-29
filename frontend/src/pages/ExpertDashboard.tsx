import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase, Package, Star, TrendingUp, Clock, Plus, Eye,
  MessageSquare, ChevronRight, DollarSign, Users,
  CheckCircle, AlertCircle, Settings
} from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Skeleton } from '@/components/ui';
import { useServices, useProjects, usePaymentStats, useConnectStatus } from '@/hooks';
import { useAuthStore } from '@/stores/authStore';
import type { Service, Project } from '@/types';

// Stat card component
function StatCard({ icon: Icon, label, value, subValue, color, isLoading }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subValue?: string;
  color: string;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-neutral-600">{label}</p>
          <p className="text-2xl font-bold text-neutral-900">{value}</p>
          {subValue && <p className="text-xs text-neutral-500">{subValue}</p>}
        </div>
      </div>
    </Card>
  );
}

export function ExpertDashboard() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'projects' | 'earnings'>('overview');

  // Fetch data
  const { data: servicesData, isLoading: servicesLoading } = useServices({ expertId: user?.id });
  const { data: projectsData, isLoading: projectsLoading } = useProjects({ role: 'expert' });
  const { stats: paymentStats, isLoading: paymentsLoading } = usePaymentStats();
  const { data: connectStatus, isLoading: connectLoading } = useConnectStatus();

  const services: Service[] = servicesData?.data ?? [];
  const projects: Project[] = projectsData ?? [];
  const isLoading = servicesLoading || projectsLoading || paymentsLoading;

  // Calculate stats
  const activeServices = services.filter(s => s.isActive).length;
  const activeProjects = projects.filter(p => p.status === 'in_progress').length;
  const pendingProposals = projects.filter(p => p.status === 'pending').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const totalEarnings = paymentStats?.totalEarnings ?? 0;

  const statusColors: Record<string, string> = {
    draft: 'bg-neutral-100 text-neutral-700',
    active: 'bg-green-100 text-green-700',
    paused: 'bg-yellow-100 text-yellow-700',
    pending: 'bg-yellow-100 text-yellow-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  const statusLabels: Record<string, string> = {
    draft: 'Entwurf',
    active: 'Aktiv',
    paused: 'Pausiert',
    pending: 'Ausstehend',
    in_progress: 'In Bearbeitung',
    completed: 'Abgeschlossen',
    cancelled: 'Abgebrochen',
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Experten-Dashboard</h1>
            <p className="text-neutral-600 mt-1">
              Willkommen zurück, {user?.firstName}! Hier ist Ihre Übersicht.
            </p>
          </div>
          <div className="flex gap-3 mt-4 sm:mt-0">
            <Link to="/services/new">
              <Button leftIcon={<Plus className="w-4 h-4" />}>
                Neuer Service
              </Button>
            </Link>
            <Link to="/settings">
              <Button variant="outline" leftIcon={<Settings className="w-4 h-4" />}>
                Einstellungen
              </Button>
            </Link>
          </div>
        </div>

        {/* Stripe Connect Alert */}
        {!connectLoading && connectStatus && !connectStatus.chargesEnabled && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-yellow-800">Zahlungen einrichten</p>
              <p className="text-sm text-yellow-700 mt-1">
                Verbinden Sie Ihr Stripe-Konto, um Zahlungen von Kunden zu empfangen.
              </p>
            </div>
            <Link to="/payments">
              <Button size="sm" variant="outline" className="border-yellow-300 text-yellow-800 hover:bg-yellow-100">
                Jetzt einrichten
              </Button>
            </Link>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
            <StatCard icon={Package} label="Aktive Services" value={activeServices} color="text-blue-600 bg-blue-100" isLoading={isLoading} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <StatCard icon={Briefcase} label="Aktive Projekte" value={activeProjects} subValue={`${pendingProposals} ausstehend`} color="text-purple-600 bg-purple-100" isLoading={isLoading} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <StatCard icon={CheckCircle} label="Abgeschlossen" value={completedProjects} color="text-green-600 bg-green-100" isLoading={isLoading} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <StatCard icon={DollarSign} label="Einnahmen" value={`${(totalEarnings / 100).toLocaleString('de-CH')} CHF`} subValue="Diesen Monat" color="text-emerald-600 bg-emerald-100" isLoading={isLoading} />
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6 bg-neutral-100 p-1 rounded-lg w-fit">
          {(['overview', 'services', 'projects', 'earnings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {tab === 'overview' && 'Übersicht'}
              {tab === 'services' && 'Meine Services'}
              {tab === 'projects' && 'Projekte'}
              {tab === 'earnings' && 'Einnahmen'}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Services */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle>Meine Services</CardTitle>
                <Link to="/services" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
                  Alle anzeigen <ChevronRight className="w-4 h-4" />
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {servicesLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3">
                      <Skeleton className="h-12 w-12 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))
                ) : services.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500">
                    <Package className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                    <p>Noch keine Services erstellt</p>
                    <Link to="/services/new">
                      <Button size="sm" className="mt-3">Ersten Service erstellen</Button>
                    </Link>
                  </div>
                ) : (
                  services.slice(0, 4).map((service) => (
                    <Link key={service.id} to={`/services/${service.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
                          <Package className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900 line-clamp-1">{service.title}</p>
                          <div className="flex items-center gap-2 text-sm text-neutral-500">
                            <span>{service.price} {service.currency}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {service.viewCount ?? 0}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${service.isActive ? statusColors['active'] : statusColors['paused']}`}>
                        {service.isActive ? statusLabels['active'] : statusLabels['paused']}
                      </span>
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
                    <Link to="/browse">
                      <Button size="sm" variant="outline" className="mt-3">Projekte entdecken</Button>
                    </Link>
                  </div>
                ) : (
                  projects.slice(0, 4).map((project) => (
                    <Link key={project.id} to={`/workspace/${project.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <Users className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900 line-clamp-1">{project.title}</p>
                          <p className="text-sm text-neutral-500">{project.client?.firstName ?? 'Kunde'}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[project.status] || 'bg-neutral-100'}`}>
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
                  <Link to="/services/new" className="flex items-center gap-3 p-4 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
                    <Plus className="w-8 h-8 text-primary-600" />
                    <div>
                      <p className="font-medium text-neutral-900">Neuer Service</p>
                      <p className="text-sm text-neutral-500">Angebot erstellen</p>
                    </div>
                  </Link>
                  <Link to="/messages" className="flex items-center gap-3 p-4 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
                    <MessageSquare className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="font-medium text-neutral-900">Nachrichten</p>
                      <p className="text-sm text-neutral-500">Kunden kontaktieren</p>
                    </div>
                  </Link>
                  <Link to="/browse" className="flex items-center gap-3 p-4 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
                    <Briefcase className="w-8 h-8 text-purple-600" />
                    <div>
                      <p className="font-medium text-neutral-900">Aufträge finden</p>
                      <p className="text-sm text-neutral-500">Projekte durchsuchen</p>
                    </div>
                  </Link>
                  <Link to="/payments" className="flex items-center gap-3 p-4 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
                    <TrendingUp className="w-8 h-8 text-emerald-600" />
                    <div>
                      <p className="font-medium text-neutral-900">Einnahmen</p>
                      <p className="text-sm text-neutral-500">Zahlungen verwalten</p>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Meine Services ({services.length})</CardTitle>
              <Link to="/services/new"><Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>Neuer Service</Button></Link>
            </CardHeader>
            <CardContent>
              {services.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 mx-auto mb-4 text-neutral-300" />
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">Noch keine Services</h3>
                  <p className="text-neutral-500 mb-4">Erstellen Sie Ihren ersten Service und beginnen Sie, Kunden zu gewinnen.</p>
                  <Link to="/services/new"><Button>Ersten Service erstellen</Button></Link>
                </div>
              ) : (
                <div className="divide-y divide-neutral-100">
                  {services.map((service) => (
                    <div key={service.id} className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg bg-neutral-100 flex items-center justify-center">
                          <Package className="w-8 h-8 text-neutral-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-neutral-900">{service.title}</h4>
                          <div className="flex items-center gap-3 text-sm text-neutral-500 mt-1">
                            <span>{service.price} {service.currency}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500" /> {service.ratingAverage?.toFixed(1) ?? '–'}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {service.viewCount ?? 0} Aufrufe</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${service.isActive ? statusColors['active'] : statusColors['paused']}`}>{service.isActive ? statusLabels['active'] : statusLabels['paused']}</span>
                        <Link to={`/services/${service.id}/edit`}><Button size="sm" variant="outline">Bearbeiten</Button></Link>
                      </div>
                    </div>
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
                  <p className="text-neutral-500 mb-4">Sobald Kunden Ihre Services buchen, erscheinen die Projekte hier.</p>
                  <Link to="/browse"><Button variant="outline">Aufträge durchsuchen</Button></Link>
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
                            <span>{project.client?.firstName ?? 'Kunde'}</span>
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

        {/* Earnings Tab */}
        {activeTab === 'earnings' && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-3 gap-4">
              <Card className="p-6">
                <p className="text-sm text-neutral-600 mb-1">Gesamteinnahmen</p>
                <p className="text-3xl font-bold text-neutral-900">{((paymentStats?.totalEarnings ?? 0) / 100).toLocaleString('de-CH')} CHF</p>
              </Card>
              <Card className="p-6">
                <p className="text-sm text-neutral-600 mb-1">Diesen Monat</p>
                <p className="text-3xl font-bold text-emerald-600">{((paymentStats?.thisMonthEarnings ?? 0) / 100).toLocaleString('de-CH')} CHF</p>
              </Card>
              <Card className="p-6">
                <p className="text-sm text-neutral-600 mb-1">Ausstehend</p>
                <p className="text-3xl font-bold text-yellow-600">{((paymentStats?.pendingBalance ?? 0) / 100).toLocaleString('de-CH')} CHF</p>
              </Card>
            </div>
            <Card>
              <CardHeader><CardTitle>Zahlungsübersicht</CardTitle></CardHeader>
              <CardContent>
                <Link to="/payments" className="text-primary-600 hover:underline">Zur Zahlungsübersicht →</Link>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

