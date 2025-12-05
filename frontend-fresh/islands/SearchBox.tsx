import { useSignal } from '@preact/signals';
import { Search } from 'lucide-preact';

export function SearchBox() {
  const query = useSignal('');

  const handleSearch = () => {
    if (query.value.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query.value.trim())}`;
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
      <div class="relative w-full max-w-xl">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query.value}
          onInput={(e) => query.value = (e.target as HTMLInputElement).value}
          onKeyDown={handleKeyDown}
          placeholder="z.B. 'n8n Workflow', 'CRM Integration', 'ChatGPT Bot'..."
          class="w-full pl-12 pr-32 py-4 rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30"
        />
        <button
          type="button"
          onClick={handleSearch}
          class="absolute right-2 top-1/2 -translate-y-1/2 btn btn-primary"
        >
          Suchen
        </button>
      </div>
    </div>
  );
}

export default SearchBox;

