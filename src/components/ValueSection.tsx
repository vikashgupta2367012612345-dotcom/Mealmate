import React from 'react';

export const ValueSection: React.FC = () => {
  return (
    <section className="bg-[#dce9df] py-16 sm:py-24 px-5 sm:px-8 border-y border-[#c6d7cb]">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-14 items-center">
        {/* Left Column: Mission & Impact */}
        <div className="lg:col-span-7 space-y-6">
          <div className="text-xs font-bold tracking-widest text-[#126b55] uppercase">
            Made For DBS Global University Days
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#16342e] tracking-tight leading-tight">
            Your meal break is worth more than a canteen queue.
          </h2>

          <p className="text-sm sm:text-base text-[#4b6259] leading-relaxed max-w-xl">
            MealMate replaces walk-in uncertainty with advance digital demand forecasting. The central canteen knows what to cook, students reserve confirmed pickup windows, and food waste is cut by up to 40%.
          </p>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
            <div className="bg-[#fffdf8]/60 p-3 rounded-lg border border-[#c6d7cb]">
              <div className="font-serif text-2xl sm:text-3xl font-bold text-[#16342e]">
                &lt; 7 min
              </div>
              <div className="text-[11px] text-[#64736d] font-semibold mt-0.5">
                median pickup wait
              </div>
            </div>

            <div className="bg-[#fffdf8]/60 p-3 rounded-lg border border-[#c6d7cb]">
              <div className="font-serif text-2xl sm:text-3xl font-bold text-[#126b55]">
                ₹0
              </div>
              <div className="text-[11px] text-[#64736d] font-semibold mt-0.5">
                student booking fee
              </div>
            </div>

            <div className="bg-[#fffdf8]/60 p-3 rounded-lg border border-[#c6d7cb]">
              <div className="font-serif text-2xl sm:text-3xl font-bold text-[#16342e]">
                4.8 / 5
              </div>
              <div className="text-[11px] text-[#64736d] font-semibold mt-0.5">
                pilot satisfaction
              </div>
            </div>

            <div className="bg-[#fffdf8]/60 p-3 rounded-lg border border-[#c6d7cb]">
              <div className="font-serif text-2xl sm:text-3xl font-bold text-[#126b55]">
                95%
              </div>
              <div className="text-[11px] text-[#64736d] font-semibold mt-0.5">
                order fulfillment
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Student & Vendor Quotes */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#16342e] text-white p-7 sm:p-8 rounded-lg shadow-xl shadow-[#15362b]/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 text-[#d9f04a]/20 font-serif text-7xl select-none leading-none">
              “
            </div>
            <p className="font-serif text-lg sm:text-xl leading-snug relative z-10 text-[#f7f4eb]">
              “I can order between consecutive MBA lectures and collect hot rajma chawal without sprinting or missing the next attendance bell.”
            </p>
            <div className="mt-5 pt-4 border-t border-white/15 text-xs text-[#b9d3c9] font-medium flex items-center justify-between">
              <span>— Ananya Sharma, MBA 1st Year</span>
              <span className="text-[10px] text-[#d9f04a] bg-[#0b4c3b] px-2 py-0.5 rounded">Hostel Block B</span>
            </div>
          </div>

          <div className="bg-[#fffdf8] border border-[#c6d7cb] p-5 rounded-lg text-xs text-[#4b6259] leading-relaxed">
            <strong className="text-[#16342e] block mb-1">👨‍🍳 Ramesh Ji · Head Chef, DGU Central Canteen:</strong>
            “Before MealMate, we had either 30 people jamming the counter at 12:45 or leftover cold food. Now, pre-orders let us portion plates 10 minutes ahead.”
          </div>
        </div>
      </div>
    </section>
  );
};
