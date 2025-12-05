import { define } from '@/utils.ts';
import { api, endpoints } from '@/lib/api.ts';
import type { Category } from '@/types/index.ts';
import { Zap, Bot, Database, Users, ShoppingCart, Megaphone, FileText, MessageCircle, ArrowRight } from 'lucide-preact';

const categoryIcons: Record<string, typeof Zap> = {
  workflow: Zap,
  ai: Bot,
  data: Database,
  crm: Users,
  ecommerce: ShoppingCart,
  marketing: Megaphone,
  documents: FileText,
  chatbots: MessageCircle,
};

const categoryColors: Record<string, string> = {
  workflow: 'from-blue-400 to-blue-600',
  ai: 'from-purple-400 to-purple-600',
  data: 'from-green-400 to-green-600',
  crm: 'from-orange-400 to-orange-600',
  ecommerce: 'from-pink-400 to-pink-600',
  marketing: 'from-yellow-400 to-yellow-600',
  documents: 'from-teal-400 to-teal-600',
  chatbots: 'from-indigo-400 to-indigo-600',
};

export const handler = define.handlers({
  async GET(_ctx) {
    let categories: Category[] = [];

    try {
      const res = await api.get<{ data: Category[] }>(endpoints.categories.list);
      categories = res.data || [];
    } catch (e) {
      console.error('Failed to fetch categories:', e);
    }

    // Fallback categories
    if (categories.length === 0) {
      categories = [
        { id: '1', slug: 'workflow', name: 'Workflow Automation', nameDe: 'Workflow Automatisierung', description: 'Automatisieren Sie Ihre Geschäftsprozesse' },
        { id: '2', slug: 'ai', name: 'AI Integration', nameDe: 'KI Integration', description: 'Integrieren Sie KI in Ihre Workflows' },
        { id: '3', slug: 'data', name: 'Data Pipelines', nameDe: 'Daten-Pipelines', description: 'Automatisierte Datenverarbeitung' },
        { id: '4', slug: 'crm', name: 'CRM Automation', nameDe: 'CRM Automatisierung', description: 'CRM-Prozesse automatisieren' },
        { id: '5', slug: 'ecommerce', name: 'E-Commerce', nameDe: 'E-Commerce', description: 'Shop-Automatisierung' },
        { id: '6', slug: 'marketing', name: 'Marketing Automation', nameDe: 'Marketing Automatisierung', description: 'Marketing-Workflows' },
        { id: '7', slug: 'documents', name: 'Document Processing', nameDe: 'Dokumentenverarbeitung', description: 'Dokumente automatisch verarbeiten' },
        { id: '8', slug: 'chatbots', name: 'Chatbots & Assistants', nameDe: 'Chatbots & Assistenten', description: 'KI-gestützte Assistenten' },
      ] as Category[];
    }

    return { data: { categories } };
  },
});

export default define.page<typeof handler>(({ data }) => {
  const { categories } = data;
  return (
    <div class="min-h-screen bg-gray-50">
      <div class="bg-white border-b border-gray-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Kategorien</h1>
          <p class="text-gray-600">Entdecken Sie Automatisierungslösungen nach Kategorie</p>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const IconComponent = categoryIcons[cat.slug] || Zap;
            const colorClass = categoryColors[cat.slug] || 'from-blue-400 to-blue-600';
            
            return (
              <a
                key={cat.id}
                href={`/categories/${cat.slug}`}
                class="card group hover:shadow-lg transition-all duration-200"
              >
                <div class={`w-16 h-16 bg-gradient-to-br ${colorClass} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <IconComponent class="w-8 h-8 text-white" />
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">{cat.nameDe || cat.name}</h3>
                <p class="text-gray-600 text-sm mb-4">{cat.description}</p>
                <div class="flex items-center text-blue-600 text-sm font-medium group-hover:gap-2 transition-all">
                  <span>Services ansehen</span>
                  <ArrowRight class="w-4 h-4 ml-1" />
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
});

