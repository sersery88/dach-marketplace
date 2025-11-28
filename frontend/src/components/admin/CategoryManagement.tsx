import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Star, ChevronRight, ChevronDown, Loader2, X } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { Textarea } from '@/components/ui/Textarea';
import { useCategories } from '@/hooks/useCategories';
import { useCreateCategory, useUpdateCategory, useDeleteCategory, useToggleCategoryFeatured, type CreateCategoryRequest } from '@/hooks/useAdmin';
import { useSuccessToast, useErrorToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';
import type { Category } from '@/types';

interface CategoryFormData {
  parentId?: string;
  name: string;
  nameDe: string;
  description: string;
  descriptionDe: string;
  icon: string;
  sortOrder: number;
}

const initialFormData: CategoryFormData = {
  name: '', nameDe: '', description: '', descriptionDe: '', icon: '', sortOrder: 0,
};

export function CategoryManagement() {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>(initialFormData);

  const showSuccess = useSuccessToast();
  const showError = useErrorToast();

  const { data: categories, isLoading } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const toggleFeaturedMutation = useToggleCategoryFeatured();

  const toggleExpand = (id: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const openCreateForm = (parentId?: string) => {
    setEditingCategory(null);
    setFormData({ ...initialFormData, parentId });
    setIsFormOpen(true);
  };

  const openEditForm = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      parentId: category.parentId,
      name: category.name,
      nameDe: category.nameDe,
      description: category.description || '',
      descriptionDe: category.descriptionDe || '',
      icon: category.icon || '',
      sortOrder: category.sortOrder,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data: CreateCategoryRequest = {
      ...formData,
      parentId: formData.parentId || undefined,
      description: formData.description || undefined,
      descriptionDe: formData.descriptionDe || undefined,
      icon: formData.icon || undefined,
    };
    try {
      if (editingCategory) {
        await updateMutation.mutateAsync({ id: editingCategory.id, data });
        showSuccess('Kategorie aktualisiert');
      } else {
        await createMutation.mutateAsync(data);
        showSuccess('Kategorie erstellt');
      }
      setIsFormOpen(false);
      setFormData(initialFormData);
    } catch {
      showError('Fehler beim Speichern');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Kategorie wirklich loeschen?')) return;
    try {
      await deleteMutation.mutateAsync(id);
      showSuccess('Kategorie geloescht');
    } catch {
      showError('Fehler beim Loeschen');
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      await toggleFeaturedMutation.mutateAsync(id);
      showSuccess('Featured-Status geaendert');
    } catch {
      showError('Fehler beim Aendern');
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-neutral-900">Kategorien verwalten</h2>
        <Button onClick={() => openCreateForm()}>
          <Plus className="w-4 h-4 mr-2" />
          Neue Kategorie
        </Button>
      </div>
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {categories && categories.length > 0 ? (
          categories.map(cat => <CategoryRow key={cat.id} category={cat} level={0} expandedCategories={expandedCategories} toggleExpand={toggleExpand} handleToggleFeatured={handleToggleFeatured} openCreateForm={openCreateForm} openEditForm={openEditForm} handleDelete={handleDelete} />)
        ) : (
          <div className="text-center py-12 text-neutral-500"><p>Keine Kategorien vorhanden</p></div>
        )}
      </div>
      <AnimatePresence>
        {isFormOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setIsFormOpen(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">{editingCategory ? 'Kategorie bearbeiten' : 'Neue Kategorie'}</h3>
                <button onClick={() => setIsFormOpen(false)} className="p-1 hover:bg-neutral-100 rounded"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Name (EN)" value={formData.name} onChange={e => setFormData(d => ({ ...d, name: e.target.value }))} required />
                  <Input label="Name (DE)" value={formData.nameDe} onChange={e => setFormData(d => ({ ...d, nameDe: e.target.value }))} required />
                </div>
                <Textarea label="Beschreibung (EN)" value={formData.description} onChange={e => setFormData(d => ({ ...d, description: e.target.value }))} rows={2} />
                <Textarea label="Beschreibung (DE)" value={formData.descriptionDe} onChange={e => setFormData(d => ({ ...d, descriptionDe: e.target.value }))} rows={2} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Icon (Emoji)" value={formData.icon} onChange={e => setFormData(d => ({ ...d, icon: e.target.value }))} placeholder="robot" />
                  <Input label="Sortierung" type="number" value={formData.sortOrder} onChange={e => setFormData(d => ({ ...d, sortOrder: parseInt(e.target.value) || 0 }))} />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Abbrechen</Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {editingCategory ? 'Speichern' : 'Erstellen'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CategoryRow({ category, level, expandedCategories, toggleExpand, handleToggleFeatured, openCreateForm, openEditForm, handleDelete }: { category: Category; level: number; expandedCategories: Set<string>; toggleExpand: (id: string) => void; handleToggleFeatured: (id: string) => void; openCreateForm: (parentId?: string) => void; openEditForm: (cat: Category) => void; handleDelete: (id: string) => void }) {
  const hasChildren = category.children && category.children.length > 0;
  const isExpanded = expandedCategories.has(category.id);
  return (
    <div>
      <div className={cn('flex items-center gap-2 p-3 hover:bg-neutral-50 border-b border-neutral-100', level > 0 && 'ml-6')}>
        {hasChildren ? (
          <button onClick={() => toggleExpand(category.id)} className="p-1">
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        ) : <div className="w-6" />}
        {category.icon && <span className="text-lg">{category.icon}</span>}
        <div className="flex-1">
          <div className="font-medium text-neutral-900">{category.nameDe}</div>
          <div className="text-xs text-neutral-500">{category.name} - {category.serviceCount} Services</div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => handleToggleFeatured(category.id)} className={cn('p-1.5 rounded', category.isFeatured ? 'text-amber-500' : 'text-neutral-300 hover:text-amber-400')} title={category.isFeatured ? 'Featured entfernen' : 'Als Featured markieren'}>
            <Star className="w-4 h-4" fill={category.isFeatured ? 'currentColor' : 'none'} />
          </button>
          <button onClick={() => openCreateForm(category.id)} className="p-1.5 hover:bg-neutral-100 rounded" title="Unterkategorie"><Plus className="w-4 h-4 text-neutral-500" /></button>
          <button onClick={() => openEditForm(category)} className="p-1.5 hover:bg-neutral-100 rounded" title="Bearbeiten"><Edit2 className="w-4 h-4 text-neutral-500" /></button>
          <button onClick={() => handleDelete(category.id)} className="p-1.5 hover:bg-neutral-100 rounded" title="Loeschen"><Trash2 className="w-4 h-4 text-red-500" /></button>
        </div>
      </div>
      {hasChildren && isExpanded && category.children!.map(child => <CategoryRow key={child.id} category={child} level={level + 1} expandedCategories={expandedCategories} toggleExpand={toggleExpand} handleToggleFeatured={handleToggleFeatured} openCreateForm={openCreateForm} openEditForm={openEditForm} handleDelete={handleDelete} />)}
    </div>
  );
}

export default CategoryManagement;
