import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowRight, Clock, Sparkles, Search, ShieldCheck, MapPin, CheckCircle2 } from 'lucide-react';

interface HeroProps {
  onQuickOrderRajma: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onQuickOrderRajma }) => {
  const { slots, canteenSchedule, meals, searchQuery, setSearchQuery } = useApp();
  const rajmaMeal = meals.find((m) => m.id === '1') || meals[0];

  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Immediate real-time upcoming pickup window
  const activeSlot = slots[0] || {
    id: 'next-slot',
    label: canteenSchedule.isOpen ? '1:15 – 1:30 PM' : 'Tomorrow 10:15 – 10:30 AM',
    capacity: 12,
    reserved: 7,
    isPeak: true
  };
  const spotsLeft = Math.max(0, activeSlot.capacity - activeSlot.reserved);
  const percentFilled = Math.min(100, Math.round((activeSlot.reserved / activeSlot.capacity) * 100));

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localSearch);
    const menuEl = document.getElementById('menu');
    if (menuEl) {
      menuEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-gradient-to-br from-[#881337] via-[#B91C1C] to-[#E23744] text-[#FFFDF9] px-4 sm:px-8 py-12 md:py-20 relative overflow-hidden">
      {/* Soft background ambient glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#F59E0B]/25 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-[#EA580C]/20 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-14 items-center relative z-10">
        {/* Left Column: Headlines & Search */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/20 text-[#FDE047] text-xs font-bold tracking-wider uppercase border border-white/20 backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-[#FDE047] animate-ping" />
              <span>DBS Global University · Dehradun</span>
            </div>

            {/* Canteen Status Pill */}
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                canteenSchedule.isOpen
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-400/40'
                  : 'bg-rose-950/40 text-rose-200 border-rose-400/40'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  canteenSchedule.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                }`}
              />
              <span>
                {canteenSchedule.isOpen
                  ? 'Open Now · 10:00 AM – 11:00 PM'
                  : 'Closed Now · Opens 10:00 AM'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-extrabold tracking-tight leading-[1.08] text-white drop-shadow-sm">
              Your Campus. <br />
              Your Cravings. <br />
              <span className="text-[#FDE047] italic font-serif">Served Fresh.</span>
            </h1>
            <p className="text-base sm:text-lg text-white/95 max-w-xl leading-relaxed font-sans pt-1 font-medium">
              Order your favourite campus food in advance. Skip the queue and collect hot, freshly plated meals at your chosen time.
            </p>
          </div>

          {/* Search Food Input */}
          <form onSubmit={handleSearchSubmit} className="max-w-lg">
            <div className="relative flex items-center bg-white rounded-2xl p-1.5 shadow-xl border border-white/40">
              <Search className="w-5 h-5 text-[#78716C] ml-3 shrink-0" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => {
                  setLocalSearch(e.target.value);
                  setSearchQuery(e.target.value);
                }}
                placeholder="Search Rajma Chawal, Kathi Roll, Cold Coffee, Thali..."
                className="w-full px-3 py-2 text-xs sm:text-sm text-[#1C1917] placeholder-[#78716C] focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-[#E23744] hover:bg-[#CB202D] text-white font-bold text-xs sm:text-sm transition-colors shrink-0 cursor-pointer shadow-sm active:scale-95"
              >
                Find Food
              </button>
            </div>
          </form>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 pt-1">
            <a
              href="#menu"
              className="inline-flex items-center gap-2 bg-[#F59E0B] hover:bg-[#D97706] text-[#1C1917] px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base transition-all transform hover:-translate-y-0.5 shadow-lg shadow-black/25 active:scale-95"
            >
              <span>Explore Delicious Menu</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <button
              onClick={onQuickOrderRajma}
              className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-5 py-3.5 rounded-xl text-sm font-bold border border-white/25 transition-all cursor-pointer backdrop-blur-xs active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-[#FDE047]" />
              <span>Quick Add · Rajma Bowl (₹89)</span>
            </button>
          </div>

          {/* Verification Guarantee strip */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-white/90 pt-2 border-t border-white/15 font-medium">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#FDE047]" />
              <span>FSSAI Hygiene Audited</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#FDE047]" />
              <span>Average 5-Minute Pickup</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#FDE047]" />
              <span>DGU Central Canteen Counter</span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Live Pickup Pass & Featured Preview */}
        <div className="lg:col-span-5">
          <div className="bg-[#FFFDF9] text-[#1C1917] p-6 sm:p-7 rounded-3xl shadow-2xl border border-white/60">
            {/* Window Status Header */}
            <div className="flex items-center justify-between text-xs font-bold tracking-wider text-[#78716C] uppercase mb-2">
              <span className="flex items-center gap-1.5 text-[#E23744]">
                <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
                Next Pickup Window
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  canteenSchedule.isOpen
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {canteenSchedule.statusText}
              </span>
            </div>

            <div className="text-2xl sm:text-3xl font-heading font-extrabold text-[#1C1917] mb-3">
              {activeSlot.label}
            </div>

            {/* Capacity Meter */}
            <div className="space-y-1.5 mb-5">
              <div className="h-2.5 w-full bg-[#F2ECE4] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#F59E0B] to-[#E23744] rounded-full transition-all duration-500"
                  style={{ width: `${percentFilled}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-xs text-[#78716C]">
                <span>
                  <strong className="text-[#1C1917] font-bold">{spotsLeft}</strong> of {activeSlot.capacity} pickup spots open
                </span>
                <span className="text-[11px] font-bold text-[#E23744]">
                  {spotsLeft <= 3 ? 'Filling Fast!' : 'Fast Collection'}
                </span>
              </div>
            </div>

            {/* Campus Special Highlight Card */}
            <div className="pt-4 border-t border-[#F2ECE4] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 bg-[#F2ECE4] border border-[#E5DDD0] relative shadow-xs">
                  <img
                    src={rajmaMeal.imageUrl || '/images/meals/rajma_rice_bowl.jpg'}
                    alt={rajmaMeal.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/images/meals/rajma_rice_bowl.jpg';
                    }}
                  />
                  <span className="w-2.5 h-2.5 border border-[#16A34A] rounded-[2px] absolute top-1 left-1 bg-white flex items-center justify-center">
                    <span className="w-1 h-1 rounded-full bg-[#16A34A]" />
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#1C1917] leading-tight">
                    {rajmaMeal.name}
                  </h4>
                  <p className="text-[11px] text-[#78716C] mt-0.5">
                    DGU Central Canteen · 5 min prep
                  </p>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-1.5 py-0.5 rounded mt-1 inline-block">
                    ★ 4.8 (219 ratings)
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="font-bold text-[#E23744] text-lg font-heading">₹{rajmaMeal.price}</div>
                <button
                  onClick={onQuickOrderRajma}
                  className="mt-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-[#E23744] hover:bg-[#CB202D] text-white flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                >
                  <Sparkles className="w-3 h-3 text-[#FDE047]" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
