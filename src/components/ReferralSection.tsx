import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Copy, Check, Users, Gift } from 'lucide-react';

export const ReferralSection: React.FC = () => {
  const { showToast } = useApp();
  const [copied, setCopied] = useState(false);
  const referralCode = 'MM-DGU20';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      showToast('Referral code MM-DGU20 copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      showToast('Referral code: MM-DGU20');
    }
  };

  return (
    <section className="bg-[#fffdf8] py-14 sm:py-20 px-5 sm:px-8 border-b border-[#e4e6df]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 bg-[#f7f4eb] p-8 sm:p-10 rounded-xl border border-[#d9ded5]">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-[#126b55] uppercase">
            <Gift className="w-4 h-4 text-[#126b55]" />
            <span>DGU Student Referral Program</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#16342e]">
            Bring a friend. Both eat better.
          </h2>
          <p className="text-xs sm:text-sm text-[#64736d] leading-relaxed">
            Share your unique campus code with hostel mates or classmates. When they place their first pre-order, you both unlock ₹20 towards your next campus meal.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="bg-[#fffdf8] px-4 py-3 rounded-md border border-[#d9ded5] text-center w-full sm:w-auto">
            <span className="text-[10px] text-[#64736d] block font-bold uppercase tracking-wider">Your Referral Code</span>
            <span className="font-mono font-bold text-lg text-[#16342e] tracking-wider">{referralCode}</span>
          </div>

          <button
            onClick={handleCopy}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#16342e] hover:bg-[#0b4c3b] text-white px-5 py-3.5 rounded-md font-bold text-xs sm:text-sm transition-all shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-[#d9f04a]" />
                <span>Code Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[#d9f04a]" />
                <span>Share Code · ₹20 Off</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
};
