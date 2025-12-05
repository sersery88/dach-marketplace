// User Types
export type UserRole = 'client' | 'expert' | 'admin';
export type AccountStatus = 'pending' | 'active' | 'suspended' | 'deleted';
export type Country = 'ch' | 'de' | 'at';
export type Currency = 'chf' | 'eur';
export type Language = 'de' | 'en' | 'fr' | 'it';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: AccountStatus;
  country: Country;
  preferredCurrency: Currency;
  preferredLanguage: Language;
  avatarUrl?: string;
  phone?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// Expert Types
export type AvailabilityStatus = 'available' | 'partially_available' | 'busy' | 'not_available';

export interface ExpertProfile {
  id: string;
  userId: string;
  headline: string;
  bio: string;
  hourlyRate: number;
  currency: Currency;
  yearsExperience: number;
  skills: string[];
  tools: string[];
  industries: string[];
  languagesSpoken: string[];
  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  websiteUrl?: string;
  availabilityStatus: AvailabilityStatus;
  availableHoursPerWeek: number;
  timezone: string;
  isVerified: boolean;
  ratingAverage: number;
  ratingCount: number;
  totalProjects: number;
  totalEarnings: number;
  responseTimeHours?: number;
  completionRate?: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

// Category Types
export interface Category {
  id: string;
  parentId?: string;
  name: string;
  nameDe: string;
  slug: string;
  description?: string;
  descriptionDe?: string;
  icon?: string;
  imageUrl?: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  serviceCount: number;
  children?: Category[];
}

// Service Types
export type PricingType = 'fixed' | 'hourly' | 'project_based' | 'custom';

export interface Service {
  id: string;
  expertId: string;
  categoryId: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  pricingType: PricingType;
  price: number;
  currency: Currency;
  deliveryTimeDays: number;
  revisionsIncluded: number;
  features: string[];
  requirements?: string;
  tags: string[];
  images: string[];
  videoUrl?: string;
  isActive: boolean;
  isFeatured: boolean;
  viewCount: number;
  orderCount: number;
  ratingAverage: number;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
  expert?: ExpertProfile;
  category?: Category;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginationMeta {
  currentPage: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

