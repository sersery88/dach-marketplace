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

// Portfolio Types
export interface PortfolioItem {
  id: string;
  expertId: string;
  title: string;
  description: string;
  projectUrl?: string;
  imageUrls: string[];
  imageUrl?: string; // First image for convenience
  videoUrl?: string;
  tools: string[];
  toolsUsed: string[];
  categoryId?: string;
  clientName?: string;
  clientTestimonial?: string;
  completionDate?: string;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
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

export interface CategoryTree {
  category: Category;
  children: CategoryTree[];
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
  packages?: ServicePackage[];
}

export interface ServicePackage {
  id: string;
  serviceId: string;
  name: string;
  description: string;
  price: number;
  deliveryTimeDays: number;
  revisionsIncluded: number;
  features: string[];
  isPopular: boolean;
  sortOrder: number;
}

// Project Types
export type ProjectStatus = 
  | 'pending' | 'accepted' | 'paid' | 'in_progress' 
  | 'delivered' | 'revision' | 'completed' 
  | 'cancelled' | 'disputed' | 'refunded';

export interface Project {
  id: string;
  clientId: string;
  expertId: string;
  serviceId?: string;
  packageId?: string;
  title: string;
  description: string;
  requirements?: string;
  status: ProjectStatus;
  price: number;
  currency: Currency;
  platformFee: number;
  expertPayout: number;
  deliveryDate?: string;
  deliveredAt?: string;
  completedAt?: string;
  revisionsUsed: number;
  revisionsAllowed: number;
  isDisputed: boolean;
  createdAt: string;
  updatedAt: string;
  client?: User;
  expert?: User;
  service?: Service;
}

// Review Types
export interface Review {
  id: string;
  projectId: string;
  reviewerId: string;
  revieweeId: string;
  serviceId?: string;
  rating: number;
  title?: string;
  content: string;
  communicationRating?: number;
  qualityRating?: number;
  timelinessRating?: number;
  valueRating?: number;
  isVerified: boolean;
  isPublic: boolean;
  helpfulCount: number;
  response?: string;
  responseAt?: string;
  createdAt: string;
  reviewer?: User;
}

export interface ReviewWithReviewer {
  review: Review;
  reviewerName: string;
  reviewerAvatar?: string;
  reviewerCountry: string;
}

export interface CreateReviewRequest {
  projectId: string;
  serviceId?: string;
  rating: number;
  title?: string;
  content: string;
  communicationRating?: number;
  qualityRating?: number;
  timelinessRating?: number;
  valueRating?: number;
  isPublic?: boolean;
}

export interface ReviewResponseRequest {
  response: string;
}

export interface ReviewSummary {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: RatingDistribution;
  averageCommunication?: number;
  averageQuality?: number;
  averageTimeliness?: number;
  averageValue?: number;
}

export interface RatingDistribution {
  fiveStar: number;
  fourStar: number;
  threeStar: number;
  twoStar: number;
  oneStar: number;
}

export interface ReviewFilters {
  expertId?: string;
  serviceId?: string;
  minRating?: number;
  verifiedOnly?: boolean;
}

// Client Types
export interface ClientProfile {
  id: string;
  userId: string;
  companyName?: string;
  companyWebsite?: string;
  companySize?: string;
  industry?: string;
  description?: string;
  preferredBudgetMin?: number;
  preferredBudgetMax?: number;
  preferredTools: string[];
  preferredIndustries: string[];
  totalProjects: number;
  totalSpent: number;
  isVerified: boolean;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

// Project Posting Types
export type ProjectPostingStatus = 'draft' | 'open' | 'in_review' | 'assigned' | 'completed' | 'cancelled';
export type ProjectPostingBudgetType = 'fixed' | 'hourly' | 'range';

export interface ProjectPosting {
  id: string;
  clientId: string;
  title: string;
  description: string;
  requirements?: string;
  categoryId?: string;
  skillsRequired: string[];
  toolsRequired: string[];
  budgetType: ProjectPostingBudgetType;
  budgetMin?: number;
  budgetMax?: number;
  currency: Currency;
  deadline?: string;
  estimatedDuration?: string;
  status: ProjectPostingStatus;
  isUrgent: boolean;
  isFeatured: boolean;
  attachments: string[];
  viewCount: number;
  proposalCount: number;
  assignedExpertId?: string;
  assignedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  client?: User;
}

// Proposal Types
export type ProposalStatus = 'pending' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn';

export interface Proposal {
  id: string;
  projectPostingId: string;
  expertId: string;
  coverLetter: string;
  proposedPrice: number;
  currency: Currency;
  proposedDuration?: string;
  proposedMilestones?: ProposalMilestone[];
  attachments: string[];
  status: ProposalStatus;
  isFeatured: boolean;
  clientViewedAt?: string;
  shortlistedAt?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  withdrawnAt?: string;
  createdAt: string;
  updatedAt: string;
  expert?: User;
  projectPosting?: ProjectPosting;
}

export interface ProposalMilestone {
  title: string;
  description: string;
  amount: number;
  dueDate?: string;
}

// Booking Request Types
export type BookingStatus = 'pending' | 'accepted' | 'declined' | 'cancelled' | 'expired';

export interface BookingRequest {
  id: string;
  clientId: string;
  expertId: string;
  serviceId?: string;
  packageId?: string;
  message: string;
  proposedBudget?: number;
  currency: Currency;
  proposedStartDate?: string;
  proposedDeadline?: string;
  status: BookingStatus;
  expertResponse?: string;
  respondedAt?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  client?: User;
  expert?: User;
  service?: Service;
}

// Search Types
export interface ExpertSearchResult {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  headline: string;
  hourlyRate: number;
  currency: string;
  skills: string[];
  tools: string[];
  ratingAverage: number;
  ratingCount: number;
  isVerified: boolean;
  country: string;
}

export interface ServiceSearchResult {
  id: string;
  expertId: string;
  expertName: string;
  expertAvatar?: string;
  title: string;
  shortDescription: string;
  price: number;
  currency: string;
  deliveryTimeDays: number;
  ratingAverage: number;
  ratingCount: number;
  categoryName: string;
  tags: string[];
}

export interface SearchSuggestion {
  text: string;
  category: string;
  count: number;
}

export interface UnifiedSearchResult {
  experts: ExpertSearchResult[];
  services: ServiceSearchResult[];
  categories: Category[];
  suggestions: SearchSuggestion[];
}

export interface ExpertSearchFilters {
  q?: string;
  skills?: string;
  tools?: string;
  countries?: string;
  minRate?: number;
  maxRate?: number;
  minRating?: number;
  verifiedOnly?: boolean;
  sortBy?: 'rating' | 'hourly_rate' | 'hourly_rate_desc' | 'experience' | 'newest';
  page?: number;
  perPage?: number;
}

export interface ServiceSearchFilters {
  q?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  maxDeliveryDays?: number;
  tags?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'delivery' | 'popularity' | 'newest';
  page?: number;
  perPage?: number;
}

// Payment Types
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded' | 'disputed';
export type PayoutStatus = 'pending' | 'in_transit' | 'paid' | 'failed' | 'cancelled';

export interface Payment {
  id: string;
  projectId?: string;
  clientId: string;
  expertId: string;
  amount: number;
  currency: Currency;
  platformFee: number;
  expertPayout: number;
  status: PaymentStatus;
  stripePaymentIntentId?: string;
  stripeSessionId?: string;
  description?: string;
  serviceTitle?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payout {
  id: string;
  expertId: string;
  amount: number;
  currency: Currency;
  status: PayoutStatus;
  stripePayoutId?: string;
  arrivalDate?: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  paymentId: string;
  invoiceNumber: string;
  clientId: string;
  expertId: string;
  subtotal: number;
  vatAmount: number;
  vatRate: number;
  total: number;
  currency: Currency;
  status: 'draft' | 'open' | 'paid' | 'void';
  dueDate?: string;
  paidAt?: string;
  pdfUrl?: string;
  createdAt: string;
}

export interface CheckoutSessionRequest {
  serviceId: string;
  packageTier?: 'basic' | 'standard' | 'premium';
  customAmount?: number;
  currency?: string;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  checkoutUrl: string;
}

export interface ConnectAccountStatus {
  hasAccount: boolean;
  accountId?: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  onboardingComplete: boolean;
}

export interface ConnectOnboardingResponse {
  accountId: string;
  onboardingUrl: string;
  expiresAt: number;
}

// Message Types
export type MessageType = 'text' | 'file' | 'image' | 'system' | 'offer' | 'projectUpdate';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: MessageType;
  attachments?: MessageAttachment[];
  isRead: boolean;
  readAt?: string;
  isEdited: boolean;
  editedAt?: string;
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
}

export interface MessageAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}

export interface ParticipantInfo {
  id: string;
  name: string;
  avatarUrl?: string;
  isOnline: boolean;
  lastSeen?: string;
}

export interface MessagePreview {
  content: string;
  senderId: string;
  sentAt: string;
  isRead: boolean;
}

export interface ConversationPreview {
  id: string;
  otherParticipant: ParticipantInfo;
  lastMessage?: MessagePreview;
  unreadCount: number;
  serviceTitle?: string;
  projectTitle?: string;
  createdAt: string;
}

export interface SendMessageRequest {
  conversationId?: string;
  recipientId?: string;
  serviceId?: string;
  content: string;
  messageType?: MessageType;
  attachments?: { fileName: string; fileUrl: string; fileType: string; fileSize: number }[];
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

