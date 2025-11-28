import type { ApiResponse, PaginatedResponse } from '@/types';

// Use environment variable for API URL, fallback to relative path for development
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
    // Handle both absolute URLs (https://...) and relative paths (/api/v1)
    const baseUrl = this.baseUrl.startsWith('http')
      ? this.baseUrl
      : `${window.location.origin}${this.baseUrl}`;
    const url = new URL(`${baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return url.toString();
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;
    const url = this.buildUrl(endpoint, params);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient(API_BASE_URL);

// Type-safe API endpoints
export const endpoints = {
  // Auth
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    me: '/auth/me',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyEmail: '/auth/verify-email',
  },
  // Users
  users: {
    list: '/users',
    get: (id: string) => `/users/${id}`,
    update: (id: string) => `/users/${id}`,
  },
  // Experts
  experts: {
    list: '/experts',
    get: (id: string) => `/experts/${id}`,
    featured: '/experts/featured',
  },
  // Services
  services: {
    list: '/services',
    get: (id: string) => `/services/${id}`,
    featured: '/services/featured',
    byCategory: (slug: string) => `/services/category/${slug}`,
    search: '/services/search',
  },
  // Categories
  categories: {
    list: '/categories',
    get: (slug: string) => `/categories/${slug}`,
    featured: '/categories/featured',
  },
  // Projects
  projects: {
    list: '/projects',
    get: (id: string) => `/projects/${id}`,
    create: '/projects',
  },
  // Messages
  messages: {
    conversations: '/messages/conversations',
    conversation: (id: string) => `/messages/conversations/${id}`,
    send: '/messages',
  },
  // Reviews
  reviews: {
    list: '/reviews',
    get: (id: string) => `/reviews/${id}`,
    create: '/reviews',
    respond: (id: string) => `/reviews/${id}/response`,
    helpful: (id: string) => `/reviews/${id}/helpful`,
    summary: (expertId: string) => `/reviews/summary/${expertId}`,
  },
  // Client
  clients: {
    profile: '/clients/profile',
    createProfile: '/clients/profile',
    updateProfile: '/clients/profile',
  },
  // Project Postings
  postings: {
    list: '/postings',
    get: (id: string) => `/postings/${id}`,
    create: '/postings',
    update: (id: string) => `/postings/${id}`,
    delete: (id: string) => `/postings/${id}`,
    proposals: (id: string) => `/postings/${id}/proposals`,
    acceptProposal: (proposalId: string) => `/postings/proposals/${proposalId}/accept`,
  },
  // Bookings
  bookings: {
    list: '/bookings',
    create: '/bookings',
    respond: (id: string) => `/bookings/${id}/respond`,
  },
  // Search
  search: {
    unified: '/search',
    experts: '/search/experts',
    services: '/search/services',
    suggestions: '/search/suggestions',
  },
  // Payments
  payments: {
    checkout: '/payments/checkout',
    list: '/payments',
    get: (id: string) => `/payments/${id}`,
    connectStatus: '/payments/connect/status',
    connectCreate: '/payments/connect/create',
    connectRefresh: '/payments/connect/refresh',
  },
  // Payouts
  payouts: {
    list: '/payouts',
    request: '/payouts/request',
  },
  // Invoices
  invoices: {
    list: '/invoices',
    get: (id: string) => `/invoices/${id}`,
    download: (id: string) => `/invoices/${id}/download`,
    html: (id: string) => `/invoices/${id}/html`,
  },
} as const;

export type { ApiResponse, PaginatedResponse };

