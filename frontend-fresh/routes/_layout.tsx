import type { PageProps } from 'fresh';
import { Header } from '@/components/layout/Header.tsx';
import { Footer } from '@/components/layout/Footer.tsx';

export default function Layout({ Component }: PageProps) {
  return (
    <html lang="de">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>DACH Automation Marketplace</title>
        <meta name="description" content="Die führende Plattform für Automatisierungs-Experten in der DACH-Region. Finden Sie Spezialisten für n8n, Make, Zapier und KI-Automatisierung." />
        <link rel="stylesheet" href="/styles.css" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body class="min-h-screen flex flex-col bg-white dark:bg-gray-900">
        <Header />
        <main class="flex-1">
          <Component />
        </main>
        <Footer />
      </body>
    </html>
  );
}

