import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Briefcase, Wrench, Clock, Check, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button, Card, Input, Textarea } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/api/client';
import { useSuccessToast, useErrorToast } from '@/components/ui/Toast';
import type { Currency } from '@/types';

const step1Schema = z.object({
  headline: z.string().min(10, 'Mindestens 10 Zeichen').max(200),
  bio: z.string().min(50, 'Mindestens 50 Zeichen').max(5000),
  yearsExperience: z.number().min(0).max(50),
});

type Step1Data = z.infer<typeof step1Schema>;

const STEPS = [
  { id: 1, title: 'Profil', icon: User },
  { id: 2, title: 'Skills', icon: Wrench },
  { id: 3, title: 'Verfügbarkeit', icon: Clock },
  { id: 4, title: 'Links', icon: Briefcase },
];

const POPULAR_SKILLS = ['n8n', 'Make', 'Zapier', 'Power Automate', 'ChatGPT', 'Claude', 'API Integration', 'Workflow Design', 'Data Migration', 'CRM Automation'];
const POPULAR_TOOLS = ['n8n', 'Make', 'Zapier', 'Power Automate', 'Airtable', 'Notion', 'Slack', 'HubSpot', 'Salesforce', 'Google Sheets'];
const LANGUAGES = ['Deutsch', 'English', 'Français', 'Italiano'];
const INDUSTRIES = ['E-Commerce', 'SaaS', 'Healthcare', 'Finance', 'Marketing', 'HR', 'Real Estate', 'Manufacturing'];

interface FormData {
  headline: string; bio: string; yearsExperience: number;
  skills: string[]; tools: string[]; industries: string[]; languagesSpoken: string[];
  hourlyRate: number; currency: Currency; availableHoursPerWeek: number; timezone: string;
  portfolioUrl: string; linkedinUrl: string; githubUrl: string; websiteUrl: string;
}

