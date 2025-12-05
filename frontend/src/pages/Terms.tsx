import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui';

export function Terms() {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-neutral-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-3xl font-bold text-neutral-900 mb-8">Allgemeine Geschäftsbedingungen (AGB)</h1>

                    <Card padding="lg" className="space-y-8">
                        <section>
                            <h2 className="text-xl font-semibold mb-3">§ 1 Geltungsbereich</h2>
                            <p className="text-neutral-600">
                                (1) Die nachstehenden Bedingungen gelten für die Nutzung des DACH Marketplace (nachfolgend "Plattform"),
                                betrieben von der DACH Marketplace GmbH (nachfolgend "Anbieter").<br />
                                (2) Die Plattform richtet sich an Unternehmer (§ 14 BGB) und Verbraucher (§ 13 BGB).
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">§ 2 Leistungsbeschreibung</h2>
                            <p className="text-neutral-600">
                                (1) Der Anbieter stellt eine Online-Plattform zur Verfügung, über die registrierte Experten Dienstleistungen anbieten
                                und Kunden diese Dienstleistungen buchen können.<br />
                                (2) Verträge über die Dienstleistungen kommen ausschließlich zwischen dem Experten und dem Kunden zustande.
                                Der Anbieter tritt lediglich als Vermittler auf.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">§ 3 Registrierung und Nutzerkonto</h2>
                            <p className="text-neutral-600">
                                (1) Die Nutzung der Plattform setzt eine Registrierung voraus. Die bei der Registrierung abgefragten Daten sind
                                vollständig und korrekt anzugeben.<br />
                                (2) Der Nutzer ist verpflichtet, seine Zugangsdaten geheim zu halten und vor dem Zugriff Dritter zu schützen.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">§ 4 Zahlungsabwicklung</h2>
                            <p className="text-neutral-600">
                                (1) Die Zahlung der Vergütung für gebuchte Dienstleistungen erfolgt über den Zahlungsdienstleister Stripe.<br />
                                (2) Der Anbieter nimmt Zahlungen im Namen und auf Rechnung des Experten entgegen (Inkassovollmacht).
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">§ 5 Haftungsbeschränkung</h2>
                            <p className="text-neutral-600">
                                (1) Der Anbieter haftet unbeschränkt für Vorsatz und grobe Fahrlässigkeit.<br />
                                (2) Für einfache Fahrlässigkeit haftet der Anbieter nur bei Verletzung wesentlicher Vertragspflichten.
                            </p>
                        </section>

                        <section className="pt-6 border-t border-neutral-200">
                            <h2 className="text-xl font-semibold mb-3">§ 6 Schlussbestimmungen</h2>
                            <p className="text-neutral-600">
                                (1) Es gilt das Recht der Bundesrepublik Deutschland.<br />
                                (2) Gerichtsstand ist Berlin, soweit der Nutzer Kaufmann ist.
                            </p>
                        </section>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}

export default Terms;
