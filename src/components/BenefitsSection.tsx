import React from 'react';

export const BenefitsSection: React.FC = () => {
  return (
    <section id="how" className="max-w-6xl mx-auto px-4 sm:px-8 -mt-6 sm:-mt-8 relative z-20">
      <div className="bg-[#fffdf8] border border-[#e4e6df] shadow-lg shadow-[#15362b]/5 rounded-lg grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#d9ded5]">
        <div className="p-6 sm:p-7 flex gap-4 items-start">
          <span className="font-serif text-2xl font-bold text-[#126b55] leading-none pt-0.5">
            01
          </span>
          <div>
            <strong className="block text-sm sm:text-base font-bold text-[#16342e] mb-1">
              See what’s actually available
            </strong>
            <p className="text-xs sm:text-sm text-[#64736d] leading-relaxed">
              Live campus kitchen updates. No stock-out surprises after walking across campus.
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-7 flex gap-4 items-start">
          <span className="font-serif text-2xl font-bold text-[#126b55] leading-none pt-0.5">
            02
          </span>
          <div>
            <strong className="block text-sm sm:text-base font-bold text-[#16342e] mb-1">
              Reserve a confirmed pickup slot
            </strong>
            <p className="text-xs sm:text-sm text-[#64736d] leading-relaxed">
              Capped 10-minute collection windows protect your lunch break between classes.
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-7 flex gap-4 items-start">
          <span className="font-serif text-2xl font-bold text-[#126b55] leading-none pt-0.5">
            03
          </span>
          <div>
            <strong className="block text-sm sm:text-base font-bold text-[#16342e] mb-1">
              Collect & go with your token
            </strong>
            <p className="text-xs sm:text-sm text-[#64736d] leading-relaxed">
              Show your digital token code at the counter, pay at pickup, and skip the line completely.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
