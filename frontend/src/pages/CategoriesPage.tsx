import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Workflow, Brain, Database, Users, ShoppingCart, Megaphone,
  FileText, MessageCircle, ChevronRight, ArrowRight, AlertCircle
} from 'lucide-react';
import { Card, Skeleton } from '@/components/ui';
import { useCategoryTree } from '@/hooks';
import type { CategoryTree } from '@/types';

const categoryIcons: Record<string, React.ReactNode> = {
  workflow: <Workflow className="w-8 h-8" />,
  brain: <Brain className="w-8 h-8" />,
  database: <Database className="w-8 h-8" />,
  users: <Users className="w-8 h-8" />,
  'shopping-cart': <ShoppingCart className="w-8 h-8" />,
  megaphone: <Megaphone className="w-8 h-8" />,
  'file-text': <FileText className="w-8 h-8" />,
  'message-circle': <MessageCircle className="w-8 h-8" />,
  // Additional icon mappings
  'zap': <Workflow className="w-8 h-8" />,
  'cpu': <Brain className="w-8 h-8" />,
  'link': <Database className="w-8 h-8" />,
  'user-check': <Users className="w-8 h-8" />,
  'shopping-bag': <ShoppingCart className="w-8 h-8" />,
  'trending-up': <Megaphone className="w-8 h-8" />,
  'file': <FileText className="w-8 h-8" />,
  'bot': <MessageCircle className="w-8 h-8" />,
};

// Loading skeleton for categories
function CategoriesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="h-full">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <Skeleton className="w-14 h-14 rounded-xl" />
              <Skeleton className="w-16 h-6 rounded-full" />
            </div>
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-4 w-24 mb-4" />
            <div className="space-y-2 mb-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <Skeleton className="h-5 w-28" />
          </div>
        </Card>
      ))}
    </div>
  );
}

interface CategoryCardProps {
  categoryTree: CategoryTree;
  index: number;
}

function CategoryCard({ categoryTree, index }: CategoryCardProps) {
  const { t } = useTranslation();
  // CategoryTree now extends Category directly (flattened from backend)
  const { children = [], ...category } = categoryTree;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
      <Card variant="interactive" className="h-full">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-primary-100 text-primary-600 rounded-xl">
              {categoryIcons[category.icon || 'workflow'] || <Workflow className="w-8 h-8" />}
            </div>
            {category.isFeatured && (
              <span className="px-2 py-1 bg-accent-100 text-accent-700 text-xs font-medium rounded-full">Featured</span>
            )}
          </div>
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">{category.nameDe || category.name}</h3>
          <p className="text-neutral-600 text-sm mb-4">{category.descriptionDe || category.description}</p>
          <div className="flex items-center text-sm text-neutral-500 mb-4">
            <span className="font-medium text-primary-600">{category.serviceCount ?? 0}</span>
            <span className="ml-1">{t('categories.servicesAvailable', 'Services verfügbar')}</span>
          </div>
          {children.length > 0 && (
            <div className="space-y-2 mb-4">
              {children.slice(0, 3).map((child) => (
                <Link key={child.id} to={`/categories/${child.slug}`}
                  className="flex items-center justify-between text-sm text-neutral-600 hover:text-primary-600 transition-colors group">
                  <span className="flex items-center">
                    <ChevronRight className="w-4 h-4 mr-1 text-neutral-400 group-hover:text-primary-500" />
                    {child.nameDe || child.name}
                  </span>
                  <span className="text-neutral-400">{child.serviceCount ?? 0}</span>
                </Link>
              ))}
            </div>
          )}
          <Link to={`/categories/${category.slug}`}
            className="inline-flex items-center text-primary-600 font-medium hover:text-primary-700 transition-colors group">
            {t('categories.viewAll', 'Alle anzeigen')}
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </Card>
    </motion.div>
  );
}

export function CategoriesPage() {
  const { t } = useTranslation();
  const { data: categoryTree, isLoading, isError, error } = useCategoryTree();

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <div className="bg-linear-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('categories.title', 'Alle Kategorien')}</h1>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto">
              {t('categories.subtitle', 'Entdecken Sie unsere spezialisierten Automatisierungs- und KI-Services')}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <CategoriesSkeleton />
        ) : isError ? (
          <Card padding="lg" className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t('categories.error', 'Fehler beim Laden')}</h2>
            <p className="text-neutral-600">
              {error instanceof Error ? error.message : t('categories.errorMessage', 'Kategorien konnten nicht geladen werden.')}
            </p>
          </Card>
        ) : categoryTree && categoryTree.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryTree.map((cat, index) => (
              <CategoryCard key={cat.id} categoryTree={cat} index={index} />
            ))}
          </div>
        ) : (
          <Card padding="lg" className="text-center">
            <Workflow className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t('categories.empty', 'Keine Kategorien')}</h2>
            <p className="text-neutral-600">{t('categories.emptyMessage', 'Es sind noch keine Kategorien verfügbar.')}</p>
          </Card>
        )}
      </div>
    </div>
  );
}

export default CategoriesPage;
