import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase, FileText, Clock, Plus,
  TrendingUp, Users, CheckCircle, ChevronRight
} from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

// Mock data - will be replaced with API calls
const mockStats = {
  activeProjects: 3,
  pendingProposals: 12,
  completedProjects: 8,
  totalSpent: 15420,
};

const mockRecentPostings = [
  { id: '1', title: 'n8n Workflow für CRM Integration', status: 'open', proposalCount: 5, createdAt: '2024-11-25' },
  { id: '2', title: 'ChatGPT Chatbot für Kundenservice', status: 'in_review', proposalCount: 8, createdAt: '2024-11-20' },
  { id: '3', title: 'Make.com Automatisierung für E-Commerce', status: 'assigned', proposalCount: 3, createdAt: '2024-11-15' },
];

const mockRecentBookings = [
  { id: '1', expertName: 'Max Müller', service: 'n8n Workflow Setup', status: 'pending', createdAt: '2024-11-26' },
  { id: '2', expertName: 'Anna Schmidt', service: 'AI Chatbot Development', status: 'accepted', createdAt: '2024-11-24' },
];

export function ClientDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'postings' | 'bookings'>('overview');

  const statusColors: Record<string, string> = {
    open: 'bg-green-100 text-green-700',
    in_review: 'bg-yellow-100 text-yellow-700',
    assigned: 'bg-blue-100 text-blue-700',
    completed: 'bg-neutral-100 text-neutral-700',
    pending: 'bg-yellow-100 text-yellow-700',
    accepted: 'bg-green-100 text-green-700',
    declined: 'bg-red-100 text-red-700',
  };

  const statusLabels: Record<string, string> = {
    open: 'Offen',
    in_review: 'In Prüfung',
    assigned: 'Vergeben',
    completed: 'Abgeschlossen',
    pending: 'Ausstehend',
    accepted: 'Akzeptiert',
    declined: 'Abgelehnt',
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
            <p className="text-neutral-600 mt-1">Willkommen zurück! Hier ist Ihre Übersicht.</p>
          </div>
          <Link to="/postings/new">
            <Button leftIcon={<Plus className="w-4 h-4" />} className="mt-4 sm:mt-0">
              Neues Projekt erstellen
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Briefcase, label: 'Aktive Projekte', value: mockStats.activeProjects, color: 'text-blue-600 bg-blue-100' },
            { icon: FileText, label: 'Offene Angebote', value: mockStats.pendingProposals, color: 'text-yellow-600 bg-yellow-100' },
            { icon: CheckCircle, label: 'Abgeschlossen', value: mockStats.completedProjects, color: 'text-green-600 bg-green-100' },
            { icon: TrendingUp, label: 'Ausgaben (CHF)', value: mockStats.totalSpent.toLocaleString(), color: 'text-purple-600 bg-purple-100' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                    <p className="text-sm text-neutral-500">{stat.label}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-neutral-200">
          {[
            { key: 'overview', label: 'Übersicht', icon: TrendingUp },
            { key: 'postings', label: 'Meine Projekte', icon: FileText },
            { key: 'bookings', label: 'Buchungen', icon: Clock },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab.key
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
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
                <CardTitle>Aktuelle Projektausschreibungen</CardTitle>
                <Link to="/postings" className="text-sm text-primary-600 hover:underline">
                  Alle anzeigen
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockRecentPostings.map((posting) => (
                  <Link
                    key={posting.id}
                    to={`/postings/${posting.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-900 truncate">{posting.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[posting.status]}`}>
                          {statusLabels[posting.status]}
                        </span>
                        <span className="text-xs text-neutral-500">{posting.proposalCount} Angebote</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                  </Link>
                ))}
              </CardContent>
            </Card>

            {/* Recent Bookings */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle>Aktuelle Buchungsanfragen</CardTitle>
                <Link to="/bookings" className="text-sm text-primary-600 hover:underline">
                  Alle anzeigen
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockRecentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900">{booking.expertName}</p>
                        <p className="text-sm text-neutral-500">{booking.service}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[booking.status]}`}>
                      {statusLabels[booking.status]}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

