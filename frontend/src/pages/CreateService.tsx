import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileText, Package, Image, Check, ChevronRight, ChevronLeft, Plus, Trash2 } from 'lucide-react';
import { Button, Card, Input, Textarea } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { useCategories } from '@/hooks';
import { api } from '@/api/client';
import { useSuccessToast, useErrorToast } from '@/components/ui/Toast';


const packageSchema = z.object({
  name: z.string().min(1, 'Name erforderlich').max(50),
  description: z.string().min(10, 'Min. 10 Zeichen').max(500),
  price: z.number().min(1, 'Min. 1').max(100000),
  deliveryTimeDays: z.number().min(1).max(365),
  revisionsIncluded: z.number().min(0).max(10),
  features: z.array(z.string()).min(1, 'Min. 1 Feature'),
  isPopular: z.boolean().optional(),
});

const serviceSchema = z.object({
  categoryId: z.string().uuid('Kategorie wählen'),
  title: z.string().min(10, 'Min. 10 Zeichen').max(200),
  description: z.string().min(100, 'Min. 100 Zeichen').max(10000),
  shortDescription: z.string().min(20, 'Min. 20 Zeichen').max(300),
  pricingType: z.enum(['fixed', 'hourly', 'project_based', 'custom']),
  price: z.number().min(1).max(100000),
  currency: z.enum(['chf', 'eur']),
  deliveryTimeDays: z.number().min(1).max(365),
  revisionsIncluded: z.number().min(0).max(10),
  features: z.array(z.string()).min(1, 'Min. 1 Feature'),
  requirements: z.string().optional(),
  tags: z.array(z.string()).max(10).optional(),
  packages: z.array(packageSchema).optional(),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

const STEPS = [
  { id: 1, title: 'Details', icon: FileText },
  { id: 2, title: 'Pakete', icon: Package },
  { id: 3, title: 'Medien', icon: Image },
];

const PRICING_TYPES = [
  { value: 'fixed', label: 'Festpreis' },
  { value: 'hourly', label: 'Stundensatz' },
  { value: 'project_based', label: 'Projektbasiert' },
  { value: 'custom', label: 'Individuell' },
];

export function CreateService() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const showSuccess = useSuccessToast();
  const showError = useErrorToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: categories } = useCategories();

  const { register, handleSubmit, control, formState: { errors } } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      pricingType: 'fixed', currency: 'chf', deliveryTimeDays: 7, revisionsIncluded: 2,
      features: [''], tags: [], packages: [],
    },
  });

  const { fields: featureFields, append: addFeature, remove: removeFeature } = useFieldArray({ control, name: 'features' as never });
  const { fields: packageFields, append: addPackage, remove: removePackage } = useFieldArray({ control, name: 'packages' });

  if (!isAuthenticated) { navigate('/login', { state: { from: '/services/new' } }); return null; }

  const handleNext = () => { if (currentStep < 3) setCurrentStep(currentStep + 1); };
  const handleBack = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

  const onSubmit = async (data: ServiceFormData) => {
    setIsSubmitting(true);
    try {
      const payload = { ...data, price: data.price * 100, packages: data.packages?.map(p => ({ ...p, price: p.price * 100 })) };
      await api.post('/services', payload);
      showSuccess(t('service.createSuccess', 'Service erfolgreich erstellt!'));
      navigate('/dashboard');
    } catch { showError(t('service.createError', 'Fehler beim Erstellen')); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">{t('service.create', 'Service erstellen')}</h1>
          <p className="text-neutral-600">{t('service.createSubtitle', 'Erstelle einen neuen Service für deine Kunden')}</p>
        </div>
        <div className="flex justify-center mb-8">
          {STEPS.map((step, i) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= step.id ? 'bg-primary-600 text-white' : 'bg-neutral-200 text-neutral-500'}`}>
                {currentStep > step.id ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
              </div>
              <span className={`ml-2 text-sm font-medium hidden sm:inline ${currentStep >= step.id ? 'text-primary-600' : 'text-neutral-500'}`}>{step.title}</span>
              {i < STEPS.length - 1 && <div className={`w-12 h-0.5 mx-4 ${currentStep > step.id ? 'bg-primary-600' : 'bg-neutral-200'}`} />}
            </div>
          ))}
        </div>
        <Card padding="lg">
          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <Step1 register={register} errors={errors} categories={categories || []} featureFields={featureFields} addFeature={addFeature} removeFeature={removeFeature} />
              )}
              {currentStep === 2 && (
                <Step2 register={register} packageFields={packageFields} addPackage={addPackage} removePackage={removePackage} />
              )}
              {currentStep === 3 && <Step3 />}
            </AnimatePresence>
            <div className="flex justify-between mt-8 pt-6 border-t">
              {currentStep > 1 ? (
                <Button type="button" variant="outline" onClick={handleBack}><ChevronLeft className="w-4 h-4 mr-1" /> Zurück</Button>
              ) : <div />}
              {currentStep < 3 ? (
                <Button type="button" onClick={handleNext}>Weiter <ChevronRight className="w-4 h-4 ml-1" /></Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Erstellen...' : 'Service erstellen'} <Check className="w-4 h-4 ml-1" /></Button>
              )}
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

// Step 1: Service Details
function Step1({ register, errors, categories, featureFields, addFeature, removeFeature }: any) {
  const { t } = useTranslation();
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">{t('service.category', 'Kategorie')} *</label>
          <select {...register('categoryId')} className="w-full px-4 py-2 border border-neutral-300 rounded-lg">
            <option value="">Kategorie wählen...</option>
            {categories.map((cat: any) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
          {errors.categoryId && <p className="text-sm text-red-600 mt-1">{errors.categoryId.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">{t('service.pricingType', 'Preismodell')} *</label>
          <select {...register('pricingType')} className="w-full px-4 py-2 border border-neutral-300 rounded-lg">
            {PRICING_TYPES.map(pt => <option key={pt.value} value={pt.value}>{pt.label}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">{t('service.title', 'Titel')} *</label>
        <Input {...register('title')} placeholder="z.B. n8n Workflow Automation Setup" error={errors.title?.message} />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">{t('service.shortDescription', 'Kurzbeschreibung')} *</label>
        <Textarea {...register('shortDescription')} rows={2} placeholder="Kurze Beschreibung für die Übersicht..." error={errors.shortDescription?.message} />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">{t('service.description', 'Beschreibung')} *</label>
        <Textarea {...register('description')} rows={6} placeholder="Ausführliche Beschreibung deines Services..." error={errors.description?.message} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">{t('service.price', 'Preis')} *</label>
          <Input type="number" {...register('price', { valueAsNumber: true })} min={1} error={errors.price?.message} />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">{t('service.currency', 'Währung')}</label>
          <select {...register('currency')} className="w-full px-4 py-2 border border-neutral-300 rounded-lg">
            <option value="chf">CHF</option><option value="eur">EUR</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">{t('service.deliveryDays', 'Lieferzeit (Tage)')}</label>
          <Input type="number" {...register('deliveryTimeDays', { valueAsNumber: true })} min={1} max={365} />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">{t('service.revisions', 'Revisionen')}</label>
          <Input type="number" {...register('revisionsIncluded', { valueAsNumber: true })} min={0} max={10} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">{t('service.features', 'Features')} *</label>
        {featureFields.map((field: any, index: number) => (
          <div key={field.id} className="flex gap-2 mb-2">
            <Input {...register(`features.${index}`)} placeholder="z.B. Unbegrenzte Revisionen" className="flex-1" />
            {featureFields.length > 1 && <Button type="button" variant="outline" size="sm" onClick={() => removeFeature(index)}><Trash2 className="w-4 h-4" /></Button>}
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => addFeature('')}><Plus className="w-4 h-4 mr-1" /> Feature hinzufügen</Button>
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">{t('service.requirements', 'Anforderungen')}</label>
        <Textarea {...register('requirements')} rows={3} placeholder="Was benötigst du vom Kunden?" />
      </div>
    </motion.div>
  );
}

// Step 2: Packages
function Step2({ register, packageFields, addPackage, removePackage }: any) {
  const { t } = useTranslation();
  const defaultPackage = { name: '', description: '', price: 0, deliveryTimeDays: 7, revisionsIncluded: 2, features: [''], isPopular: false };
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <p className="text-neutral-600">{t('service.packagesHint', 'Erstelle optionale Pakete (Basic, Standard, Premium) für verschiedene Preisstufen.')}</p>
      {packageFields.map((field: any, index: number) => (
        <Card key={field.id} padding="md" className="relative">
          <Button type="button" variant="outline" size="sm" className="absolute top-2 right-2" onClick={() => removePackage(index)}><Trash2 className="w-4 h-4" /></Button>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div><label className="block text-sm font-medium mb-1">Name *</label><Input {...register(`packages.${index}.name`)} placeholder="z.B. Basic" /></div>
            <div><label className="block text-sm font-medium mb-1">Preis *</label><Input type="number" {...register(`packages.${index}.price`, { valueAsNumber: true })} /></div>
          </div>
          <div className="mb-4"><label className="block text-sm font-medium mb-1">Beschreibung *</label><Textarea {...register(`packages.${index}.description`)} rows={2} /></div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium mb-1">Lieferzeit</label><Input type="number" {...register(`packages.${index}.deliveryTimeDays`, { valueAsNumber: true })} /></div>
            <div><label className="block text-sm font-medium mb-1">Revisionen</label><Input type="number" {...register(`packages.${index}.revisionsIncluded`, { valueAsNumber: true })} /></div>
            <div className="flex items-end"><label className="flex items-center gap-2"><input type="checkbox" {...register(`packages.${index}.isPopular`)} /> Beliebt</label></div>
          </div>
        </Card>
      ))}
      <Button type="button" variant="outline" onClick={() => addPackage(defaultPackage)}><Plus className="w-4 h-4 mr-1" /> Paket hinzufügen</Button>
    </motion.div>
  );
}

// Step 3: Media (placeholder)
function Step3() {
  const { t } = useTranslation();
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <div className="border-2 border-dashed border-neutral-300 rounded-lg p-12 text-center">
        <Image className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-neutral-700 mb-2">{t('service.uploadImages', 'Bilder hochladen')}</h3>
        <p className="text-neutral-500 mb-4">{t('service.uploadHint', 'Drag & Drop oder klicken zum Hochladen (max. 5 Bilder)')}</p>
        <Button type="button" variant="outline" disabled>{t('service.selectFiles', 'Dateien auswählen')}</Button>
        <p className="text-sm text-neutral-400 mt-4">{t('service.uploadComingSoon', 'Bild-Upload wird in einer zukünftigen Version verfügbar sein.')}</p>
      </div>
    </motion.div>
  );
}
