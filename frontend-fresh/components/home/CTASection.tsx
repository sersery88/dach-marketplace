export function CTASection() {
  return (
    <section class="py-20 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
      <div class="max-w-4xl mx-auto px-4 text-center">
        <h2 class="text-3xl font-bold mb-4">Bereit loszulegen?</h2>
        <p class="text-blue-100 mb-8 text-lg">
          Finden Sie den perfekten Experten für Ihr Automatisierungsprojekt
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="/services" 
            class="btn bg-white text-blue-600 hover:bg-blue-50"
          >
            Services durchsuchen
          </a>
          <a 
            href="/become-expert" 
            class="btn border-2 border-white text-white hover:bg-white/10"
          >
            Experte werden
          </a>
        </div>
      </div>
    </section>
  );
}

