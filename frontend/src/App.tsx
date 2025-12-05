import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from '@/components/layout';
import { ToastProvider, Skeleton } from '@/components/ui';
import { ProtectedRoute, GuestRoute, DashboardRouter } from '@/components/auth';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Import i18n configuration
import '@/i18n';

// Lazy load pages for code splitting
const Home = lazy(() => import('@/pages/Home').then(m => ({ default: m.Home })));
const Services = lazy(() => import('@/pages/Services').then(m => ({ default: m.Services })));
const ServiceDetail = lazy(() => import('@/pages/ServiceDetail').then(m => ({ default: m.ServiceDetail })));
const Experts = lazy(() => import('@/pages/Experts').then(m => ({ default: m.Experts })));
const ExpertProfile = lazy(() => import('@/pages/ExpertProfile').then(m => ({ default: m.ExpertProfile })));
const Login = lazy(() => import('@/pages/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('@/pages/Register').then(m => ({ default: m.Register })));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const VerifyEmail = lazy(() => import('@/pages/VerifyEmail').then(m => ({ default: m.VerifyEmail })));
const ResetPassword = lazy(() => import('@/pages/ResetPassword').then(m => ({ default: m.ResetPassword })));
const ExpertDashboard = lazy(() => import('@/pages/ExpertDashboard').then(m => ({ default: m.ExpertDashboard })));
const CreatePosting = lazy(() => import('@/pages/CreatePosting').then(m => ({ default: m.CreatePosting })));
const Postings = lazy(() => import('@/pages/Postings').then(m => ({ default: m.Postings })));
const Search = lazy(() => import('@/pages/Search').then(m => ({ default: m.Search })));
const CategoriesPage = lazy(() => import('@/pages/CategoriesPage').then(m => ({ default: m.CategoriesPage })));
const Messages = lazy(() => import('@/pages/Messages'));
const Payments = lazy(() => import('@/pages/Payments').then(m => ({ default: m.Payments })));
const Admin = lazy(() => import('@/pages/Admin').then(m => ({ default: m.Admin })));
const BecomeExpert = lazy(() => import('@/pages/BecomeExpert').then(m => ({ default: m.BecomeExpert })));
const CreateService = lazy(() => import('@/pages/CreateService').then(m => ({ default: m.CreateService })));
const Checkout = lazy(() => import('@/pages/Checkout').then(m => ({ default: m.Checkout })));
const CheckoutSuccess = lazy(() => import('@/pages/CheckoutSuccess').then(m => ({ default: m.CheckoutSuccess })));
const CheckoutCancel = lazy(() => import('@/pages/CheckoutCancel').then(m => ({ default: m.CheckoutCancel })));
const BrowseProjects = lazy(() => import('@/pages/BrowseProjects').then(m => ({ default: m.BrowseProjects })));
const ProjectDetail = lazy(() => import('@/pages/ProjectDetail').then(m => ({ default: m.ProjectDetail })));
const PostingDetail = lazy(() => import('@/pages/PostingDetail').then(m => ({ default: m.PostingDetail })));
const ProjectWorkspace = lazy(() => import('@/pages/ProjectWorkspace').then(m => ({ default: m.ProjectWorkspace })));
const Settings = lazy(() => import('@/pages/Settings').then(m => ({ default: m.Settings })));
const NotFound = lazy(() => import('@/pages/NotFound').then(m => ({ default: m.NotFound })));

// Static pages
const HowItWorks = lazy(() => import('@/pages/static').then(m => ({ default: m.HowItWorks })));
const About = lazy(() => import('@/pages/static').then(m => ({ default: m.About })));
const Pricing = lazy(() => import('@/pages/static').then(m => ({ default: m.Pricing })));
const Contact = lazy(() => import('@/pages/static').then(m => ({ default: m.Contact })));
const Help = lazy(() => import('@/pages/static').then(m => ({ default: m.Help })));
const FAQ = lazy(() => import('@/pages/static').then(m => ({ default: m.FAQ })));
const Terms = lazy(() => import('@/pages/Terms').then(m => ({ default: m.Terms })));
const Privacy = lazy(() => import('@/pages/Privacy').then(m => ({ default: m.Privacy })));
const Imprint = lazy(() => import('@/pages/Impressum').then(m => ({ default: m.Impressum })));
const Cookies = lazy(() => import('@/pages/static').then(m => ({ default: m.Cookies })));
const TrustSafety = lazy(() => import('@/pages/static').then(m => ({ default: m.TrustSafety })));
const Careers = lazy(() => import('@/pages/static').then(m => ({ default: m.Careers })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="space-y-4 w-full max-w-md px-4">
        <Skeleton className="h-8 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public routes with layout */}
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="search" element={<Search />} />
                  <Route path="services" element={<Services />} />
                  <Route path="services/:id" element={<ServiceDetail />} />
                  <Route path="experts" element={<Experts />} />
                  <Route path="experts/:id" element={<ExpertProfile />} />
                  <Route path="categories" element={<CategoriesPage />} />
                  <Route path="categories/:slug" element={<CategoriesPage />} />
                  <Route path="projects" element={<BrowseProjects />} />
                  <Route path="projects/:id" element={<ProjectDetail />} />
                  {/* Static pages */}
                  <Route path="how-it-works" element={<HowItWorks />} />
                  <Route path="about" element={<About />} />
                  <Route path="pricing" element={<Pricing />} />
                  <Route path="contact" element={<Contact />} />
                  <Route path="help" element={<Help />} />
                  <Route path="faq" element={<FAQ />} />
                  <Route path="terms" element={<Terms />} />
                  <Route path="privacy" element={<Privacy />} />
                  <Route path="imprint" element={<Imprint />} />
                  <Route path="cookies" element={<Cookies />} />
                  <Route path="trust-safety" element={<TrustSafety />} />
                  <Route path="careers" element={<Careers />} />
                </Route>

                {/* Protected routes - require authentication */}
                <Route path="/dashboard" element={<Layout />}>
                  <Route index element={
                    <ProtectedRoute>
                      <DashboardRouter />
                    </ProtectedRoute>
                  } />
                </Route>
                <Route path="/expert-dashboard" element={<Layout />}>
                  <Route index element={
                    <ProtectedRoute roles={['expert']}>
                      <ExpertDashboard />
                    </ProtectedRoute>
                  } />
                </Route>
                <Route path="/workspace/:id" element={<Layout />}>
                  <Route index element={
                    <ProtectedRoute>
                      <ProjectWorkspace />
                    </ProtectedRoute>
                  } />
                </Route>
                <Route path="/postings" element={<Layout />}>
                  <Route index element={
                    <ProtectedRoute>
                      <Postings />
                    </ProtectedRoute>
                  } />
                  <Route path="new" element={
                    <ProtectedRoute>
                      <CreatePosting />
                    </ProtectedRoute>
                  } />
                  <Route path=":id" element={
                    <ProtectedRoute>
                      <PostingDetail />
                    </ProtectedRoute>
                  } />
                </Route>
                <Route path="/messages" element={<Layout />}>
                  <Route index element={
                    <ProtectedRoute>
                      <Messages />
                    </ProtectedRoute>
                  } />
                </Route>
                <Route path="/settings" element={<Layout />}>
                  <Route index element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } />
                </Route>
                <Route path="/payments" element={<Layout />}>
                  <Route index element={
                    <ProtectedRoute>
                      <Payments />
                    </ProtectedRoute>
                  } />
                </Route>
                <Route path="/become-expert" element={<Layout />}>
                  <Route index element={
                    <ProtectedRoute>
                      <BecomeExpert />
                    </ProtectedRoute>
                  } />
                </Route>
                <Route path="/services/new" element={<Layout />}>
                  <Route index element={
                    <ProtectedRoute>
                      <CreateService />
                    </ProtectedRoute>
                  } />
                </Route>

                {/* Checkout routes - require authentication */}
                <Route path="/checkout" element={<Layout />}>
                  <Route index element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  } />
                  <Route path="success" element={
                    <ProtectedRoute>
                      <CheckoutSuccess />
                    </ProtectedRoute>
                  } />
                  <Route path="cancel" element={
                    <ProtectedRoute>
                      <CheckoutCancel />
                    </ProtectedRoute>
                  } />
                </Route>

                {/* Admin routes - require admin role */}
                <Route path="/admin" element={<Layout />}>
                  <Route index element={
                    <ProtectedRoute roles={['admin']}>
                      <Admin />
                    </ProtectedRoute>
                  } />
                </Route>

                {/* Auth routes - redirect if already logged in */}
                <Route path="/login" element={
                  <GuestRoute>
                    <Login />
                  </GuestRoute>
                } />
                <Route path="/register" element={
                  <GuestRoute>
                    <Register />
                  </GuestRoute>
                } />
                <Route path="/forgot-password" element={
                  <GuestRoute>
                    <ForgotPassword />
                  </GuestRoute>
                } />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/reset-password" element={
                  <GuestRoute>
                    <ResetPassword />
                  </GuestRoute>
                } />

                {/* 404 - Catch all unmatched routes */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ToastProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
