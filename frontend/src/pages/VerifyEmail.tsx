import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Mail, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { Logo } from '@/components/brand';
import { api } from '@/api/client';

type VerificationState = 'loading' | 'success' | 'error' | 'pending';

export function VerifyEmail() {
  useTranslation(); // For future i18n
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [state, setState] = useState<VerificationState>(token ? 'loading' : 'pending');
  const [error, setError] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      await api.post('/auth/verify-email', { token: verificationToken });
      setState('success');
    } catch (err: unknown) {
      setState('error');
      setError(err instanceof Error ? err.message : 'Verifizierung fehlgeschlagen');
    }
  };

  const handleResendEmail = async () => {
    setResendLoading(true);
    try {
      await api.post('/auth/resend-verification');
      setResendSuccess(true);
    } catch {
      // Silently fail - don't reveal if email exists
      setResendSuccess(true);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card padding="lg" className="shadow-xl border-0 text-center">
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>

          {state === 'loading' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8">
              <Loader2 className="w-16 h-16 text-primary-600 animate-spin mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                E-Mail wird verifiziert...
              </h1>
              <p className="text-neutral-600">Bitte warten Sie einen Moment.</p>
            </motion.div>
          )}

          {state === 'success' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                E-Mail bestätigt!
              </h1>
              <p className="text-neutral-600 mb-8">
                Ihre E-Mail-Adresse wurde erfolgreich verifiziert. Sie können sich jetzt anmelden.
              </p>
              <Link to="/login">
                <Button size="lg" className="w-full">
                  Zum Login <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>
          )}

          {state === 'error' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-8">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                Verifizierung fehlgeschlagen
              </h1>
              <p className="text-neutral-600 mb-6">
                {error || 'Der Verifizierungslink ist ungültig oder abgelaufen.'}
              </p>
              <div className="space-y-3">
                <Button variant="outline" className="w-full" onClick={handleResendEmail} disabled={resendLoading || resendSuccess}>
                  {resendLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <RefreshCw className="w-5 h-5 mr-2" />}
                  {resendSuccess ? 'E-Mail gesendet!' : 'Neuen Link anfordern'}
                </Button>
                <Link to="/login" className="block">
                  <Button variant="ghost" className="w-full">Zum Login</Button>
                </Link>
              </div>
            </motion.div>
          )}

          {state === 'pending' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-8">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-10 h-10 text-primary-600" />
              </div>
              <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                Bestätigen Sie Ihre E-Mail
              </h1>
              <p className="text-neutral-600 mb-6">
                Wir haben Ihnen eine E-Mail mit einem Bestätigungslink gesendet. Bitte überprüfen Sie Ihren Posteingang.
              </p>
              <div className="bg-neutral-50 rounded-lg p-4 mb-6 text-sm text-neutral-600">
                <p className="font-medium text-neutral-900 mb-1">Keine E-Mail erhalten?</p>
                <p>Überprüfen Sie Ihren Spam-Ordner oder fordern Sie einen neuen Link an.</p>
              </div>
              <div className="space-y-3">
                <Button variant="outline" className="w-full" onClick={handleResendEmail} disabled={resendLoading || resendSuccess}>
                  {resendLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <RefreshCw className="w-5 h-5 mr-2" />}
                  {resendSuccess ? 'E-Mail gesendet!' : 'Erneut senden'}
                </Button>
                <Link to="/login" className="block">
                  <Button variant="ghost" className="w-full">Zurück zum Login</Button>
                </Link>
              </div>
            </motion.div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}

export default VerifyEmail;

