import React from 'react';
import { Clock, ShieldCheck, MapPin, Mail, Phone, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#174D36] text-[#FFF8E9] px-6 sm:px-10 py-12 border-t border-[#E7E9E3]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand & Campus Location */}
        <div className="space-y-3 md:col-span-2">
          <a href="#top" className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight text-white font-heading">
            <span className="w-8 h-8 rounded-xl bg-[#F3A64A] text-[#174D36] font-heading font-extrabold text-sm flex items-center justify-center">
              MM
            </span>
            <span>MealMate</span>
          </a>
          <p className="text-xs text-[#FFF8E9]/80 max-w-md leading-relaxed">
            <strong>"Skip the queue, not the meal."</strong> Dedicated campus food pre-ordering and vendor coordination ecosystem connecting students, campus food vendors, and administrators at DBS Global University, Dehradun.
          </p>
          <div className="text-xs text-[#75A879] pt-1 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#F3A64A] shrink-0" />
            <span>Central Dining Hall · DBS Global University (DGU), Dehradun, Uttarakhand</span>
          </div>
        </div>

        {/* Operating Hours & Hygiene */}
        <div className="space-y-2 text-xs">
          <div className="font-bold text-white uppercase text-[11px] tracking-wider mb-2">
            Campus Operations
          </div>
          <div className="flex items-start gap-2 text-[#FFF8E9]/80">
            <Clock className="w-4 h-4 text-[#F3A64A] shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block">10:00 AM – 11:00 PM</strong>
              <span>Open everyday (Mon - Sun) for breakfast, lunch & dinner</span>
            </div>
          </div>
          <div className="flex items-start gap-2 text-[#FFF8E9]/80 pt-2">
            <ShieldCheck className="w-4 h-4 text-[#75A879] shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block">FSSAI Certified</strong>
              <span>Audited student nutrition & hygiene standards</span>
            </div>
          </div>
        </div>

        {/* Support & Contact */}
        <div className="space-y-2 text-xs">
          <div className="font-bold text-white uppercase text-[11px] tracking-wider mb-2">
            Support & Help Desk
          </div>
          <div className="flex items-center gap-2 text-[#FFF8E9]/80">
            <Mail className="w-4 h-4 text-[#F3A64A] shrink-0" />
            <span>canteen.support@dgu.ac.in</span>
          </div>
          <div className="flex items-center gap-2 text-[#FFF8E9]/80">
            <Phone className="w-4 h-4 text-[#75A879] shrink-0" />
            <span>Campus Dining Desk: Ext. 408</span>
          </div>
          <div className="pt-2 text-[11px] text-[#75A879]">
            Developed for DGU Venture Quest by <strong>Vikash Kumar Gupta</strong> (Roll: 0251MBA621).
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#FFF8E9]/70">
        <div>
          © {new Date().getFullYear()} MealMate · DBS Global University. All student pre-orders guaranteed.
        </div>
        <div className="flex items-center gap-4 text-xs">
          <a href="#menu" className="hover:text-white transition-colors">Daily Menu</a>
          <a href="#combos" className="hover:text-white transition-colors">Smart Combos</a>
          <a href="#vendors" className="hover:text-white transition-colors">Campus Outlets</a>
          <a href="#top" className="hover:text-white transition-colors">Back to Top ↑</a>
        </div>
      </div>
    </footer>
  );
};
