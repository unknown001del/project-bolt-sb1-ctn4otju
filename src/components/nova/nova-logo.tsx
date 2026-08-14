import React from 'react';

export const NovaLogo: React.FC<{ size?: number }> = ({ size = 24 }) => {
  return (
    <div style={{ width: size, height: size }} className="flex items-center justify-center">
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="20" height="20" rx="4" fill="#0f1720" />
        <path d="M6 12h12M12 6v12" stroke="#FF6B00" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

export default NovaLogo;
