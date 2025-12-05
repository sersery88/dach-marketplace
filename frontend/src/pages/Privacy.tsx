import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui';

export function Privacy() {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-neutral-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-3xl font-bold text-neutral-900 mb-8">Datenschutzerklärung</h1>

                    <Card padding="lg" className="space-y-8">
                        <section>
                            <h2 className="text-xl font-semibold mb-3">1. Datenschutz auf einen Blick</h2>
                            <h3 className="font-medium mb-2">Allgemeine Hinweise</h3>
                            <p className="text-neutral-600 mb-4">
                                Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert,
                                wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">2. Hosting und Content Delivery Networks (CDN)</h2>
                            <p className="text-neutral-600 mb-4">
                                Wir hosten die Inhalte unserer Website bei folgendem Anbieter:<br />
                                <strong>Render</strong><br />
                                Anbieter ist die Render Services, Inc., San Francisco, USA.<br />
                                Details entnehmen Sie der Datenschutzerklärung von Render: <a href="https://render.com/privacy" target="_blank" rel="noreferrer" className="text-primary-600 hover:underline">https://render.com/privacy</a>.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">3. Allgemeine Hinweise und Pflichtinformationen</h2>
                            <h3 className="font-medium mb-2">Datenschutz</h3>
                            <p className="text-neutral-600 mb-4">
                                Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten
                                vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
                            </p>
                            <h3 className="font-medium mb-2">Hinweis zur verantwortlichen Stelle</h3>
                            <p className="text-neutral-600 mb-4">
                                Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:<br />
                                DACH Marketplace GmbH<br />
                                Musterstraße 123<br />
                                10115 Berlin<br />
                                E-Mail: info@dach-marketplace.com
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">4. Datenerfassung auf dieser Website</h2>
                            <h3 className="font-medium mb-2">Cookies</h3>
                            <p className="text-neutral-600 mb-4">
                                Unsere Internetseiten verwenden so genannte „Cookies“. Cookies sind kleine Textdateien und richten auf Ihrem Endgerät keinen Schaden an.
                                Sie werden entweder vorübergehend für die Dauer einer Sitzung (Session-Cookies) oder dauerhaft (permanente Cookies) auf Ihrem Endgerät gespeichert.
                            </p>
                            <h3 className="font-medium mb-2">Zahlungsdienstleister (Stripe)</h3>
                            <p className="text-neutral-600 mb-4">
                                Auf unserer Website bieten wir u.a. die Bezahlung via Stripe an. Anbieter dieses Zahlungsdienstes ist die
                                Stripe Payments Europe, Ltd., 1 Grand Canal Street Lower, Grand Canal Dock, Dublin, Irland.<br />
                                Wenn Sie die Bezahlung via Stripe auswählen, werden die von Ihnen eingegebenen Zahlungsdaten an Stripe übermittelt.
                            </p>
                        </section>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}

export default Privacy;
