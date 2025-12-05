import { useSignal } from '@preact/signals';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-preact';

export function LoginForm() {
  const email = useSignal('');
  const password = useSignal('');
  const showPassword = useSignal(false);
  const isLoading = useSignal(false);
  const error = useSignal('');

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    error.value = '';
    isLoading.value = true;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.value,
          password: password.value,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        error.value = data.message || 'Anmeldung fehlgeschlagen';
        return;
      }

      // Store token and redirect
      if (data.token) {
        document.cookie = `auth_token=${data.token}; path=/; max-age=604800; SameSite=Lax`;
      }
      window.location.href = '/dashboard';
    } catch {
      error.value = 'Netzwerkfehler. Bitte versuchen Sie es erneut.';
    } finally {
      isLoading.value = false;
    }
  };

  return (
    <form onSubmit={handleSubmit} class="space-y-4">
      {error.value && (
        <div class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error.value}
        </div>
      )}

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
        <div class="relative">
          <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            value={email.value}
            onInput={(e) => email.value = (e.target as HTMLInputElement).value}
            placeholder="ihre@email.de"
            required
            class="input pl-10"
          />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Passwort</label>
        <div class="relative">
          <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type={showPassword.value ? 'text' : 'password'}
            value={password.value}
            onInput={(e) => password.value = (e.target as HTMLInputElement).value}
            placeholder="••••••••"
            required
            class="input pl-10 pr-10"
          />
          <button
            type="button"
            onClick={() => showPassword.value = !showPassword.value}
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword.value ? <EyeOff class="w-5 h-5" /> : <Eye class="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div class="flex items-center justify-between text-sm">
        <label class="flex items-center gap-2">
          <input type="checkbox" class="rounded border-gray-300" />
          <span class="text-gray-600">Angemeldet bleiben</span>
        </label>
        <a href="/auth/forgot-password" class="text-blue-600 hover:underline">
          Passwort vergessen?
        </a>
      </div>

      <button
        type="submit"
        disabled={isLoading.value}
        class="btn btn-primary w-full inline-flex items-center justify-center gap-2"
      >
        {isLoading.value && <Loader2 class="w-4 h-4 animate-spin" />}
        {isLoading.value ? 'Anmelden...' : 'Anmelden'}
      </button>
    </form>
  );
}

export default LoginForm;

