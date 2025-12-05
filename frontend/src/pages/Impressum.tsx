import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui';

export function Impressum() {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-neutral-50 py-12">
            <div className="max-w-3xl mx-auto px-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-3xl font-bold text-neutral-900 mb-8">Impressum</h1>

                    <Card padding="lg" className="space-y-6">
                        <section>
                            <h2 className="text-xl font-semibold mb-3">Angaben gemäß § 5 TMG</h2>
                            <p className="text-neutral-600">
                                DACH Marketplace GmbH<br />
                                Musterstraße 123<br />
                                10115 Berlin<br />
                                Deutschland
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">Vertreten durch</h2>
                            <p className="text-neutral-600">
                                Max Mustermann (Geschäftsführer)
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">Kontakt</h2>
                            <p className="text-neutral-600">
                                Telefon: +49 (0) 123 456789<br />
                                E-Mail: info@dach-marketplace.com
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">Registereintrag</h2>
                            <p className="text-neutral-600">
                                Eintragung im Handelsregister.<br />
                                Registergericht: Amtsgericht Berlin-Charlottenburg<br />
                                Registernummer: HRB 123456
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">Umsatzsteuer-ID</h2>
                            <p className="text-neutral-600">
                                Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
                                DE 123 456 789
                            </p>
                        </section>

                        <section className="pt-6 border-t border-neutral-200">
                            <h2 className="text-xl font-semibold mb-3">Streitschlichtung</h2>
                            <p className="text-neutral-600 text-sm">
                                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
                                <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline ml-1">
                                    https://ec.europa.eu/consumers/odr/
                                </a>.<br />
                                Unsere E-Mail-Adresse finden Sie oben im Impressum.
                            </p>
                            <p className="text-neutral-600 text-sm mt-2">
                                Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
                            </p>
                        </section>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}

export default Impressum;
