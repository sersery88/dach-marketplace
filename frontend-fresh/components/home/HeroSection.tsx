import { Search } from 'lucide-preact';
import { SearchBox } from '@/islands/SearchBox.tsx';

export function HeroSection() {
  return (
    <section class="relative bg-gradient-to-br from-blue-700 via-blue-800 to-purple-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div class="absolute inset-0 opacity-10">
        <svg class="w-full h-full" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice">
          <path d="M0 400 Q360 300, 720 400 T1440 400" stroke="white" stroke-width="2" fill="none" opacity="0.5">
            <animate attributeName="d" dur="8s" repeatCount="indefinite" values="M0 400 Q360 300, 720 400 T1440 400;M0 400 Q360 500, 720 400 T1440 400;M0 400 Q360 300, 720 400 T1440 400"/>
          </path>
          <path d="M0 500 Q360 400, 720 500 T1440 500" stroke="white" stroke-width="2" fill="none" opacity="0.3">
            <animate attributeName="d" dur="10s" repeatCount="indefinite" values="M0 500 Q360 400, 720 500 T1440 500;M0 500 Q360 600, 720 500 T1440 500;M0 500 Q360 400, 720 500 T1440 500"/>
          </path>
        </svg>
      </div>
      <div class="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent" />

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div class="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm mb-6 backdrop-blur-sm">
            <span class="flex gap-1">🇨🇭 🇩🇪 🇦🇹</span>
            <span>Der #1 Marktplatz für Automatisierung in DACH</span>
          </div>

          {/* Title */}
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight animate-fade-in">
            Automatisierung für Ihr Business
          </h1>

          {/* Subtitle */}
          <p class="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Verbinden Sie sich mit Top-Experten für n8n, Make, Zapier und KI-Automatisierung in der DACH-Region
          </p>

          {/* Search Box - Island for interactivity */}
          <SearchBox />

          {/* Popular Tags */}
          <div class="mt-8 flex flex-wrap justify-center gap-4 text-sm text-blue-200">
            <span>Beliebt:</span>
            {['n8n', 'Make', 'ChatGPT', 'Zapier', 'Power Automate'].map((tag) => (
              <a key={tag} href={`/search?q=${encodeURIComponent(tag)}`} class="hover:text-white transition-colors">
                {tag}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Wave Divider */}
      <div class="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
        </svg>
      </div>
    </section>
  );
}

