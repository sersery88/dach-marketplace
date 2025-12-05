const stats = [
  { value: '500+', label: 'Experten' },
  { value: '2,000+', label: 'Projekte' },
  { value: '98%', label: 'Zufriedenheit' },
  { value: '24h', label: 'Antwortzeit' },
];

export function StatsSection() {
  return (
    <section class="py-12 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} class="text-center">
              <div class="text-3xl sm:text-4xl font-bold text-blue-600 mb-1">
                {stat.value}
              </div>
              <div class="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