export function BecomeExpert() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const showSuccess = useSuccessToast();
  const showError = useErrorToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    headline: '', bio: '', yearsExperience: 0,
    skills: [], tools: [], industries: [], languagesSpoken: ['Deutsch'],
    hourlyRate: 100, currency: 'chf', availableHoursPerWeek: 20, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    portfolioUrl: '', linkedinUrl: '', githubUrl: '', websiteUrl: '',
  });

  if (!isAuthenticated) { navigate('/login', { state: { from: '/become-expert' } }); return null; }

  const handleNext = (stepData: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...stepData }));
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };
  const handleBack = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await api.post('/experts', {
        ...formData, hourlyRate: formData.hourlyRate * 100,
        portfolioUrl: formData.portfolioUrl || undefined, linkedinUrl: formData.linkedinUrl || undefined,
        githubUrl: formData.githubUrl || undefined, websiteUrl: formData.websiteUrl || undefined,
      });
      showSuccess(t('expert.onboarding.success', 'Expertenprofil erfolgreich erstellt!'));
      navigate('/dashboard');
    } catch { showError(t('expert.onboarding.error', 'Fehler beim Erstellen des Profils')); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 to-white py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">{t('expert.onboarding.title', 'Werde Experte')}</h1>
          <p className="text-neutral-600">{t('expert.onboarding.subtitle', 'Erstelle dein Expertenprofil in wenigen Schritten')}</p>
        </div>
        <div className="flex justify-between mb-8">
          {STEPS.map((step, i) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= step.id ? 'bg-primary-600 text-white' : 'bg-neutral-200 text-neutral-500'}`}>
                {currentStep > step.id ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
              </div>
              <span className={`ml-2 text-sm font-medium hidden sm:inline ${currentStep >= step.id ? 'text-primary-600' : 'text-neutral-500'}`}>{step.title}</span>
              {i < STEPS.length - 1 && <div className={`w-8 sm:w-12 h-0.5 mx-2 sm:mx-4 ${currentStep > step.id ? 'bg-primary-600' : 'bg-neutral-200'}`} />}
            </div>
          ))}
        </div>
        <Card padding="lg">
          <AnimatePresence mode="wait">
            {currentStep === 1 && <Step1 data={formData} onNext={handleNext} />}
            {currentStep === 2 && <Step2 data={formData} onNext={handleNext} onBack={handleBack} />}
            {currentStep === 3 && <Step3 data={formData} onNext={handleNext} onBack={handleBack} />}
            {currentStep === 4 && <Step4 data={formData} onSubmit={handleSubmit} onBack={handleBack} isSubmitting={isSubmitting} />}
          </AnimatePresence>
        </Card>
      </div>
    </div>
  );
}

function Step1({ data, onNext }: { data: FormData; onNext: (d: Partial<FormData>) => void }) {
  const { t } = useTranslation();
  const { register, handleSubmit, formState: { errors } } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { headline: data.headline, bio: data.bio, yearsExperience: data.yearsExperience },
  });
  return (
    <motion.form initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div><label className="block text-sm font-medium text-neutral-700 mb-1">{t('expert.headline', 'Headline')}</label>
        <Input {...register('headline')} placeholder="z.B. n8n & Make Automation Expert" error={errors.headline?.message} /></div>
      <div><label className="block text-sm font-medium text-neutral-700 mb-1">{t('expert.bio', 'Über mich')}</label>
        <Textarea {...register('bio')} rows={6} placeholder="Beschreibe deine Erfahrung und Expertise..." error={errors.bio?.message} /></div>
      <div><label className="block text-sm font-medium text-neutral-700 mb-1">{t('expert.experience', 'Jahre Erfahrung')}</label>
        <Input type="number" {...register('yearsExperience', { valueAsNumber: true })} min={0} max={50} error={errors.yearsExperience?.message} /></div>
      <div className="flex justify-end"><Button type="submit">{t('common.next', 'Weiter')} <ChevronRight className="w-4 h-4 ml-1" /></Button></div>
    </motion.form>
  );
}

function Step2({ data, onNext, onBack }: { data: FormData; onNext: (d: Partial<FormData>) => void; onBack: () => void }) {
  const { t } = useTranslation();
  const [skills, setSkills] = useState<string[]>(data.skills);
  const [tools, setTools] = useState<string[]>(data.tools);
  const [languages, setLanguages] = useState<string[]>(data.languagesSpoken);
  const [industries, setIndustries] = useState<string[]>(data.industries);
  const toggle = (arr: string[], set: (a: string[]) => void, item: string) => set(arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item]);
  const handleNext = () => { if (skills.length && tools.length && languages.length) onNext({ skills, tools, languagesSpoken: languages, industries }); };
  const Chips = ({ items, selected, set }: { items: string[]; selected: string[]; set: (a: string[]) => void }) => (
    <div className="flex flex-wrap gap-2">{items.map(item => (
      <button key={item} type="button" onClick={() => toggle(selected, set, item)}
        className={`px-3 py-1.5 rounded-full text-sm transition-all ${selected.includes(item) ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>{item}</button>
    ))}</div>
  );
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <div><label className="block text-sm font-medium text-neutral-700 mb-2">{t('expert.skills', 'Skills')} *</label><Chips items={POPULAR_SKILLS} selected={skills} set={setSkills} /></div>
      <div><label className="block text-sm font-medium text-neutral-700 mb-2">{t('expert.tools', 'Tools')} *</label><Chips items={POPULAR_TOOLS} selected={tools} set={setTools} /></div>
      <div><label className="block text-sm font-medium text-neutral-700 mb-2">{t('expert.languages', 'Sprachen')} *</label><Chips items={LANGUAGES} selected={languages} set={setLanguages} /></div>
      <div><label className="block text-sm font-medium text-neutral-700 mb-2">{t('expert.industries', 'Branchen')}</label><Chips items={INDUSTRIES} selected={industries} set={setIndustries} /></div>
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}><ChevronLeft className="w-4 h-4 mr-1" /> {t('common.back', 'Zurück')}</Button>
        <Button onClick={handleNext} disabled={!skills.length || !tools.length}>{t('common.next', 'Weiter')} <ChevronRight className="w-4 h-4 ml-1" /></Button>
      </div>
    </motion.div>
  );
}

