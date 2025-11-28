import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, MessageCircle, FileText } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import confetti from '@/lib/confetti';

export function CheckoutSuccess() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  // Trigger confetti on mount
  useEffect(() => {
    confetti();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full"
      >
        <Card padding="lg" className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-green-600" />
          </motion.div>

          <h1 className="text-2xl font-bold text-neutral-900 mb-2">
            {t('checkoutSuccess.title', 'Zahlung erfolgreich!')}
          </h1>
          <p className="text-neutral-600 mb-6">
            {t('checkoutSuccess.description', 'Vielen Dank für Ihre Bestellung. Sie erhalten in Kürze eine Bestätigungs-E-Mail.')}
          </p>

          {sessionId && (
            <p className="text-sm text-neutral-500 mb-6">
              {t('checkoutSuccess.orderId', 'Bestellnummer')}: <span className="font-mono">{sessionId.slice(0, 20)}...</span>
            </p>
          )}

          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg text-left">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <div className="font-medium text-neutral-900">{t('checkoutSuccess.nextStep1Title', 'Experte kontaktieren')}</div>
                <div className="text-sm text-neutral-600">{t('checkoutSuccess.nextStep1Desc', 'Besprechen Sie die Details Ihres Projekts')}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg text-left">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <div className="font-medium text-neutral-900">{t('checkoutSuccess.nextStep2Title', 'Projekt verfolgen')}</div>
                <div className="text-sm text-neutral-600">{t('checkoutSuccess.nextStep2Desc', 'Verfolgen Sie den Fortschritt in Ihrem Dashboard')}</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={() => navigate('/dashboard')} className="flex-1">
              {t('checkoutSuccess.goToDashboard', 'Zum Dashboard')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" onClick={() => navigate('/messages')} className="flex-1">
              <MessageCircle className="w-4 h-4 mr-2" />
              {t('checkoutSuccess.goToMessages', 'Nachrichten')}
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

export default CheckoutSuccess;

