import React from 'react';
import { useApp } from '../context/AppContext';
import { SMART_COMBOS } from '../data/initialData';
import { Sparkles, Plus, Clock, Tag, Flame, Check } from 'lucide-react';

export const SmartCombosSection: React.FC = () => {
  const { addToCart, meals, showToast } = useApp();

  const handleAddCombo = (comboTitle: string, mealIds: string[], price: number) => {
    let addedCount = 0;
    for (const id of mealIds) {
      const success = addToCart(id);
      if (success) addedCount++;
    }
    if (addedCount > 0) {
      showToast(`Added "${comboTitle}" to your basket! You saved ₹${price >= 150 ? '25' : '20'}`);
    }
  };

  return (
    <section id="combos" className="py-12 sm:py-16 bg-[#FAF6F0] border-t border-[#F2ECE4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E23744]/10 border border-[#E23744]/25 text-[#E23744] text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Smart Student Pairings</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1C1917] font-heading">
              Curated Campus Combos
            </h2>
            <p className="text-xs sm:text-sm text-[#78716C] mt-1 max-w-xl">
              Specially bundled university meals with guaranteed instant preparation and guaranteed student savings.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {SMART_COMBOS.map((combo) => {
            const bundledMeals = meals.filter(m => combo.mealIds.includes(m.id));

            return (
              <div
                key={combo.id}
                className="bg-white rounded-2xl p-5 border border-[#F2ECE4] shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-[#E23744] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {combo.badge}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                      Save ₹{combo.savings}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-[#1C1917] font-heading group-hover:text-[#E23744] transition-colors">
                    {combo.title}
                  </h3>
                  <p className="text-xs text-[#78716C] mt-1 leading-relaxed">
                    {combo.tagline}
                  </p>

                  {/* Bundled meals mini avatars */}
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#F2ECE4]">
                    <div className="flex -space-x-2">
                      {bundledMeals.map((m, idx) => (
                        <img
                          key={idx}
                          src={m.imageUrl}
                          alt={m.name}
                          className="w-8 h-8 rounded-full border-2 border-white object-cover"
                          onError={(e) => { e.currentTarget.src = '/images/meals/thali_meal.jpg'; }}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-[#78716C]">
                      {combo.mealIds.length} items bundled
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[#F2ECE4] flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-bold text-[#E23744] font-heading">
                        ₹{combo.comboPrice}
                      </span>
                      <span className="text-xs text-[#78716C] line-through">
                        ₹{combo.originalPrice}
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-semibold block">
                      Campus Exclusive
                    </span>
                  </div>

                  <button
                    onClick={() => handleAddCombo(combo.title, combo.mealIds, combo.comboPrice)}
                    className="px-3.5 py-2 rounded-xl bg-[#E23744] hover:bg-[#CB202D] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-white" />
                    <span>Add Combo</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
