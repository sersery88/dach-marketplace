import { Zap, Bot, Database, Users, ShoppingCart, Megaphone, FileText, MessageCircle, ArrowRight } from 'lucide-preact';
import type { Category } from '@/types/index.ts';

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
  workflow: 'bg-blue-500',
  ai: 'bg-purple-500',
  data: 'bg-green-500',
  crm: 'bg-orange-500',
  ecommerce: 'bg-pink-500',
  marketing: 'bg-yellow-500',
  documents: 'bg-teal-500',
  chatbots: 'bg-indigo-500',
};

interface Props {
  categories: Category[];
}

export function CategoriesSection({ categories }: Props) {
  // Fallback categories if none loaded
  const displayCategories = categories.length > 0 ? categories : [
    { id: '1', slug: 'workflow', name: 'Workflow Automation', nameDe: 'Workflow Automatisierung' },
    { id: '2', slug: 'ai', name: 'AI Integration', nameDe: 'KI Integration' },
    { id: '3', slug: 'data', name: 'Data Pipelines', nameDe: 'Daten-Pipelines' },
    { id: '4', slug: 'crm', name: 'CRM Automation', nameDe: 'CRM Automatisierung' },
    { id: '5', slug: 'ecommerce', name: 'E-Commerce', nameDe: 'E-Commerce' },
    { id: '6', slug: 'marketing', name: 'Marketing Automation', nameDe: 'Marketing Automatisierung' },
    { id: '7', slug: 'documents', name: 'Document Processing', nameDe: 'Dokumentenverarbeitung' },
    { id: '8', slug: 'chatbots', name: 'Chatbots & Assistants', nameDe: 'Chatbots & Assistenten' },
  ] as Category[];

  return (
    <section class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Kategorien</h2>
          <p class="text-gray-600 max-w-2xl mx-auto">
            Finden Sie Experten für jede Art von Automatisierung
          </p>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          {displayCategories.slice(0, 8).map((cat) => {
            const IconComponent = categoryIcons[cat.slug] || Zap;
            const colorClass = categoryColors[cat.slug] || 'bg-blue-500';
            
            return (
              <a
                key={cat.id}
                href={`/categories/${cat.slug}`}
                class="card text-center group hover:shadow-lg transition-all duration-200"
              >
                <div class={`w-14 h-14 ${colorClass} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <IconComponent class="w-7 h-7 text-white" />
                </div>
                <h3 class="font-semibold text-gray-900">{cat.nameDe || cat.name}</h3>
              </a>
            );
          })}
        </div>

        <div class="text-center mt-8">
          <a href="/categories" class="btn btn-outline inline-flex items-center gap-2">
            Alle Kategorien
            <ArrowRight class="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

