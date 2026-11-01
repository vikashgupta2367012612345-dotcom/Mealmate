import React from 'react';
import { useApp } from '../context/AppContext';
import { ChefHat, FileSpreadsheet, RotateCcw } from 'lucide-react';

interface FooterProps {
  onOpenVendor: () => void;
  onOpenVenture: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenVendor, onOpenVenture }) => {
  const { resetAllData } = useApp();

  return (
    <footer className="bg-[#16342e] text-[#d2e1da] px-6 sm:px-10 py-12 border-t border-[#0b4c3b]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Brand & Attribution */}
        <div className="space-y-2 text-center md:text-left">
          <a href="#top" className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight text-white">
            <span className="w-8 h-8 rounded-full bg-[#d9f04a] text-[#16342e] font-serif italic text-base flex items-center justify-center font-normal">
              m
            </span>
            <span>MealMate</span>
          </a>
          <p className="text-xs text-[#a0b5ab]">
            Campus-focused meal pre-ordering and demand coordination platform.
          </p>
          <div className="text-[11px] text-[#7d998d] pt-1">
            Built by <strong>Vikash Kumar Gupta</strong> (Roll: 0251MBA621) · DBS Global University, Dehradun
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-semibold">
          <button
            onClick={onOpenVendor}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#0b4c3b] hover:bg-[#126b55] text-[#d9f04a] transition-colors"
          >
            <ChefHat className="w-4 h-4" />
            <span>Kitchen Portal</span>
          </button>

          <button
            onClick={onOpenVenture}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#0b4c3b] hover:bg-[#126b55] text-white transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#d9f04a]" />
            <span>Venture Blueprint (Asgn 1 & 2)</span>
          </button>

          <button
            onClick={resetAllData}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[#a0b5ab] hover:text-white hover:bg-white/5 transition-colors text-[11px]"
            title="Reset to fresh campus seed data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
