import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MealCategory, MealItem } from '../types';
import { DishDetailModal } from './DishDetailModal';
import { StudentReviews } from './StudentReviews';
import {
  Search,
  Plus,
  Check,
  AlertCircle,
  Sparkles,
  Star,
  Clock,
  ShieldCheck,
  Flame,
  Info
} from 'lucide-react';

const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80';

export const MenuSection: React.FC = () => {
  const { meals, addToCart, cart, activeRole, restockMeal, canteenSchedule } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<MealCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [budgetFilter, setBudgetFilter] = useState<'all' | 'under70' | 'under5min'>('all');
  const [selectedDish, setSelectedDish] = useState<MealItem | null>(null);
  const [expandedNutritionId, setExpandedNutritionId] = useState<string | null>(null);
  const [hoveredInfoId, setHoveredInfoId] = useState<string | null>(null);

  // Daily Specials: Deluxe Student North Indian Thali & Kadhai Paneer Parathas
  const dailySpecials = [
    meals.find((m) => m.id === '25') || meals[0],
    meals.find((m) => m.id === '17') || meals.find((m) => m.id === '15') || meals[1]
  ].filter(Boolean) as MealItem[];

  const filteredMeals = meals.filter((meal) => {
    // Category match
    if (selectedCategory !== 'all' && meal.type !== selectedCategory) {
      return false;
    }

    // Budget & speed sub-filter
    if (budgetFilter === 'under70' && meal.price > 70) {
      return false;
    }
    if (budgetFilter === 'under5min' && (meal.prepTimeMinutes || 6) > 5) {
      return false;
    }

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = meal.name.toLowerCase().includes(q);
      const matchVendor = meal.vendorName.toLowerCase().includes(q);
      const matchDesc = meal.description?.toLowerCase().includes(q) || false;
      const matchTag = meal.tag?.toLowerCase().includes(q) || false;
      if (!matchName && !matchVendor && !matchDesc && !matchTag) return false;
    }

    return true;
  });

  const getCartQuantity = (mealId: string) => {
    const found = cart.find((item) => item.meal.id === mealId);
    return found ? found.quantity : 0;
  };

  return (
    <section id="menu" className="max-w-6xl mx-auto px-4 sm:px-8 py-16 sm:py-24">
      {/* Business Trust Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3.5 bg-[#fffdf8] rounded-lg border border-[#e4e6df] mb-6 text-xs text-[#64736d]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#126b55] shrink-0" />
          <span><strong>DGU Central</strong> Canteen</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#126b55] shrink-0" />
          <span><strong>10 AM – 11 PM</strong> Daily Hours</span>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#f5a623] shrink-0" />
          <span><strong>7 Min</strong> Pickup Guarantee</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full shrink-0 ${canteenSchedule.isOpen ? 'bg-[#10b981] animate-pulse' : 'bg-[#e11d48]'}`} />
          <span><strong>Status:</strong> {canteenSchedule.statusText}</span>
        </div>
      </div>

      {/* Real-time Schedule Status Banner */}
      {!canteenSchedule.isOpen ? (
        <div className="mb-8 p-4 bg-[#fff1f2] border-2 border-[#fecdd3] rounded-xl text-xs sm:text-sm text-[#9f1239] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <span className="w-3 h-3 rounded-full bg-[#e11d48] mt-1 shrink-0" />
            <div>
              <strong className="block font-bold text-sm text-[#881337]">
                DGU Central Canteen is Currently Closed (Hours: 10:00 AM – 11:00 PM Everyday)
              </strong>
              <p className="text-xs text-[#9f1239] mt-0.5">
                {canteenSchedule.timeRemainingText}. You can still reserve meals now; your order will be prioritized for pickup during the 10:00 AM morning batch!
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-white rounded-full border border-[#fecdd3] font-bold text-xs text-[#e11d48] whitespace-nowrap self-end sm:self-auto">
            Pre-Orders Active
          </span>
        </div>
      ) : (
        <div className="mb-8 p-3.5 bg-[#ecfdf5] border border-[#a7f3d0] rounded-xl text-xs text-[#065f46] flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse" />
            <span>
              <strong>DGU Central Canteen is Open Now:</strong> Serving live counter orders until 11:00 PM everyday · {canteenSchedule.timeRemainingText}
            </span>
          </div>
          <span className="hidden sm:inline font-mono font-semibold text-[11px] bg-white px-2.5 py-0.5 rounded-full border border-[#a7f3d0]">
            Clock: {canteenSchedule.currentTimeFormatted}
          </span>
        </div>
      )}

      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="text-xs font-bold tracking-widest text-[#126b55] uppercase mb-1.5 flex items-center gap-2">
            <span>Official Campus Food Catalog · {meals.length} Fresh Dishes</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#16342e] tracking-tight">
            Order ahead. Pick up fresh.
          </h2>
          <p className="text-sm text-[#64736d] mt-2 max-w-xl">
            Real dishes prepared live at DBS Global University dining counters. Select a dish for ingredients, macros, and guaranteed collection windows.
          </p>
        </div>

        {/* Search Input */}
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-[#64736d] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search rajma, thali, momos, rolls..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#fffdf8] border border-[#d9ded5] rounded-full text-xs sm:text-sm text-[#16342e] placeholder-[#8a9992] focus:outline-none focus:border-[#126b55] focus:ring-1 focus:ring-[#126b55] transition-all shadow-xs"
          />
        </div>
      </div>

      {/* Daily Specials Showcase */}
      {dailySpecials.length > 0 && (
        <div className="mb-14">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-5">
            <div>
              <div className="text-xs font-bold tracking-widest text-[#dc2626] uppercase flex items-center gap-1.5 mb-1">
                <Flame className="w-4 h-4 fill-[#dc2626] text-[#dc2626]" />
                <span>Chef's Limited-Run Selection</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#16342e]">
                Today’s Daily Specials
              </h3>
              <p className="text-xs sm:text-sm text-[#64736d]">
                Handcrafted batches prepared exclusively for today's lunch peak. Reserve early before portions sell out.
              </p>
            </div>
            <div className="text-[11px] text-[#126b55] font-semibold bg-[#e2ead1] px-3 py-1 rounded-full self-start sm:self-auto border border-[#c2dc37]">
              Capped to maintain &lt;7 min counter pickup
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {dailySpecials.map((special) => {
              const inCartCount = getCartQuantity(special.id);
              const isSoldOut = special.available <= 0;

              return (
                <div
                  key={`special-${special.id}`}
                  className="bg-[#fffdf8] border-2 border-[#d9ded5] hover:border-[#126b55] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  {/* Large Hero Image */}
                  <div
                    onClick={() => setSelectedDish(special)}
                    className="h-64 sm:h-72 w-full relative overflow-hidden bg-[#e8dac5] cursor-pointer"
                  >
                    {special.imageUrl ? (
                      <img
                        src={special.imageUrl}
                        alt={special.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (target.getAttribute('data-fallback') !== 'true') {
                            target.setAttribute('data-fallback', 'true');
                            target.src = DEFAULT_FALLBACK_IMAGE;
                          }
                        }}
                      />
                    ) : (
                      <img
                        src={DEFAULT_FALLBACK_IMAGE}
                        alt={special.name}
                        className="w-full h-full object-cover"
                      />
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/15 pointer-events-none" />

                    {/* Top Left: Prominent Limited Time Badge */}
                    <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#dc2626] text-white text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-xs ring-2 ring-white/20">
                        <Clock className="w-3.5 h-3.5 text-[#d9f04a]" />
                        <span>Limited Time</span>
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-black/60 text-white text-xs font-semibold backdrop-blur-xs border border-white/20">
                        {special.available > 0 ? `Only ${special.available} portions left` : 'Sold out'}
                      </span>
                    </div>

                    {/* Top Right: Canteen Tag */}
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 rounded-full bg-[#16342e]/90 text-white text-xs font-semibold backdrop-blur-xs border border-white/20">
                        DGU Central Canteen
                      </span>
                    </div>

                    {/* Bottom Overlay Info */}
                    <div className="absolute bottom-3.5 left-4 right-4 flex items-end justify-between text-white">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-[#d9f04a] font-bold mb-1">
                          <Star className="w-4 h-4 fill-[#f59e0b] stroke-[#d97706]" />
                          <span>{special.rating || 4.9}</span>
                          <span className="text-white/80 font-normal">({special.reviewCount || 300}+ reviews)</span>
                        </div>
                        <div className="text-xs text-white/90">
                          {special.calories} kcal · {special.proteinGrams}g protein · {special.prepTimeMinutes}m prep
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-white/80 block leading-tight">Campus Deal</span>
                        <span className="text-2xl sm:text-3xl font-serif font-bold text-[#d9f04a]">
                          ₹{special.price}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Body & Actions */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {/* FSSAI Mark */}
                        <span
                          className={`w-4 h-4 border flex items-center justify-center rounded-[2px] shrink-0 ${
                            special.dietaryType === 'non-veg'
                              ? 'border-[#dc2626]'
                              : special.dietaryType === 'egg'
                              ? 'border-[#d97706]'
                              : 'border-[#16a34a]'
                          }`}
                          title={
                            special.dietaryType === 'non-veg'
                              ? 'Non-Vegetarian'
                              : special.dietaryType === 'egg'
                              ? 'Contains Egg'
                              : '100% Pure Vegetarian'
                          }
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              special.dietaryType === 'non-veg'
                                ? 'bg-[#dc2626]'
                                : special.dietaryType === 'egg'
                                ? 'bg-[#d97706]'
                                : 'bg-[#16a34a]'
                            }`}
                          />
                        </span>

                        <h4
                          onClick={() => setSelectedDish(special)}
                          className="text-xl font-serif font-bold text-[#16342e] hover:text-[#126b55] cursor-pointer transition-colors"
                        >
                          {special.name}
                        </h4>

                        {/* Interactive 'i' Info Icon for Daily Special */}
                        <div className="relative inline-flex items-center ml-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedNutritionId(expandedNutritionId === special.id ? null : special.id);
                            }}
                            onMouseEnter={() => setHoveredInfoId(special.id)}
                            onMouseLeave={() => setHoveredInfoId(null)}
                            aria-label={`Nutritional info for ${special.name}`}
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-serif italic font-bold transition-all ${
                              expandedNutritionId === special.id
                                ? 'bg-[#126b55] text-white'
                                : 'bg-[#f0eee6] hover:bg-[#126b55] text-[#64736d] hover:text-white'
                            }`}
                            title="Hover or click for calories & allergens"
                          >
                            i
                          </button>

                          {/* Hover Tooltip */}
                          {hoveredInfoId === special.id && expandedNutritionId !== special.id && (
                            <div className="absolute z-40 bottom-full mb-2.5 left-1/2 -translate-x-1/2 w-64 p-3 bg-[#16342e] text-[#fffdf8] rounded-lg shadow-2xl border border-[#d9f04a]/30 pointer-events-none text-left animate-in fade-in zoom-in-95 duration-150">
                              <div className="text-[10px] font-bold text-[#d9f04a] uppercase tracking-wider mb-1 flex items-center justify-between border-b border-white/15 pb-1">
                                <span>Nutrition & Allergens</span>
                                <span>{special.calories} kcal</span>
                              </div>
                              <div className="text-[11px] space-y-1">
                                <div className="flex justify-between text-white/90">
                                  <span>Protein:</span>
                                  <strong className="text-white font-semibold">{special.proteinGrams}g</strong>
                                </div>
                                <div className="flex justify-between text-white/90">
                                  <span>Prep time:</span>
                                  <span className="text-white/80">{special.prepTimeMinutes} mins</span>
                                </div>
                                <div className="pt-1 border-t border-white/10 text-[10px] text-[#c9ddd6] leading-snug">
                                  <strong className="text-[#d9f04a]">Allergens: </strong>
                                  <span>
                                    {special.allergens && special.allergens.length > 0
                                      ? special.allergens.join(', ')
                                      : 'None listed (Allergen-free)'}
                                  </span>
                                </div>
                              </div>
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#16342e]" />
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-[#4b6259] leading-relaxed mb-3">
                        {special.description}
                      </p>

                      {/* In-Card Expanded Nutrition Details for Daily Special */}
                      {expandedNutritionId === special.id && (
                        <div className="my-2.5 p-3 bg-[#f0eee6] rounded-lg border border-[#d9ded5] text-xs space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                          <div className="flex items-center justify-between font-bold text-[#16342e]">
                            <span className="flex items-center gap-1.5 text-xs">
                              <Flame className="w-3.5 h-3.5 text-[#f5a623]" />
                              <span>Special Macro Profile</span>
                            </span>
                            <span className="bg-[#126b55] text-white px-2 py-0.5 rounded text-[10px] font-bold">
                              {special.calories} kcal
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[11px] text-[#64736d] bg-[#fffdf8] p-2 rounded border border-[#e4e6df]">
                            <div>
                              <span className="block text-[10px] text-[#8a9992] uppercase font-semibold">Protein</span>
                              <strong className="text-[#126b55] font-bold text-xs">{special.proteinGrams}g</strong>
                            </div>
                            <div>
                              <span className="block text-[10px] text-[#8a9992] uppercase font-semibold">Prep Time</span>
                              <strong className="text-[#16342e] font-bold text-xs">{special.prepTimeMinutes} mins</strong>
                            </div>
                          </div>

                          <div className="text-[11px] text-[#4b6259] pt-1 border-t border-[#e2e4dc]">
                            <strong className="text-[#16342e]">Allergens: </strong>
                            <span>
                              {special.allergens && special.allergens.length > 0
                                ? special.allergens.join(', ')
                                : 'None listed (Allergen-free)'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#f0eee6] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <button
                        onClick={() => setSelectedDish(special)}
                        className="text-xs text-[#126b55] hover:text-[#0b4c3b] font-bold flex items-center gap-1 justify-center sm:justify-start"
                      >
                        <Info className="w-3.5 h-3.5" />
                        <span>View Ingredients & Nutrition</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {inCartCount > 0 ? (
                          <div className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-[#16342e] text-white px-4 py-2.5 rounded-md text-xs font-bold shadow-xs">
                            <Check className="w-4 h-4 text-[#d9f04a]" />
                            <span>{inCartCount} in Basket</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(special.id)}
                            disabled={isSoldOut}
                            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-md font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm ${
                              isSoldOut
                                ? 'bg-[#e2e4dc] text-[#a4aca6] cursor-not-allowed'
                                : 'bg-[#126b55] hover:bg-[#0b4c3b] text-white active:scale-95'
                            }`}
                          >
                            <Plus className="w-4 h-4 text-[#d9f04a]" />
                            <span>Reserve Special · ₹{special.price}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Catalog Section Divider & Subheading */}
      <div className="flex items-center justify-between gap-4 pt-4 pb-2 border-t border-[#e4e6df] mb-6">
        <div>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#16342e]">
            Full Campus Menu Catalog
          </h3>
          <p className="text-xs text-[#64736d]">
            Filter by dietary preferences, meal categories, or speed of preparation.
          </p>
        </div>
      </div>

      {/* Filters Bar: Category Pills & Quick Speed/Budget Tags */}
      <div className="space-y-3.5 mb-8">

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[#64736d] mr-1 hidden sm:inline">Menu:</span>
          {[
            { id: 'all', label: 'All Dishes' },
            { id: 'veg', label: '🥦 Pure Veg & Homestyle' },
            { id: 'combos', label: '🍱 Thalis & Meal Combos' },
            { id: 'protein', label: '🍗 High Protein & Egg' },
            { id: 'snacks', label: '🥟 Momos, Samosas & Snacks' },
            { id: 'quick', label: '⚡ Quick Bites & Rolls' },
            { id: 'drinks', label: '🥤 Shakes, Tea & Chilled' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as MealCategory)}
              className={`px-3 py-1.5 rounded-full border transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-[#16342e] text-[#d9f04a] font-bold border-[#16342e] shadow-xs'
                  : 'bg-[#fffdf8] text-[#64736d] border-[#d9ded5] hover:text-[#16342e] hover:border-[#b0b9ab]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Speed / Budget Quick Toggles */}
        <div className="flex items-center gap-2 overflow-x-auto text-[11px] font-medium text-[#64736d]">
          <span>Filter:</span>
          <button
            onClick={() => setBudgetFilter(budgetFilter === 'under70' ? 'all' : 'under70')}
            className={`px-2.5 py-1 rounded-md border transition-all ${
              budgetFilter === 'under70'
                ? 'bg-[#e2ead1] text-[#16342e] border-[#c2dc37] font-bold'
                : 'bg-[#f7f4eb] border-[#d9ded5] hover:text-[#16342e]'
            }`}
          >
            💰 Under ₹70 (Budget Picks)
          </button>
          <button
            onClick={() => setBudgetFilter(budgetFilter === 'under5min' ? 'all' : 'under5min')}
            className={`px-2.5 py-1 rounded-md border transition-all ${
              budgetFilter === 'under5min'
                ? 'bg-[#e2ead1] text-[#16342e] border-[#c2dc37] font-bold'
                : 'bg-[#f7f4eb] border-[#d9ded5] hover:text-[#16342e]'
            }`}
          >
            ⏱️ Fast Prep (≤5 mins)
          </button>
          <span className="ml-auto text-[11px] text-[#8a9992] hidden md:inline">
            Showing {filteredMeals.length} dishes
          </span>
        </div>
      </div>

      {/* Menu Grid */}
      {filteredMeals.length === 0 ? (
        <div className="bg-[#fffdf8] border border-dashed border-[#d9ded5] p-12 text-center rounded-lg">
          <p className="text-base text-[#64736d] mb-3">No campus dishes found matching your selection.</p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setBudgetFilter('all');
              setSearchQuery('');
            }}
            className="text-xs font-bold text-[#126b55] underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeals.map((meal) => {
            const inCartCount = getCartQuantity(meal.id);
            const isSoldOut = meal.available <= 0;

            return (
              <article
                key={meal.id}
                className="bg-[#fffdf8] border border-[#e6e5dd] rounded-xl overflow-hidden relative flex flex-col justify-between hover:shadow-lg transition-all duration-300 group hover:-translate-y-0.5"
              >
                {/* Visual Top Preview: Realistic Food Image */}
                <div
                  onClick={() => setSelectedDish(meal)}
                  className="h-44 w-full bg-[#f0eee6] relative overflow-hidden cursor-pointer"
                >
                  {meal.imageUrl ? (
                    <img
                      src={meal.imageUrl}
                      alt={meal.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.getAttribute('data-fallback') !== 'true') {
                          target.setAttribute('data-fallback', 'true');
                          target.src = DEFAULT_FALLBACK_IMAGE;
                        }
                      }}
                    />
                  ) : (
                    <img
                      src={DEFAULT_FALLBACK_IMAGE}
                      alt={meal.name}
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Soft scrim gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                  {/* Top-left: Category / Tag */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase backdrop-blur-xs shadow-xs ${
                        isSoldOut
                          ? 'bg-[#fee2e2] text-[#991b1b] border border-[#fecaca]'
                          : 'bg-[#fffdf8]/90 text-[#16342e]'
                      }`}
                    >
                      {isSoldOut ? 'Sold Out' : meal.tag}
                    </span>
                  </div>

                  {/* Top-right: Prep Time & Quick Info Icon */}
                  <div className="absolute top-3 right-3 flex items-center gap-1">
                    {meal.prepTimeMinutes && (
                      <span className="px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-semibold backdrop-blur-xs flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#d9f04a]" />
                        <span>{meal.prepTimeMinutes}m</span>
                      </span>
                    )}
                  </div>

                  {/* Bottom Image Overlay: Canteen Name & Macro Specs */}
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px] font-medium">
                    <span className="text-white/95 drop-shadow-xs font-semibold">
                      DGU Central Canteen
                    </span>
                    {meal.calories && (
                      <span className="text-[#d9f04a] text-[10px] font-semibold drop-shadow-xs">
                        {meal.calories} kcal · {meal.proteinGrams || 12}g protein
                      </span>
                    )}
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Title with Veg/Non-Veg FSSAI Icon */}
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* FSSAI Mark */}
                        <span
                          className={`w-3.5 h-3.5 border flex items-center justify-center rounded-[2px] shrink-0 ${
                            meal.dietaryType === 'non-veg'
                              ? 'border-[#dc2626]'
                              : meal.dietaryType === 'egg'
                              ? 'border-[#d97706]'
                              : 'border-[#16a34a]'
                          }`}
                          title={
                            meal.dietaryType === 'non-veg'
                              ? 'Non-Vegetarian'
                              : meal.dietaryType === 'egg'
                              ? 'Contains Egg'
                              : '100% Pure Vegetarian'
                          }
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              meal.dietaryType === 'non-veg'
                                ? 'bg-[#dc2626]'
                                : meal.dietaryType === 'egg'
                                ? 'bg-[#d97706]'
                                : 'bg-[#16a34a]'
                            }`}
                          />
                        </span>

                        <h3
                          onClick={() => setSelectedDish(meal)}
                          className="text-base font-bold text-[#16342e] leading-snug hover:text-[#126b55] cursor-pointer transition-colors"
                        >
                          {meal.name}
                        </h3>

                        {/* Interactive 'i' Info Icon with Tooltip and Toggle */}
                        <div className="relative inline-flex items-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedNutritionId(expandedNutritionId === meal.id ? null : meal.id);
                            }}
                            onMouseEnter={() => setHoveredInfoId(meal.id)}
                            onMouseLeave={() => setHoveredInfoId(null)}
                            aria-label={`Nutritional information for ${meal.name}`}
                            className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] font-serif italic font-bold transition-all ${
                              expandedNutritionId === meal.id
                                ? 'bg-[#126b55] text-white shadow-xs'
                                : 'bg-[#f0eee6] hover:bg-[#126b55] text-[#64736d] hover:text-white'
                            }`}
                            title="Hover or click for calories & allergens"
                          >
                            i
                          </button>

                          {/* Hover Floating Tooltip */}
                          {hoveredInfoId === meal.id && expandedNutritionId !== meal.id && (
                            <div className="absolute z-40 bottom-full mb-2.5 left-1/2 -translate-x-1/2 w-60 p-3 bg-[#16342e] text-[#fffdf8] rounded-lg shadow-2xl border border-[#d9f04a]/30 pointer-events-none text-left animate-in fade-in zoom-in-95 duration-150">
                              <div className="text-[10px] font-bold text-[#d9f04a] uppercase tracking-wider mb-1 flex items-center justify-between border-b border-white/15 pb-1">
                                <span>Nutrition & Allergens</span>
                                <span>{meal.calories || 380} kcal</span>
                              </div>
                              <div className="text-[11px] space-y-1">
                                <div className="flex justify-between text-white/90">
                                  <span>Protein:</span>
                                  <strong className="text-white font-semibold">{meal.proteinGrams || 14}g</strong>
                                </div>
                                <div className="flex justify-between text-white/90">
                                  <span>Prep time:</span>
                                  <span className="text-white/80">{meal.prepTimeMinutes || 5} mins</span>
                                </div>
                                <div className="pt-1 border-t border-white/10 text-[10px] text-[#c9ddd6] leading-snug">
                                  <strong className="text-[#d9f04a]">Allergens: </strong>
                                  <span>
                                    {meal.allergens && meal.allergens.length > 0
                                      ? meal.allergens.join(', ')
                                      : 'No common allergens (Allergen-free)'}
                                  </span>
                                </div>
                              </div>
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#16342e]" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center text-[11px] font-bold text-[#d97706] shrink-0">
                        <Star className="w-3 h-3 fill-[#f59e0b] stroke-[#d97706] mr-0.5" />
                        <span>{meal.rating || 4.8}</span>
                      </div>
                    </div>

                    {/* Short Description */}
                    {meal.description && (
                      <p className="text-xs text-[#64736d] line-clamp-2 leading-relaxed mb-2 mt-1">
                        {meal.description}
                      </p>
                    )}

                    {/* In-Card Expanded Nutrition Details */}
                    {expandedNutritionId === meal.id && (
                      <div className="my-2.5 p-3 bg-[#f0eee6] rounded-lg border border-[#d9ded5] text-xs space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="flex items-center justify-between font-bold text-[#16342e]">
                          <span className="flex items-center gap-1.5 text-xs">
                            <Flame className="w-3.5 h-3.5 text-[#f5a623]" />
                            <span>Nutritional & Allergen Info</span>
                          </span>
                          <span className="bg-[#126b55] text-white px-2 py-0.5 rounded text-[10px] font-bold">
                            {meal.calories || 380} kcal
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] text-[#64736d] bg-[#fffdf8] p-2 rounded border border-[#e4e6df]">
                          <div>
                            <span className="block text-[10px] text-[#8a9992] uppercase font-semibold">Protein</span>
                            <strong className="text-[#126b55] font-bold text-xs">{meal.proteinGrams || 14}g</strong>
                          </div>
                          <div>
                            <span className="block text-[10px] text-[#8a9992] uppercase font-semibold">Prep Time</span>
                            <strong className="text-[#16342e] font-bold text-xs">{meal.prepTimeMinutes || 5} mins</strong>
                          </div>
                        </div>

                        <div className="text-[11px] text-[#4b6259] pt-1 border-t border-[#e2e4dc]">
                          <strong className="text-[#16342e]">Allergens: </strong>
                          <span>
                            {meal.allergens && meal.allergens.length > 0
                              ? meal.allergens.join(', ')
                              : 'None listed (Allergen-free)'}
                          </span>
                        </div>

                        <div className="flex justify-between items-center pt-1 text-[10px]">
                          <button
                            type="button"
                            onClick={() => setSelectedDish(meal)}
                            className="font-bold text-[#126b55] hover:underline"
                          >
                            Full Dish Spotlight →
                          </button>
                          <button
                            type="button"
                            onClick={() => setExpandedNutritionId(null)}
                            className="text-[#8a9992] hover:text-[#16342e]"
                          >
                            Hide info
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Availability Status */}
                  <div className="text-[11px] mb-3 flex items-center justify-between">
                    {isSoldOut ? (
                      <span className="text-[#991b1b] font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Sold out for this slot</span>
                      </span>
                    ) : (
                      <span className="text-[#126b55] font-semibold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#126b55] animate-pulse" />
                        <span>{meal.available} portions ready today</span>
                      </span>
                    )}

                    <button
                      onClick={() => {
                        setExpandedNutritionId(expandedNutritionId === meal.id ? null : meal.id);
                      }}
                      className="text-[11px] text-[#64736d] hover:text-[#126b55] font-medium flex items-center gap-1"
                    >
                      <span>{expandedNutritionId === meal.id ? 'Hide info' : 'Nutrition'}</span>
                      <Info className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Bottom Row: Price & Add Button */}
                  <div className="pt-3 border-t border-[#f0eee6] flex items-center justify-between mt-auto">
                    <div>
                      <span className="text-[10px] text-[#64736d] block uppercase font-bold tracking-wider leading-none">
                        Campus Price
                      </span>
                      <span className="text-lg font-bold text-[#16342e] font-serif">
                        ₹{meal.price}
                      </span>
                    </div>

                    {inCartCount > 0 ? (
                      <div className="flex items-center gap-1 bg-[#16342e] text-white px-2.5 py-1 rounded-full text-xs shadow-xs">
                        <Check className="w-3.5 h-3.5 text-[#d9f04a]" />
                        <span className="font-bold">{inCartCount} in basket</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(meal.id)}
                        disabled={isSoldOut}
                        className={`px-3 py-1.5 rounded-md font-bold text-xs transition-all flex items-center gap-1.5 shadow-xs ${
                          isSoldOut
                            ? 'bg-[#e2e4dc] text-[#a4aca6] cursor-not-allowed'
                            : 'bg-[#126b55] hover:bg-[#0b4c3b] text-white active:scale-95'
                        }`}
                        title={isSoldOut ? 'Sold out' : 'Add to basket'}
                        aria-label={`Add ${meal.name} to basket`}
                      >
                        <Plus className="w-4 h-4 text-[#d9f04a]" />
                        <span>Add</span>
                      </button>
                    )}
                  </div>

                  {/* Vendor quick restock helper in vendor mode */}
                  {activeRole === 'vendor' && (
                    <div className="mt-3 pt-2 border-t border-dashed border-[#d9ded5] flex justify-between items-center text-[10px]">
                      <span className="text-[#64736d]">Stock: {meal.available}</span>
                      <button
                        onClick={() => restockMeal(meal.id, 5)}
                        className="text-[#126b55] font-bold underline hover:text-[#0b4c3b]"
                      >
                        +5 portions
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Verified Student Reviews & Social Proof */}
      <StudentReviews />

      {/* Dish Detail Modal */}
      <DishDetailModal
        meal={selectedDish}
        onClose={() => setSelectedDish(null)}
        onAddToCart={addToCart}
        isInCart={selectedDish ? getCartQuantity(selectedDish.id) > 0 : false}
        cartQuantity={selectedDish ? getCartQuantity(selectedDish.id) : 0}
      />
    </section>
  );
};
