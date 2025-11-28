import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, X, Loader2 } from 'lucide-react';
import { Button, Card, Input } from '@/components/ui';
import { useSuccessToast, useErrorToast } from '@/components/ui/Toast';
import { useCategories, useCreatePosting } from '@/hooks';
import type { ProjectPostingBudgetType, Currency } from '@/types';

interface FormData {
  title: string;
  description: string;
  requirements: string;
  categoryId: string;
  skillsRequired: string[];
  toolsRequired: string[];
  budgetType: ProjectPostingBudgetType;
  budgetMin: number;
  budgetMax: number;
  currency: Currency;
  deadline: string;
  estimatedDuration: string;
  isUrgent: boolean;
}

const initialFormData: FormData = {
  title: '',
  description: '',
  requirements: '',
  categoryId: '',
  skillsRequired: [],
  toolsRequired: [],
  budgetType: 'fixed',
  budgetMin: 0,
  budgetMax: 0,
  currency: 'chf',
  deadline: '',
  estimatedDuration: '',
  isUrgent: false,
};

const popularTools = ['n8n', 'Make', 'Zapier', 'Power Automate', 'ChatGPT', 'Claude', 'Airtable', 'Notion'];

export function CreatePosting() {
  const navigate = useNavigate();
  const showSuccess = useSuccessToast();
  const showError = useErrorToast();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [newSkill, setNewSkill] = useState('');
  const [newTool, setNewTool] = useState('');

  // Fetch categories from API
  const { data: categories = [] } = useCategories();

  // Create posting mutation
  const createPostingMutation = useCreatePosting();

  const totalSteps = 4;

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addSkill = (skill: string) => {
    if (skill && !formData.skillsRequired.includes(skill)) {
      updateField('skillsRequired', [...formData.skillsRequired, skill]);
    }
    setNewSkill('');
  };

  const removeSkill = (skill: string) => {
    updateField('skillsRequired', formData.skillsRequired.filter((s) => s !== skill));
  };

  const addTool = (tool: string) => {
    if (tool && !formData.toolsRequired.includes(tool)) {
      updateField('toolsRequired', [...formData.toolsRequired, tool]);
    }
    setNewTool('');
  };

  const removeTool = (tool: string) => {
    updateField('toolsRequired', formData.toolsRequired.filter((t) => t !== tool));
  };

  const handleSubmit = async () => {
    try {
      await createPostingMutation.mutateAsync({
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements || undefined,
        categoryId: formData.categoryId || undefined,
        skillsRequired: formData.skillsRequired,
        toolsRequired: formData.toolsRequired,
        budgetType: formData.budgetType,
        budgetMin: formData.budgetMin || undefined,
        budgetMax: formData.budgetMax || undefined,
        currency: formData.currency,
        deadline: formData.deadline || undefined,
        estimatedDuration: formData.estimatedDuration || undefined,
        isUrgent: formData.isUrgent,
      });
      showSuccess('Projekt erfolgreich erstellt!');
      navigate('/postings');
    } catch {
      showError('Fehler beim Erstellen des Projekts');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Zurück
          </button>
          <h1 className="text-2xl font-bold text-neutral-900">Neues Projekt erstellen</h1>
          <p className="text-neutral-600 mt-1">Beschreiben Sie Ihr Projekt, um passende Experten zu finden.</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  s <= step ? 'bg-primary-600 text-white' : 'bg-neutral-200 text-neutral-500'
                }`}>
                  {s}
                </div>
                {s < 4 && <div className={`w-16 sm:w-24 h-1 mx-2 ${s < step ? 'bg-primary-600' : 'bg-neutral-200'}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-neutral-500">
            <span>Grundlagen</span>
            <span>Details</span>
            <span>Budget</span>
            <span>Überprüfen</span>
          </div>
        </div>

        {/* Step Content */}
        <Card className="p-6">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Projekttitel *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    placeholder="z.B. n8n Workflow für CRM Integration"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Kategorie *</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => updateField('categoryId', e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Kategorie wählen...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Projektbeschreibung *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    rows={5}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Beschreiben Sie Ihr Projekt im Detail..."
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Benötigte Tools</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.toolsRequired.map((tool) => (
                      <span key={tool} className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                        {tool}
                        <button onClick={() => removeTool(tool)} className="hover:text-primary-900"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input value={newTool} onChange={(e) => setNewTool(e.target.value)} placeholder="Tool hinzufügen..." onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTool(newTool))} />
                    <Button variant="outline" onClick={() => addTool(newTool)}>Hinzufügen</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {popularTools.filter((t) => !formData.toolsRequired.includes(t)).slice(0, 5).map((tool) => (
                      <button key={tool} onClick={() => addTool(tool)} className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 rounded-full text-sm text-neutral-700">{tool}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Benötigte Skills</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.skillsRequired.map((skill) => (
                      <span key={skill} className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        {skill}
                        <button onClick={() => removeSkill(skill)} className="hover:text-green-900"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Skill hinzufügen..." onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill(newSkill))} />
                    <Button variant="outline" onClick={() => addSkill(newSkill)}>Hinzufügen</Button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Anforderungen (optional)</label>
                  <textarea value={formData.requirements} onChange={(e) => updateField('requirements', e.target.value)} rows={3} className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500" placeholder="Spezielle Anforderungen..." />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Budget-Typ</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[{ value: 'fixed', label: 'Festpreis' }, { value: 'hourly', label: 'Stundensatz' }, { value: 'range', label: 'Bereich' }].map((type) => (
                      <button key={type.value} onClick={() => updateField('budgetType', type.value as ProjectPostingBudgetType)} className={`p-3 rounded-lg border-2 text-center transition-colors ${formData.budgetType === type.value ? 'border-primary-600 bg-primary-50' : 'border-neutral-200 hover:border-neutral-300'}`}>
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">{formData.budgetType === 'range' ? 'Min Budget' : 'Budget'}</label>
                    <Input type="number" value={formData.budgetMin || ''} onChange={(e) => updateField('budgetMin', Number(e.target.value))} placeholder="0" />
                  </div>
                  {formData.budgetType === 'range' && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Max Budget</label>
                      <Input type="number" value={formData.budgetMax || ''} onChange={(e) => updateField('budgetMax', Number(e.target.value))} placeholder="0" />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Währung</label>
                    <select value={formData.currency} onChange={(e) => updateField('currency', e.target.value as Currency)} className="w-full px-4 py-2 border border-neutral-300 rounded-lg">
                      <option value="chf">CHF</option>
                      <option value="eur">EUR</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Geschätzte Dauer</label>
                    <select value={formData.estimatedDuration} onChange={(e) => updateField('estimatedDuration', e.target.value)} className="w-full px-4 py-2 border border-neutral-300 rounded-lg">
                      <option value="">Auswählen...</option>
                      <option value="1-2 days">1-2 Tage</option>
                      <option value="3-7 days">3-7 Tage</option>
                      <option value="1-2 weeks">1-2 Wochen</option>
                      <option value="2-4 weeks">2-4 Wochen</option>
                      <option value="1-3 months">1-3 Monate</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={formData.isUrgent} onChange={(e) => updateField('isUrgent', e.target.checked)} className="w-5 h-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500" />
                    <span className="text-sm font-medium text-neutral-700">Dringend - Projekt hat hohe Priorität</span>
                  </label>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-neutral-900">Projektübersicht</h3>
                <div className="space-y-4 bg-neutral-50 rounded-lg p-4">
                  <div><span className="text-sm text-neutral-500">Titel:</span><p className="font-medium">{formData.title || '-'}</p></div>
                  <div><span className="text-sm text-neutral-500">Kategorie:</span><p className="font-medium">{categories.find((c) => c.id === formData.categoryId)?.name || '-'}</p></div>
                  <div><span className="text-sm text-neutral-500">Beschreibung:</span><p className="text-sm">{formData.description || '-'}</p></div>
                  <div><span className="text-sm text-neutral-500">Tools:</span><div className="flex flex-wrap gap-1 mt-1">{formData.toolsRequired.map((t) => <span key={t} className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded text-xs">{t}</span>)}</div></div>
                  <div><span className="text-sm text-neutral-500">Budget:</span><p className="font-medium">{formData.budgetMin} {formData.budgetType === 'range' && `- ${formData.budgetMax}`} {formData.currency.toUpperCase()}</p></div>
                  {formData.isUrgent && <div className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-sm">⚡ Dringend</div>}
                </div>
              </div>
            )}
          </motion.div>

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-neutral-200">
            <Button variant="ghost" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>
            {step < totalSteps ? (
              <Button onClick={() => setStep(step + 1)}>
                Weiter
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={createPostingMutation.isPending}>
                {createPostingMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Wird erstellt...
                  </>
                ) : (
                  'Projekt veröffentlichen'
                )}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

