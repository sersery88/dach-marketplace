import { useState, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle, XCircle, ArrowRight, AlertCircle } from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';
import { Logo } from '@/components/brand';
import { api } from '@/api/client';

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Passwort muss mindestens 8 Zeichen haben'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwörter stimmen nicht überein',
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPassword() {
  useTranslation(); // For future i18n
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const watchPassword = watch('password', '');
  
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

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError('Ungültiger Reset-Link');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      await api.post('/auth/reset-password', { token, password: data.password });
      setIsSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Passwort konnte nicht zurückgesetzt werden');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
        <Card padding="lg" className="shadow-xl border-0 text-center max-w-md">
          <div className="flex justify-center mb-6"><Logo size="lg" /></div>
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Ungültiger Link</h1>
          <p className="text-neutral-600 mb-6">Dieser Link ist ungültig oder abgelaufen.</p>
          <Link to="/forgot-password"><Button className="w-full">Neuen Link anfordern</Button></Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card padding="lg" className="shadow-xl border-0">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6"><Logo size="lg" /></div>
            {isSuccess ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-neutral-900 mb-2">Passwort geändert!</h1>
                <p className="text-neutral-600">Sie werden zum Login weitergeleitet...</p>
              </motion.div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-neutral-900 mb-2">Neues Passwort festlegen</h1>
                <p className="text-neutral-600">Wählen Sie ein sicheres Passwort für Ihr Konto.</p>
              </>
            )}
          </div>

          {!isSuccess && (
            <>
              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div className="text-red-700 text-sm">{error}</div>
                </motion.div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <Input label="Neues Passwort" type={showPassword ? 'text' : 'password'} placeholder="••••••••" autoComplete="new-password" leftIcon={<Lock className="w-5 h-5" />}
                    rightIcon={<button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>}
                    error={errors.password?.message} {...register('password')} />
                  {watchPassword && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3].map((level) => (
                          <div key={level} className={`h-1 flex-1 rounded-full transition-colors ${passwordStrength.score >= level ? passwordStrength.color : 'bg-neutral-200'}`} />
                        ))}
                      </div>
                      <p className={`text-xs ${passwordStrength.score === 1 ? 'text-red-600' : passwordStrength.score === 2 ? 'text-yellow-600' : 'text-green-600'}`}>
                        Passwortstärke: {passwordStrength.label}
                      </p>
                    </div>
                  )}
                </div>
                <Input label="Passwort bestätigen" type="password" placeholder="••••••••" autoComplete="new-password" leftIcon={<Lock className="w-5 h-5" />} error={errors.confirmPassword?.message} {...register('confirmPassword')} />
                <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                  Passwort speichern <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </form>
            </>
          )}
        </Card>
      </motion.div>
    </div>
  );
}

export default ResetPassword;

