import { useSignal } from '@preact/signals';
import { Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-preact';

export function RegisterForm() {
  const firstName = useSignal('');
  const lastName = useSignal('');
  const email = useSignal('');
  const password = useSignal('');
  const confirmPassword = useSignal('');
  const showPassword = useSignal(false);
  const isLoading = useSignal(false);
  const error = useSignal('');
  const userType = useSignal<'client' | 'expert'>('client');

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    error.value = '';

    if (password.value !== confirmPassword.value) {
      error.value = 'Passwörter stimmen nicht überein';
      return;
    }

    if (password.value.length < 8) {
      error.value = 'Passwort muss mindestens 8 Zeichen lang sein';
      return;
    }

    isLoading.value = true;

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.value,
          lastName: lastName.value,
          email: email.value,
          password: password.value,
          userType: userType.value,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        error.value = data.message || 'Registrierung fehlgeschlagen';
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

      {/* User Type Toggle */}
      <div class="flex rounded-lg border border-gray-200 p-1">
        <button
          type="button"
          onClick={() => userType.value = 'client'}
          class={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            userType.value === 'client' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Auftraggeber
        </button>
        <button
          type="button"
          onClick={() => userType.value = 'expert'}
          class={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            userType.value === 'expert' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Experte
        </button>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Vorname</label>
          <div class="relative">
            <User class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" value={firstName.value} onInput={(e) => firstName.value = (e.target as HTMLInputElement).value} placeholder="Max" required class="input pl-10" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nachname</label>
          <input type="text" value={lastName.value} onInput={(e) => lastName.value = (e.target as HTMLInputElement).value} placeholder="Mustermann" required class="input" />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
        <div class="relative">
          <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="email" value={email.value} onInput={(e) => email.value = (e.target as HTMLInputElement).value} placeholder="ihre@email.de" required class="input pl-10" />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Passwort</label>
        <div class="relative">
          <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type={showPassword.value ? 'text' : 'password'} value={password.value} onInput={(e) => password.value = (e.target as HTMLInputElement).value} placeholder="••••••••" required class="input pl-10 pr-10" />
          <button type="button" onClick={() => showPassword.value = !showPassword.value} class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showPassword.value ? <EyeOff class="w-5 h-5" /> : <Eye class="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Passwort bestätigen</label>
        <div class="relative">
          <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="password" value={confirmPassword.value} onInput={(e) => confirmPassword.value = (e.target as HTMLInputElement).value} placeholder="••••••••" required class="input pl-10" />
        </div>
      </div>

      <label class="flex items-start gap-2 text-sm">
        <input type="checkbox" required class="rounded border-gray-300 mt-0.5" />
        <span class="text-gray-600">
          Ich akzeptiere die <a href="/legal/terms" class="text-blue-600 hover:underline">AGB</a> und <a href="/legal/privacy" class="text-blue-600 hover:underline">Datenschutzerklärung</a>
        </span>
      </label>

      <button type="submit" disabled={isLoading.value} class="btn btn-primary w-full inline-flex items-center justify-center gap-2">
        {isLoading.value && <Loader2 class="w-4 h-4 animate-spin" />}
        {isLoading.value ? 'Registrieren...' : 'Konto erstellen'}
      </button>
    </form>
  );
}

export default RegisterForm;

