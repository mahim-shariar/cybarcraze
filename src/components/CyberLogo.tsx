import React from 'react';

interface Props {
  variant?: 'full' | 'compact' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const CyberLogo: React.FC<Props> = ({ variant = 'full', size = 'md', className = '' }) => {
  if (variant === 'icon') {
    const iconDim = size === 'sm' ? 28 : size === 'lg' ? 44 : size === 'xl' ? 56 : 36;
    return (
      <img
        src="/cybercraze-icon.svg"
        alt="CyberCraze HQ"
        width={iconDim}
        height={iconDim}
        className={`inline-block ${className}`}
      />
    );
  }

  const heightClass =
    size === 'sm' ? 'h-7' : size === 'lg' ? 'h-11' : size === 'xl' ? 'h-14' : 'h-8 sm:h-9';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <img
        src="/cybercraze-logo.svg"
        alt="CyberCraze – HQ Gaming Space"
        className={`${heightClass} w-auto object-contain`}
      />
    </div>
  );
};
