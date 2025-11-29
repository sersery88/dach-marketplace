import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, Building2, Briefcase, AlertCircle } from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';
import { Logo } from '@/components/brand';
import { useAuthStore } from '@/stores/authStore';

const registerSchema = z.object({
  firstName: z.string().min(2, 'Vorname muss mindestens 2 Zeichen haben'),
  lastName: z.string().min(2, 'Nachname muss mindestens 2 Zeichen haben'),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  password: z.string().min(8, 'Passwort muss mindestens 8 Zeichen haben'),
  confirmPassword: z.string(),
  role: z.enum(['client', 'expert']),
  country: z.enum(['ch', 'de', 'at']),
  acceptTerms: z.boolean().refine(val => val === true, 'Sie müssen die AGB akzeptieren'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwörter stimmen nicht überein',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register: registerUser, isLoading, error } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'client' | 'expert'>('client');

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'client', country: 'ch' },
  });

  // Watch password for strength indicator
  const watchPassword = watch('password', '');

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!watchPassword) return { score: 0, label: '', color: '' };
    let score = 0;
    if (watchPassword.length >= 8) score++;
    if (watchPassword.length >= 12) score++;
    if (/[A-Z]/.test(watchPassword)) score++;
    if (/[a-z]/.test(watchPassword)) score++;
    if (/[0-9]/.test(watchPassword)) score++;
    if (/[^A-Za-z0-9]/.test(watchPassword)) score++;

    if (score <= 2) return { score: 1, label: 'Schwach', color: 'bg-red-500' };
    if (score <= 4) return { score: 2, label: 'Mittel', color: 'bg-yellow-500' };
    return { score: 3, label: 'Stark', color: 'bg-green-500' };
  }, [watchPassword]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data);
      navigate('/verify-email');
    } catch {
      // Error handled by store
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <Card padding="lg" className="shadow-xl border-0">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Logo size="lg" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">{t('auth.registerTitle')}</h1>
            <p className="text-neutral-600">{t('auth.registerSubtitle')}</p>
          </div>

          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              type="button"
              onClick={() => { setSelectedRole('client'); setValue('role', 'client'); }}
              className={`p-4 rounded-xl border-2 transition-all ${selectedRole === 'client' ? 'border-primary-500 bg-primary-50 shadow-sm' : 'border-neutral-200 hover:border-neutral-300'}`}
            >
              <Building2 className={`w-8 h-8 mx-auto mb-2 ${selectedRole === 'client' ? 'text-primary-600' : 'text-neutral-400'}`} />
              <span className={`font-medium ${selectedRole === 'client' ? 'text-primary-700' : 'text-neutral-600'}`}>Auftraggeber</span>
              <p className="text-xs text-neutral-500 mt-1">Ich suche Experten</p>
            </button>
            <button
              type="button"
              onClick={() => { setSelectedRole('expert'); setValue('role', 'expert'); }}
              className={`p-4 rounded-xl border-2 transition-all ${selectedRole === 'expert' ? 'border-primary-500 bg-primary-50 shadow-sm' : 'border-neutral-200 hover:border-neutral-300'}`}
            >
              <Briefcase className={`w-8 h-8 mx-auto mb-2 ${selectedRole === 'expert' ? 'text-primary-600' : 'text-neutral-400'}`} />
              <span className={`font-medium ${selectedRole === 'expert' ? 'text-primary-700' : 'text-neutral-600'}`}>Experte</span>
              <p className="text-xs text-neutral-500 mt-1">Ich biete Services an</p>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="text-red-700 text-sm">{error}</div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Vorname" placeholder="Max" autoComplete="given-name" leftIcon={<User className="w-5 h-5" />} error={errors.firstName?.message} {...register('firstName')} />
              <Input label="Nachname" placeholder="Müller" autoComplete="family-name" error={errors.lastName?.message} {...register('lastName')} />
            </div>

            <Input label="E-Mail" type="email" placeholder="ihre@email.com" autoComplete="email" leftIcon={<Mail className="w-5 h-5" />} error={errors.email?.message} {...register('email')} />

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Land</label>
              <select {...register('country')} autoComplete="country" className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20">
                <option value="ch">🇨🇭 Schweiz</option>
                <option value="de">🇩🇪 Deutschland</option>
                <option value="at">🇦🇹 Österreich</option>
              </select>
            </div>

            <div>
              <Input
                label="Passwort"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="new-password"
                leftIcon={<Lock className="w-5 h-5" />}
                rightIcon={<button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>}
                error={errors.password?.message}
                {...register('password')}
              />
              {/* Password Strength Indicator */}
              {watchPassword && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          passwordStrength.score >= level ? passwordStrength.color : 'bg-neutral-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${passwordStrength.score === 1 ? 'text-red-600' : passwordStrength.score === 2 ? 'text-yellow-600' : 'text-green-600'}`}>
                    Passwortstärke: {passwordStrength.label}
                  </p>
                </div>
              )}
            </div>

            <Input label="Passwort bestätigen" type="password" placeholder="••••••••" autoComplete="new-password" leftIcon={<Lock className="w-5 h-5" />} error={errors.confirmPassword?.message} {...register('confirmPassword')} />

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" {...register('acceptTerms')} className="mt-1 rounded border-neutral-300 text-primary-600 focus:ring-primary-500" />
              <span className="text-sm text-neutral-600">
                Ich akzeptiere die <Link to="/terms" className="text-primary-600 hover:underline">AGB</Link> und <Link to="/privacy" className="text-primary-600 hover:underline">Datenschutzerklärung</Link>
              </span>
            </label>
            {errors.acceptTerms && <p className="text-sm text-red-600">{errors.acceptTerms.message}</p>}

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Konto erstellen <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </form>

          <p className="text-center text-neutral-600 mt-6">
            Bereits registriert? <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">{t('common.login')}</Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}

