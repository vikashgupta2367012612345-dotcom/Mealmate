import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowRight, Clock, Sparkles } from 'lucide-react';

interface HeroProps {
  onQuickOrderRajma: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onQuickOrderRajma }) => {
  const { slots, canteenSchedule } = useApp();
  
  // Immediate real-time upcoming pickup window (dynamic based on current time)
  const activeSlot = slots[0] || {
    id: 'next-slot',
    label: canteenSchedule.isOpen ? '5:00 – 5:15 PM' : 'Tomorrow 10:15 – 10:30 AM',
    capacity: 8,
    reserved: 5,
    isPeak: true
  };
  const spotsLeft = Math.max(0, activeSlot.capacity - activeSlot.reserved);
  const percentFilled = Math.min(100, Math.round((activeSlot.reserved / activeSlot.capacity) * 100));

  return (
    <section className="bg-[#126b55] text-white px-5 sm:px-8 py-12 md:py-20 relative overflow-hidden">
      {/* Background soft ambient ornament */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#16342e]/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-20 w-72 h-72 rounded-full bg-[#d9f04a]/10 blur-2xl pointer-events-none" />

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-14 items-center relative z-10">
        {/* Left Column: Headlines */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0b4c3b]/60 text-[#d9f04a] text-xs font-bold tracking-wider uppercase border border-[#d9f04a]/20">
              <span className="w-2 h-2 rounded-full bg-[#d9f04a] animate-ping" />
              <span>DBS Global University · Campus Pickup</span>
            </div>

            {/* Real-Time Canteen Hours Live Status Pill */}
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                canteenSchedule.isOpen
                  ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40 shadow-xs'
                  : 'bg-rose-950/70 text-rose-300 border-rose-500/40 shadow-xs'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  canteenSchedule.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                }`}
              />
              <span>
                {canteenSchedule.isOpen
                  ? '🟢 Open Now · Closes at 11:00 PM'
                  : '🔴 Closed Now · Opens at 10:00 AM Everyday'}
              </span>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold tracking-tight leading-[1.05]">
            Skip the queue,<br />
            <span className="text-[#d9f04a] italic font-normal">not the meal.</span>
          </h1>

          <p className="text-base sm:text-lg text-[#d8e9e2] max-w-xl leading-relaxed">
            Campus-priced food from DGU Central Canteen, reserved ahead of time. Pick up at your confirmed slot and get back to class without uncertainty or avoidable waiting.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="#menu"
              className="inline-flex items-center gap-3 bg-[#d9f04a] hover:bg-[#c2dc37] text-[#16342e] px-6 py-3.5 rounded-md font-bold text-base transition-all transform hover:-translate-y-0.5 shadow-md shadow-[#0b4c3b]"
            >
              <span>{canteenSchedule.isOpen ? "Browse today’s menu" : "Browse menu & pre-order"}</span>
              <ArrowRight className="w-5 h-5" />
            </a>

            <a
              href="#how"
              className="inline-flex items-center gap-2 text-white/90 hover:text-white px-4 py-3 rounded-md text-sm font-semibold hover:bg-white/10 transition-colors"
            >
              <span>How it works</span>
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-[#c9ddd6] pt-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#d9f04a]" />
              <span>DGU Central Canteen · Operating 10:00 AM – 11:00 PM Daily</span>
            </div>
            <span className="text-[#86a89c] hidden sm:inline">•</span>
            <span className="text-[#d9f04a] font-medium">{canteenSchedule.timeRemainingText}</span>
          </div>
        </div>

        {/* Right Column: Hero Interactive Live Card */}
        <div className="lg:col-span-5">
          <div className="bg-[#fffdf8] text-[#16342e] p-6 sm:p-7 rounded-lg shadow-[12px_12px_0px_0px_#0b4c3b] border border-[#e4e6df]">
            {/* Status Header */}
            <div className="flex items-center justify-between text-xs font-bold tracking-wider text-[#64736d] uppercase mb-2">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#126b55]" />
                {canteenSchedule.isOpen ? 'Next Pickup Window' : 'Next Opening Batch'}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  canteenSchedule.isOpen
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                {canteenSchedule.statusText}
              </span>
            </div>

            <div className="text-2xl sm:text-3xl font-serif font-bold text-[#16342e] mb-3">
              {activeSlot.label}
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
                  <strong className="text-[#16342e] font-bold">{spotsLeft}</strong> of {activeSlot.capacity} pickup spots left
                </span>
                <span className="text-[11px] font-semibold text-[#f5a623]">
                  {activeSlot.isPeak || spotsLeft <= 3 ? 'High Demand Slot' : 'Available Slot'}
                </span>
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
                  <p className="text-xs text-[#64736d]">DGU Central Canteen · 5 min prep · 420 kcal</p>
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
