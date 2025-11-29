import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';
import { api } from '@/api/client';

const forgotPasswordSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPassword() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.post('/auth/forgot-password', { email: data.email });
      setIsSubmitted(true);
    } catch (err) {
      // Always show success to prevent email enumeration
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card padding="lg" className="shadow-xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">D</span>
              </div>
              <span className="font-bold text-2xl text-neutral-900">DACH<span className="text-primary-600">Flow</span></span>
            </Link>
          </div>

          {isSubmitted ? (
            // Success State
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                {t('auth.checkEmail', 'E-Mail gesendet')}
              </h1>
              <p className="text-neutral-600 mb-8">
                {t('auth.resetEmailSent', 'Falls ein Konto mit dieser E-Mail existiert, haben wir Ihnen einen Link zum Zurücksetzen des Passworts gesendet.')}
              </p>
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  {t('auth.backToLogin', 'Zurück zum Login')}
                </Button>
              </Link>
            </div>
          ) : (
            // Form State
            <>
              <h1 className="text-2xl font-bold text-neutral-900 text-center mb-2">
                {t('auth.forgotPasswordTitle', 'Passwort vergessen?')}
              </h1>
              <p className="text-neutral-600 text-center mb-8">
                {t('auth.forgotPasswordSubtitle', 'Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum Zurücksetzen.')}
              </p>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <Input
                  label={t('auth.email')}
                  type="email"
                  placeholder="ihre@email.com"
                  autoComplete="email"
                  leftIcon={<Mail className="w-5 h-5" />}
                  error={errors.email?.message}
                  {...register('email')}
                />

                <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                  {t('auth.sendResetLink', 'Link senden')}
                </Button>
              </form>

              <p className="text-center text-neutral-600 mt-8">
                <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  {t('auth.backToLogin', 'Zurück zum Login')}
                </Link>
              </p>
            </>
          )}
        </Card>
      </motion.div>
    </div>
  );
}

export default ForgotPassword;
