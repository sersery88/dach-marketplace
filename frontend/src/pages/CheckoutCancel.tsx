import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, HelpCircle } from 'lucide-react';
import { Button, Card } from '@/components/ui';

export function CheckoutCancel() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-lg w-full"
      >
        <Card padding="lg" className="text-center">
          <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-neutral-500" />
          </div>

          <h1 className="text-2xl font-bold text-neutral-900 mb-2">
            {t('checkoutCancel.title', 'Zahlung abgebrochen')}
          </h1>
          <p className="text-neutral-600 mb-6">
            {t('checkoutCancel.description', 'Ihre Zahlung wurde abgebrochen. Keine Sorge, es wurde nichts berechnet.')}
          </p>

          <div className="bg-neutral-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-medium text-neutral-900 mb-2 flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              {t('checkoutCancel.helpTitle', 'Brauchen Sie Hilfe?')}
            </h3>
            <p className="text-sm text-neutral-600">
              {t('checkoutCancel.helpDescription', 'Falls Sie Fragen haben oder auf ein Problem gestoßen sind, kontaktieren Sie uns gerne.')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={() => navigate(-1)} variant="outline" className="flex-1">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('checkoutCancel.goBack', 'Zurück')}
            </Button>
            <Button onClick={() => navigate('/services')} className="flex-1">
              {t('checkoutCancel.browseServices', 'Services durchsuchen')}
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

export default CheckoutCancel;

