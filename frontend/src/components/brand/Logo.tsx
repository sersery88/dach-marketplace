import { Link } from 'react-router-dom';
import { clsx } from 'clsx';

interface LogoProps {
  variant?: 'default' | 'white' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  linkTo?: string;
  className?: string;
}

/**
 * DACHFlow Brand Logo Component
 * 
 * Features:
 * - Three waves representing automation flow
 * - Three dots representing DACH countries (CH, DE, AT)
 * - Gradient colors: Deep Blue → Teal
 * 
 * @param variant - 'default' (color), 'white' (for dark bg), 'icon' (symbol only)
 * @param size - 'sm', 'md', 'lg'
 * @param linkTo - optional link destination (default: '/')
 */
export function Logo({ variant = 'default', size = 'md', linkTo = '/', className }: LogoProps) {
  const sizes = {
    sm: { icon: 'w-6 h-6', text: 'text-lg' },
    md: { icon: 'w-8 h-8', text: 'text-xl' },
    lg: { icon: 'w-10 h-10', text: 'text-2xl' },
  };

  const textColors = {
    default: {
      main: 'text-neutral-900',
      accent: 'text-primary-600',
    },
    white: {
      main: 'text-white',
      accent: 'text-primary-300',
    },
    icon: {
      main: '',
      accent: '',
    },
  };

  const LogoContent = () => (
    <div className={clsx('flex items-center gap-2', className)}>
      {/* Logo Icon with Gradient */}
      <div className={clsx(
        sizes[size].icon,
        'bg-gradient-to-br from-primary-800 via-primary-600 to-secondary-600',
        'rounded-lg flex items-center justify-center relative overflow-hidden'
      )}>
        {/* Flow Waves */}
        <svg viewBox="0 0 32 32" className="w-full h-full" fill="none">
          <path d="M6 12 Q12 8, 18 12 T30 12" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8"/>
          <path d="M6 16 Q12 12, 18 16 T30 16" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <path d="M6 20 Q12 16, 18 20 T30 20" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8"/>
          {/* DACH dots */}
          <circle cx="8" cy="6" r="1.5" fill="#dc2626"/>
          <circle cx="13" cy="6" r="1.5" fill="white" opacity="0.9"/>
          <circle cx="18" cy="6" r="1.5" fill="#dc2626"/>
        </svg>
      </div>
      
      {/* Text - hidden for icon variant */}
      {variant !== 'icon' && (
        <span className={clsx('font-bold', sizes[size].text)}>
          <span className={textColors[variant].main}>DACH</span>
          <span className={textColors[variant].accent}>Flow</span>
        </span>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="inline-flex focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-lg">
        <LogoContent />
      </Link>
    );
  }

  return <LogoContent />;
}

export default Logo;

