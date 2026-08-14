import React from 'react';
import NovaHeader from './NovaHeader';

export const NovaLayout: React.FC<{children?: React.ReactNode}> = ({ children }) => (
  <div className="w-full h-full bg-[#050507] text-zinc-100 flex flex-col">
    <NovaHeader />
    <main className="flex-1 p-6">{children}</main>
  </div>
);

export default NovaLayout;