function Step3({ data, onNext, onBack }: { data: FormData; onNext: (d: Partial<FormData>) => void; onBack: () => void }) {
  const { t } = useTranslation();
  const [hourlyRate, setHourlyRate] = useState(data.hourlyRate);
  const [currency, setCurrency] = useState<Currency>(data.currency);
  const [hours, setHours] = useState(data.availableHoursPerWeek);
  const handleNext = () => onNext({ hourlyRate, currency, availableHoursPerWeek: hours, timezone: data.timezone });
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium text-neutral-700 mb-1">{t('expert.hourlyRate', 'Stundensatz')}</label>
          <Input type="number" value={hourlyRate} onChange={e => setHourlyRate(Number(e.target.value))} min={1} max={1000} /></div>
        <div><label className="block text-sm font-medium text-neutral-700 mb-1">{t('expert.currency', 'Währung')}</label>
          <select value={currency} onChange={e => setCurrency(e.target.value as Currency)} className="w-full px-4 py-2 border border-neutral-300 rounded-lg">
            <option value="chf">CHF</option><option value="eur">EUR</option>
          </select></div>
      </div>
      <div><label className="block text-sm font-medium text-neutral-700 mb-1">{t('expert.availability', 'Verfügbare Stunden/Woche')}</label>
        <Input type="number" value={hours} onChange={e => setHours(Number(e.target.value))} min={1} max={60} />
        <p className="text-sm text-neutral-500 mt-1">{t('expert.availabilityHint', 'Wie viele Stunden pro Woche kannst du arbeiten?')}</p></div>
      <div><label className="block text-sm font-medium text-neutral-700 mb-1">{t('expert.timezone', 'Zeitzone')}</label>
        <Input value={data.timezone} disabled className="bg-neutral-50" /></div>
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}><ChevronLeft className="w-4 h-4 mr-1" /> {t('common.back', 'Zurück')}</Button>
        <Button onClick={handleNext}>{t('common.next', 'Weiter')} <ChevronRight className="w-4 h-4 ml-1" /></Button>
      </div>
    </motion.div>
  );
}

function Step4({ data, onSubmit, onBack, isSubmitting }: { data: FormData; onSubmit: () => void; onBack: () => void; isSubmitting: boolean }) {
  const { t } = useTranslation();
  const [portfolioUrl, setPortfolioUrl] = useState(data.portfolioUrl);
  const [linkedinUrl, setLinkedinUrl] = useState(data.linkedinUrl);
  const [githubUrl, setGithubUrl] = useState(data.githubUrl);
  const [websiteUrl, setWebsiteUrl] = useState(data.websiteUrl);
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <p className="text-neutral-600">{t('expert.linksHint', 'Füge Links zu deinem Portfolio und Social Media hinzu (optional)')}</p>
      <div><label className="block text-sm font-medium text-neutral-700 mb-1">Portfolio URL</label>
        <Input value={portfolioUrl} onChange={e => setPortfolioUrl(e.target.value)} placeholder="https://portfolio.example.com" /></div>
      <div><label className="block text-sm font-medium text-neutral-700 mb-1">LinkedIn</label>
        <Input value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/username" /></div>
      <div><label className="block text-sm font-medium text-neutral-700 mb-1">GitHub</label>
        <Input value={githubUrl} onChange={e => setGithubUrl(e.target.value)} placeholder="https://github.com/username" /></div>
      <div><label className="block text-sm font-medium text-neutral-700 mb-1">Website</label>
        <Input value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} placeholder="https://example.com" /></div>
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}><ChevronLeft className="w-4 h-4 mr-1" /> {t('common.back', 'Zurück')}</Button>
        <Button onClick={() => { data.portfolioUrl = portfolioUrl; data.linkedinUrl = linkedinUrl; data.githubUrl = githubUrl; data.websiteUrl = websiteUrl; onSubmit(); }} disabled={isSubmitting}>
          {isSubmitting ? t('common.saving', 'Speichern...') : t('expert.createProfile', 'Profil erstellen')} <Check className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </motion.div>
  );
}

