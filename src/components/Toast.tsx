import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2 } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-bounce duration-300">
      <div className="bg-[#16342e] text-[#fffdf8] px-5 py-3 rounded-full shadow-2xl flex items-center gap-2.5 text-xs sm:text-sm font-semibold border border-[#d9f04a]/30">
        <CheckCircle2 className="w-4 h-4 text-[#d9f04a] shrink-0" />
        <span>{toastMessage}</span>
      </div>
    </div>
  );
};
