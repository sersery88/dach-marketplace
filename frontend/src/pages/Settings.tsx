import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  User, Lock, Bell, CreditCard, Shield, Trash2,
  Camera, Save, Eye, EyeOff, Check, Loader2
} from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Input } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

type SettingsTab = 'profile' | 'security' | 'notifications' | 'billing' | 'privacy';

export function Settings() {
  useTranslation(); // For future i18n
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    bio: '',
    avatarUrl: user?.avatarUrl || '',
  });

  // Security form state
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailMessages: true,
    emailProjects: true,
    emailMarketing: false,
    pushMessages: true,
    pushProjects: true,
  });

  const tabs = [
    { key: 'profile' as const, label: 'Profil', icon: User },
    { key: 'security' as const, label: 'Sicherheit', icon: Lock },
    { key: 'notifications' as const, label: 'Benachrichtigungen', icon: Bell },
    { key: 'billing' as const, label: 'Zahlung', icon: CreditCard },
    { key: 'privacy' as const, label: 'Datenschutz', icon: Shield },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-neutral-900">Einstellungen</h1>
          <p className="text-neutral-600 mt-1">Verwalten Sie Ihr Konto und Ihre Präferenzen</p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <Card className="p-2">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
                      activeTab === tab.key
                        ? "bg-primary-50 text-primary-700"
                        : "text-neutral-600 hover:bg-neutral-50"
                    )}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </Card>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            {activeTab === 'profile' && (
              <ProfileTab
                data={profileData}
                onChange={setProfileData}
                onSave={handleSave}
                isSaving={isSaving}
                saveSuccess={saveSuccess}
              />
            )}
            {activeTab === 'security' && (
              <SecurityTab
                data={securityData}
                onChange={setSecurityData}
                showPasswords={showPasswords}
                setShowPasswords={setShowPasswords}
                onSave={handleSave}
                isSaving={isSaving}
              />
            )}
            {activeTab === 'notifications' && (
              <NotificationsTab
                data={notifications}
                onChange={setNotifications}
                onSave={handleSave}
                isSaving={isSaving}
              />
            )}
            {activeTab === 'billing' && <BillingTab />}
            {activeTab === 'privacy' && <PrivacyTab />}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Profile data type
type ProfileData = { firstName: string; lastName: string; email: string; phone: string; bio: string; avatarUrl: string };

