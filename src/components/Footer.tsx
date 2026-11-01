import React from 'react';
import { Clock, ShieldCheck, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#16342e] text-[#d2e1da] px-6 sm:px-10 py-12 border-t border-[#0b4c3b]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Brand & Campus Location */}
        <div className="space-y-2 text-center md:text-left">
          <a href="#top" className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight text-white font-serif">
            <span className="w-8 h-8 rounded-full bg-[#d9f04a] text-[#16342e] font-serif italic text-base flex items-center justify-center font-normal">
              m
            </span>
            <span>MealMate</span>
          </a>
          <p className="text-xs text-[#a0b5ab] max-w-sm leading-relaxed">
            Exclusive campus meal pre-ordering and smart queue coordination platform for <strong>DGU Central Canteen</strong>.
          </p>
          <div className="text-[11px] text-[#7d998d] pt-1 flex items-center justify-center md:justify-start gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#d9f04a]" />
            <span>Central Dining Hall · DBS Global University (DGU), Dehradun</span>
          </div>
        </div>

        {/* Canteen Information & Service Hours */}
        <div className="flex flex-col sm:flex-row items-center gap-6 text-xs text-[#b0c4ba]">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#d9f04a]" />
            <div>
              <div className="font-bold text-white">Daily Service Hours</div>
              <div>11:30 AM – 3:30 PM (Lunch Slots)</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#d9f04a]" />
            <div>
              <div className="font-bold text-white">FSSAI Certified</div>
              <div>Hygienic, freshly plated student dining</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#7d998d]">
        <div>
          © {new Date().getFullYear()} MealMate · DBS Global University. All student pre-orders guaranteed.
        </div>
        <div className="flex items-center gap-4">
          <a href="#menu" className="hover:text-white transition-colors">Daily Menu</a>
          <a href="#how" className="hover:text-white transition-colors">How It Works</a>
          <a href="#top" className="hover:text-white transition-colors">Back to Top ↑</a>
        </div>
      </div>
    </footer>
  );
};
