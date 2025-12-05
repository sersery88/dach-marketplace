import { useSignal } from '@preact/signals';
import { MessageCircle, X } from 'lucide-preact';

interface Props {
  serviceId: string;
  expertId: string;
}

export function ContactExpertButton({ serviceId, expertId }: Props) {
  const isOpen = useSignal(false);
  const message = useSignal('');
  const isLoading = useSignal(false);

  const handleSubmit = async () => {
    if (!message.value.trim()) return;
    
    isLoading.value = true;
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: expertId,
          serviceId,
          content: message.value,
        }),
      });
      
      if (res.ok) {
        isOpen.value = false;
        message.value = '';
        alert('Nachricht gesendet!');
      } else {
        alert('Fehler beim Senden. Bitte melden Sie sich an.');
      }
    } catch {
      alert('Fehler beim Senden');
    } finally {
      isLoading.value = false;
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => isOpen.value = true}
        class="btn btn-secondary w-full inline-flex items-center justify-center gap-2"
      >
        <MessageCircle class="w-4 h-4" />
        Experten kontaktieren
      </button>

      {isOpen.value && (
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold">Nachricht senden</h3>
              <button
                type="button"
                onClick={() => isOpen.value = false}
                class="p-1 hover:bg-gray-100 rounded"
              >
                <X class="w-5 h-5" />
              </button>
            </div>
            
            <textarea
              value={message.value}
              onInput={(e) => message.value = (e.target as HTMLTextAreaElement).value}
              placeholder="Beschreiben Sie Ihr Projekt oder stellen Sie Fragen..."
              class="input h-32 resize-none mb-4"
            />
            
            <div class="flex gap-3">
              <button
                type="button"
                onClick={() => isOpen.value = false}
                class="btn btn-secondary flex-1"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading.value || !message.value.trim()}
                class="btn btn-primary flex-1"
              >
                {isLoading.value ? 'Senden...' : 'Senden'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ContactExpertButton;

