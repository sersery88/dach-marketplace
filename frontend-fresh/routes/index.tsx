import { define } from '@/utils.ts';
import { api, endpoints } from '@/lib/api.ts';
import type { ExpertProfile, Service, Category, ApiResponse } from '@/types/index.ts';
import { HeroSection } from '@/components/home/HeroSection.tsx';
import { StatsSection } from '@/components/home/StatsSection.tsx';
import { CategoriesSection } from '@/components/home/CategoriesSection.tsx';
import { ServicesSection } from '@/components/home/ServicesSection.tsx';
import { ExpertsSection } from '@/components/home/ExpertsSection.tsx';
import { FeaturesSection } from '@/components/home/FeaturesSection.tsx';
import { CTASection } from '@/components/home/CTASection.tsx';

interface HomeData {
  experts: ExpertProfile[];
  services: Service[];
  categories: Category[];
}

export const handler = define.handlers({
  async GET(_ctx) {
    // Fetch data server-side for SSR
    let data: HomeData = { experts: [], services: [], categories: [] };

    try {
      const [expertsRes, servicesRes, categoriesRes] = await Promise.allSettled([
        api.get<ApiResponse<ExpertProfile[]>>(endpoints.experts.featured),
        api.get<ApiResponse<Service[]>>(endpoints.services.featured),
        api.get<ApiResponse<Category[]>>(endpoints.categories.featured),
      ]);

      if (expertsRes.status === 'fulfilled') data.experts = expertsRes.value.data || [];
      if (servicesRes.status === 'fulfilled') data.services = servicesRes.value.data || [];
      if (categoriesRes.status === 'fulfilled') data.categories = categoriesRes.value.data || [];
    } catch (e) {
      console.error('Failed to fetch home data:', e);
    }

    return { data };
  },
});

export default define.page<typeof handler>(({ data }) => {
  return (
    <div class="overflow-hidden">
      <HeroSection />
      <StatsSection />
      <CategoriesSection categories={data.categories} />
      <ServicesSection services={data.services} />
      <ExpertsSection experts={data.experts} />
      <FeaturesSection />
      <CTASection />
    </div>
  );
});

