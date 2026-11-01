import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowRight, Clock, Sparkles } from 'lucide-react';

interface HeroProps {
  onQuickOrderRajma: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onQuickOrderRajma }) => {
  const { slots } = useApp();
  
  // Find current active/peak slot (12:40)
  const peakSlot = slots.find(s => s.id === '12-40') || slots[0];
  const spotsLeft = Math.max(0, peakSlot.capacity - peakSlot.reserved);
  const percentFilled = Math.min(100, Math.round((peakSlot.reserved / peakSlot.capacity) * 100));

  return (
    <section className="bg-[#126b55] text-white px-5 sm:px-8 py-12 md:py-20 relative overflow-hidden">
      {/* Background soft ambient ornament */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#16342e]/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-20 w-72 h-72 rounded-full bg-[#d9f04a]/10 blur-2xl pointer-events-none" />

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-14 items-center relative z-10">
        {/* Left Column: Headlines */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0b4c3b]/60 text-[#d9f04a] text-xs font-bold tracking-wider uppercase border border-[#d9f04a]/20">
            <span className="w-2 h-2 rounded-full bg-[#d9f04a] animate-ping" />
            <span>DBS Global University · Campus Pickup</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold tracking-tight leading-[1.05]">
            Skip the queue,<br />
            <span className="text-[#d9f04a] italic font-normal">not the meal.</span>
          </h1>

          <p className="text-base sm:text-lg text-[#d8e9e2] max-w-xl leading-relaxed">
            Campus-priced food, reserved ahead of time. Pick up at your confirmed slot and get back to class without uncertainty or avoidable waiting.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="#menu"
              className="inline-flex items-center gap-3 bg-[#d9f04a] hover:bg-[#c2dc37] text-[#16342e] px-6 py-3.5 rounded-md font-bold text-base transition-all transform hover:-translate-y-0.5 shadow-md shadow-[#0b4c3b]"
            >
              <span>Browse today’s menu</span>
              <ArrowRight className="w-5 h-5" />
            </a>

            <a
              href="#how"
              className="inline-flex items-center gap-2 text-white/90 hover:text-white px-4 py-3 rounded-md text-sm font-semibold hover:bg-white/10 transition-colors"
            >
              <span>How it works</span>
            </a>
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm text-[#c9ddd6] pt-2">
            <span className="w-2 h-2 rounded-full bg-[#d9f04a]" />
            <span>Live inventory from 3 campus kitchens: Green Leaf, North Block & South Square</span>
          </div>
        </div>

        {/* Right Column: Hero Interactive Live Card */}
        <div className="lg:col-span-5">
          <div className="bg-[#fffdf8] text-[#16342e] p-6 sm:p-7 rounded-lg shadow-[12px_12px_0px_0px_#0b4c3b] border border-[#e4e6df]">
            <div className="flex items-center justify-between text-xs font-bold tracking-wider text-[#64736d] uppercase mb-2">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#126b55]" />
                Next Pickup Window
              </span>
              <span className="px-2 py-0.5 rounded bg-[#f7f4eb] text-[#126b55] text-[10px] font-bold border border-[#d9ded5]">
                DGU Hostels & Academic Block
              </span>
            </div>

            <div className="text-2xl sm:text-3xl font-serif font-bold text-[#16342e] mb-3">
              {peakSlot.label}
            </div>

            {/* Slot Meter */}
            <div className="space-y-1.5 mb-4">
              <div className="h-2 w-full bg-[#e2e4dc] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#f5a623] rounded-full transition-all duration-500"
                  style={{ width: `${percentFilled}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-xs text-[#64736d]">
                <span>
                  <strong className="text-[#16342e] font-bold">{spotsLeft}</strong> of {peakSlot.capacity} pickup spots left
                </span>
                <span className="text-[11px] font-semibold text-[#f5a623]">High Demand Slot</span>
              </div>
            </div>

            {/* Featured Item Preview */}
            <div className="pt-4 border-t border-[#d9ded5] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-[#e8dac5] border border-[#d9ded5] relative">
                  <img
                    src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=200&q=80"
                    alt="Rajma rice bowl"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <span className="w-2.5 h-2.5 border border-[#16a34a] rounded-[1px] absolute top-1 left-1 bg-white flex items-center justify-center">
                    <span className="w-1 h-1 rounded-full bg-[#16a34a]" />
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#16342e] leading-tight">Rajma rice bowl</h4>
                  <p className="text-xs text-[#64736d]">Green Leaf Canteen · 5 min prep · 420 kcal</p>
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold text-[#16342e] text-base">₹89</div>
                <button
                  onClick={onQuickOrderRajma}
                  className="mt-1 text-xs font-bold text-[#126b55] hover:text-[#0b4c3b] hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-[#f5a623]" />
                  <span>Quick Add</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
