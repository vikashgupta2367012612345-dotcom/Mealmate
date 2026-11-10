import React from 'react';
import { useApp } from '../context/AppContext';
import { Store, MapPin, Clock, Star, ArrowRight, ShieldCheck } from 'lucide-react';

export const FeaturedVendorsSection: React.FC = () => {
  const { vendors, setSelectedKitchen, showToast } = useApp();

  const handleSelectVendor = (vendorName: string) => {
    setSelectedKitchen(vendorName);
    showToast(`Viewing menu for ${vendorName}`);
    const menuEl = document.getElementById('menu');
    if (menuEl) {
      menuEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="vendors" className="py-12 sm:py-16 bg-white border-t border-[#E7E9E3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#174D36]/10 text-[#174D36] text-xs font-bold mb-2">
            <Store className="w-3.5 h-3.5 text-[#174D36]" />
            <span>Authorized Campus Dining</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#174D36] font-heading">
            Featured Campus Outlets
          </h2>
          <p className="text-xs sm:text-sm text-[#737B74] mt-2">
            Every dining outlet at DBS Global University is audited for hygiene, speed, and student pricing.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {vendors.map((vendor) => (
            <div
              key={vendor.id}
              className="bg-[#FFF8E9] rounded-2xl overflow-hidden border border-[#E7E9E3] shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="h-40 relative overflow-hidden bg-[#e5d8c3]">
                  <img
                    src={vendor.imageUrl}
                    alt={vendor.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.currentTarget.src = '/images/meals/thali_meal.jpg'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

                  {/* Status pill */}
                  <span
                    className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      vendor.isOpen
                        ? 'bg-[#27864B] text-white'
                        : 'bg-[#D94848] text-white'
                    }`}
                  >
                    {vendor.isOpen ? 'OPEN FOR ORDERS' : 'CLOSED'}
                  </span>

                  {/* Rating */}
                  <div className="absolute bottom-2 left-3 flex items-center gap-1 bg-black/60 backdrop-blur-xs text-white text-xs px-2 py-0.5 rounded-md font-bold">
                    <Star className="w-3 h-3 fill-[#F3A64A] text-[#F3A64A]" />
                    <span>{vendor.rating}</span>
                    <span className="text-[10px] text-white/70">({vendor.reviewCount})</span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-base text-[#174D36] font-heading">
                    {vendor.name}
                  </h3>
                  <p className="text-xs text-[#737B74] line-clamp-2 leading-relaxed">
                    {vendor.tagline}
                  </p>

                  <div className="pt-2 border-t border-[#E7E9E3] space-y-1 text-xs text-[#737B74]">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#174D36] shrink-0" />
                      <span className="truncate">{vendor.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#F3A64A] shrink-0" />
                      <span>{vendor.operatingHours}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                <button
                  onClick={() => handleSelectVendor(vendor.name)}
                  className="w-full py-2.5 rounded-xl bg-white hover:bg-[#174D36] hover:text-white border border-[#E7E9E3] text-[#174D36] font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Explore Menu</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
