interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

export function Logo({ size = 'md', className = '' }: LogoProps) {
  return (
    <div class={`${sizes[size]} ${className} flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg`}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        class="w-2/3 h-2/3 text-white"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        {/* Automation/workflow icon */}
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v4" />
        <path d="M12 18v4" />
        <path d="m4.93 4.93 2.83 2.83" />
        <path d="m16.24 16.24 2.83 2.83" />
        <path d="M2 12h4" />
        <path d="M18 12h4" />
        <path d="m4.93 19.07 2.83-2.83" />
        <path d="m16.24 7.76 2.83-2.83" />
      </svg>
    </div>
  );
}