// Profile Tab Component
function ProfileTab({ data, onChange, onSave, isSaving, saveSuccess }: {
  data: ProfileData;
  onChange: (data: ProfileData) => void;
  onSave: () => void;
  isSaving: boolean;
  saveSuccess: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profil bearbeiten</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
              {data.avatarUrl ? (
                <img src={data.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-primary-600">
                  {data.firstName.charAt(0)}{data.lastName.charAt(0)}
                </span>
              )}
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div>
            <h3 className="font-medium text-neutral-900">Profilbild</h3>
            <p className="text-sm text-neutral-500">JPG, PNG oder GIF. Max 5MB.</p>
          </div>
        </div>

        {/* Name Fields */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Vorname</label>
            <Input
              value={data.firstName}
              onChange={(e) => onChange({ ...data, firstName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Nachname</label>
            <Input
              value={data.lastName}
              onChange={(e) => onChange({ ...data, lastName: e.target.value })}
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">E-Mail</label>
          <Input
            type="email"
            value={data.email}
            onChange={(e) => onChange({ ...data, email: e.target.value })}
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Telefon</label>
          <Input
            type="tel"
            value={data.phone}
            onChange={(e) => onChange({ ...data, phone: e.target.value })}
            placeholder="+41 79 123 45 67"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Über mich</label>
          <textarea
            value={data.bio}
            onChange={(e) => onChange({ ...data, bio: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            placeholder="Erzählen Sie etwas über sich..."
          />
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-green-600"
            >
              <Check className="w-4 h-4" />
              <span className="text-sm">Änderungen gespeichert</span>
            </motion.div>
          )}
          <Button onClick={onSave} disabled={isSaving} className="ml-auto">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Speichern
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Security data types
type SecurityData = { currentPassword: string; newPassword: string; confirmPassword: string };
type ShowPasswordsState = { current: boolean; new: boolean; confirm: boolean };

// Security Tab Component
function SecurityTab({ data, onChange, showPasswords, setShowPasswords, onSave, isSaving }: {
  data: SecurityData;
  onChange: (data: SecurityData) => void;
  showPasswords: ShowPasswordsState;
  setShowPasswords: (data: ShowPasswordsState) => void;
  onSave: () => void;
  isSaving: boolean;
}) {
  const passwordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const strength = passwordStrength(data.newPassword);
  const strengthLabels = ['Sehr schwach', 'Schwach', 'Mittel', 'Stark', 'Sehr stark'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-green-600'];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Passwort ändern</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Aktuelles Passwort</label>
            <div className="relative">
              <Input
                type={showPasswords.current ? 'text' : 'password'}
                value={data.currentPassword}
                onChange={(e) => onChange({ ...data, currentPassword: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Neues Passwort</label>
            <div className="relative">
              <Input
                type={showPasswords.new ? 'text' : 'password'}
                value={data.newPassword}
                onChange={(e) => onChange({ ...data, newPassword: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {data.newPassword && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className={cn("h-1 flex-1 rounded", i < strength ? strengthColors[strength] : 'bg-neutral-200')} />
                  ))}
                </div>
                <p className="text-xs text-neutral-500">{strengthLabels[strength]}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Passwort bestätigen</label>
            <div className="relative">
              <Input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={data.confirmPassword}
                onChange={(e) => onChange({ ...data, confirmPassword: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {data.confirmPassword && data.newPassword !== data.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">Passwörter stimmen nicht überein</p>
            )}
          </div>

          <Button onClick={onSave} disabled={isSaving || !data.currentPassword || !data.newPassword || data.newPassword !== data.confirmPassword}>
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
            Passwort ändern
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Zwei-Faktor-Authentifizierung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-600">Erhöhen Sie die Sicherheit Ihres Kontos mit 2FA</p>
              <p className="text-sm text-neutral-500 mt-1">Nicht aktiviert</p>
            </div>
            <Button variant="outline">Aktivieren</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


// Notifications data type
type NotificationsData = { emailMessages: boolean; emailProjects: boolean; emailMarketing: boolean; pushMessages: boolean; pushProjects: boolean };

// Notifications Tab Component
function NotificationsTab({ data, onChange, onSave, isSaving }: {
  data: NotificationsData;
  onChange: (data: NotificationsData) => void;
  onSave: () => void;
  isSaving: boolean;
}) {
  const Toggle = ({ checked, onChange: onToggle }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onToggle(!checked)}
      className={cn(
        "relative w-11 h-6 rounded-full transition-colors",
        checked ? "bg-primary-600" : "bg-neutral-200"
      )}
    >
      <span className={cn(
        "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow",
        checked && "translate-x-5"
      )} />
    </button>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Benachrichtigungen</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-medium text-neutral-900 mb-4">E-Mail-Benachrichtigungen</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-neutral-700">Nachrichten</p>
                <p className="text-sm text-neutral-500">Benachrichtigung bei neuen Nachrichten</p>
              </div>
              <Toggle checked={data.emailMessages} onChange={(v) => onChange({ ...data, emailMessages: v })} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-neutral-700">Projekte</p>
                <p className="text-sm text-neutral-500">Updates zu Ihren Projekten</p>
              </div>
              <Toggle checked={data.emailProjects} onChange={(v) => onChange({ ...data, emailProjects: v })} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-neutral-700">Marketing</p>
                <p className="text-sm text-neutral-500">Tipps, Angebote und Neuigkeiten</p>
              </div>
              <Toggle checked={data.emailMarketing} onChange={(v) => onChange({ ...data, emailMarketing: v })} />
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-100 pt-6">
          <h3 className="font-medium text-neutral-900 mb-4">Push-Benachrichtigungen</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-neutral-700">Nachrichten</p>
                <p className="text-sm text-neutral-500">Sofortige Benachrichtigung bei neuen Nachrichten</p>
              </div>
              <Toggle checked={data.pushMessages} onChange={(v) => onChange({ ...data, pushMessages: v })} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-neutral-700">Projekte</p>
                <p className="text-sm text-neutral-500">Updates zu Ihren Projekten</p>
              </div>
              <Toggle checked={data.pushProjects} onChange={(v) => onChange({ ...data, pushProjects: v })} />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-neutral-100">
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Speichern
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Billing Tab Component
function BillingTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Zahlungsmethoden</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-600 mb-4">Keine Zahlungsmethode hinterlegt</p>
            <Button>Zahlungsmethode hinzufügen</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rechnungsverlauf</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-500 text-center py-4">Keine Rechnungen vorhanden</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Privacy Tab Component
function PrivacyTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Datenschutz-Einstellungen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-neutral-100">
            <div>
              <p className="font-medium text-neutral-700">Profil öffentlich</p>
              <p className="text-sm text-neutral-500">Ihr Profil ist für andere Nutzer sichtbar</p>
            </div>
            <button className="relative w-11 h-6 rounded-full bg-primary-600">
              <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full translate-x-5 shadow" />
            </button>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-neutral-100">
            <div>
              <p className="font-medium text-neutral-700">Online-Status anzeigen</p>
              <p className="text-sm text-neutral-500">Andere können sehen, wenn Sie online sind</p>
            </div>
            <button className="relative w-11 h-6 rounded-full bg-neutral-200">
              <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow" />
            </button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Gefahrenzone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-700">Konto löschen</p>
              <p className="text-sm text-neutral-500">Alle Daten werden unwiderruflich gelöscht</p>
            </div>
            <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
              <Trash2 className="w-4 h-4 mr-2" />
              Konto löschen
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

