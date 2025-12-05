import { RegisterForm } from '@/islands/RegisterForm.tsx';

export default function RegisterPage() {
  return (
    <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div class="max-w-md w-full">
        <div class="text-center mb-8">
          <a href="/" class="inline-flex items-center gap-2 text-2xl font-bold text-blue-600">
            <svg class="w-8 h-8" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="currentColor"/>
              <path d="M8 16L14 22L24 10" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            DACH Automation
          </a>
          <h1 class="mt-6 text-3xl font-bold text-gray-900">Konto erstellen</h1>
          <p class="mt-2 text-gray-600">
            Starten Sie noch heute mit DACH Automation
          </p>
        </div>

        <div class="card">
          <RegisterForm />
          
          <div class="mt-6 text-center text-sm text-gray-600">
            Bereits ein Konto?{' '}
            <a href="/auth/login" class="text-blue-600 hover:underline font-medium">
              Jetzt anmelden
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

