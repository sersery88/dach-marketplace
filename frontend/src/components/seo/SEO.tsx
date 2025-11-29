import { Helmet } from '@dr.pogodin/react-helmet';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile' | 'product';
  noindex?: boolean;
  structuredData?: object;
}

const BASE_URL = 'https://dachflow.com';
const DEFAULT_IMAGE = '/og-image.png';
const SITE_NAME = 'DACHFlow';

export function SEO({
  title,
  description = 'Finden Sie die besten Automatisierungs-Experten für n8n, Make, Zapier und AI-Lösungen in der DACH-Region.',
  keywords,
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  noindex = false,
  structuredData,
}: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Der #1 Marktplatz für KI & Automatisierung`;
  const fullUrl = url ? `${BASE_URL}${url}` : BASE_URL;
  const fullImage = image.startsWith('http') ? image : `${BASE_URL}${image}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}

// Pre-built structured data generators
export const structuredData = {
  service: (service: { title: string; description: string; price: number; currency: string; expertName: string; rating: number; reviewCount: number }) => ({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.description,
    provider: {
      '@type': 'Person',
      name: service.expertName,
    },
    offers: {
      '@type': 'Offer',
      price: service.price / 100,
      priceCurrency: service.currency.toUpperCase(),
    },
    aggregateRating: service.reviewCount > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: service.rating,
      reviewCount: service.reviewCount,
    } : undefined,
  }),

  expert: (expert: { name: string; description: string; image?: string; rating: number; reviewCount: number }) => ({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: expert.name,
    description: expert.description,
    image: expert.image,
    aggregateRating: expert.reviewCount > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: expert.rating,
      reviewCount: expert.reviewCount,
    } : undefined,
  }),

  faq: (items: { question: string; answer: string }[]) => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }),

  breadcrumb: (items: { name: string; url: string }[]) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `https://dachflow.com${item.url}`,
    })),
  }),
};

export default SEO;

