import React, { useState, useMemo } from 'react';
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
  Info,
  Heart,
  SlidersHorizontal,
  Sliders
} from 'lucide-react';

const CATEGORIES: { id: MealCategory; label: string }[] = [
  { id: 'All Food', label: 'All Food' },
  { id: 'Breakfast', label: 'Breakfast' },
  { id: 'Lunch', label: 'Lunch' },
  { id: 'Dinner', label: 'Dinner' },
  { id: 'Snacks', label: 'Snacks' },
  { id: 'Quick Bites', label: 'Quick Bites' },
  { id: 'Vegetarian', label: 'Vegetarian' },
  { id: 'Non-Vegetarian', label: 'Non-Vegetarian' },
  { id: 'Beverages', label: 'Beverages' },
  { id: 'Desserts', label: 'Desserts' }
];

export const MenuSection: React.FC = () => {
  const {
    meals,
    addToCart,
    cart,
    favorites,
    toggleFavorite,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    canteenSchedule
  } = useApp();

  const [isPureVegOnly, setIsPureVegOnly] = useState<boolean>(false);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [priceRange, setPriceRange] = useState<'all' | 'under70' | '70to120' | 'above120'>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'price_low' | 'price_high' | 'prep_time'>('popular');
  const [selectedDish, setSelectedDish] = useState<MealItem | null>(null);

  // Daily Specials: Deluxe Student North Indian Thali & Rajma Rice Bowl
  const dailySpecials = useMemo(() => {
    return [
      meals.find((m) => m.id === '25') || meals[0],
      meals.find((m) => m.id === '1') || meals[1]
    ].filter(Boolean) as MealItem[];
  }, [meals]);

  const filteredMeals = useMemo(() => {
    return meals.filter((meal) => {
      // Pure Veg Filter
      if (isPureVegOnly && meal.dietaryType !== 'pure_veg' && meal.dietaryType !== 'veg' && meal.type !== 'veg') {
        return false;
      }

      // In Stock Filter
      if (inStockOnly && meal.available <= 0) {
        return false;
      }

      // Category filter (10 categories)
      if (selectedCategory !== 'All Food') {
        if (selectedCategory === 'Vegetarian') {
          if (meal.dietaryType !== 'pure_veg' && meal.dietaryType !== 'veg' && meal.type !== 'veg') return false;
        } else if (selectedCategory === 'Non-Vegetarian') {
          if (meal.dietaryType !== 'non_veg' && meal.dietaryType !== 'non-veg') return false;
        } else if (selectedCategory === 'Beverages') {
          if (meal.category !== 'Beverages' && meal.type !== 'drinks') return false;
        } else if (selectedCategory === 'Desserts') {
          if (meal.category !== 'Desserts' && !meal.name.toLowerCase().includes('dessert') && !meal.name.toLowerCase().includes('kheer')) return false;
        } else if (selectedCategory === 'Quick Bites') {
          if (meal.category !== 'Quick Bites' && meal.type !== 'quick') return false;
        } else if (selectedCategory === 'Snacks') {
          if (meal.category !== 'Snacks' && meal.type !== 'snacks') return false;
        } else if (selectedCategory === 'Breakfast') {
          if (meal.category !== 'Breakfast' && meal.type !== 'breakfast' && !meal.name.toLowerCase().includes('paratha') && !meal.name.toLowerCase().includes('bun maska')) return false;
        } else if (selectedCategory === 'Lunch') {
          if (meal.category !== 'Lunch' && meal.type !== 'combos' && !meal.name.toLowerCase().includes('thali') && !meal.name.toLowerCase().includes('chawal') && !meal.name.toLowerCase().includes('rice')) return false;
        } else if (selectedCategory === 'Dinner') {
          if (meal.category !== 'Dinner' && meal.type !== 'protein' && !meal.name.toLowerCase().includes('biryani') && !meal.name.toLowerCase().includes('roti') && !meal.name.toLowerCase().includes('paneer')) return false;
        }
      }

      // Price range
      if (priceRange === 'under70' && meal.price > 70) return false;
      if (priceRange === '70to120' && (meal.price < 70 || meal.price > 120)) return false;
      if (priceRange === 'above120' && meal.price <= 120) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = meal.name.toLowerCase().includes(q);
        const matchDesc = meal.description?.toLowerCase().includes(q) || false;
        const matchTag = meal.tag?.toLowerCase().includes(q) || false;
        const matchVendor = meal.vendorName?.toLowerCase().includes(q) || false;
        if (!matchName && !matchDesc && !matchTag && !matchVendor) return false;
      }

      return true;
    });
  }, [meals, isPureVegOnly, inStockOnly, selectedCategory, priceRange, searchQuery]);

  const sortedMeals = useMemo(() => {
    return [...filteredMeals].sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 4.8) - (a.rating || 4.8);
      if (sortBy === 'price_low') return a.price - b.price;
      if (sortBy === 'price_high') return b.price - a.price;
      if (sortBy === 'prep_time') return (a.prepTimeMinutes || 6) - (b.prepTimeMinutes || 6);
      return (b.reviewsCount || 50) - (a.reviewsCount || 50); // popularity default
    });
  }, [filteredMeals, sortBy]);

  const getCartQuantity = (mealId: string) => {
    const found = cart.find((item) => item.meal.id === mealId);
    return found ? found.quantity : 0;
  };

  return (
    <section id="menu" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      {/* Real-time Schedule Alert */}
      {!canteenSchedule.isOpen && (
        <div className="mb-8 p-4 bg-white border border-[#D94848]/30 rounded-2xl text-xs sm:text-sm text-[#252D28] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D94848] mt-1 shrink-0" />
            <div>
              <strong className="block font-bold text-sm text-[#D94848]">
                DGU Central Canteen is Currently Closed (Hours: 10:00 AM – 11:00 PM Everyday)
              </strong>
              <p className="text-xs text-[#737B74] mt-0.5">
                {canteenSchedule.timeRemainingText}. You can still reserve meals now; your order will be prioritized for pickup during the 10:00 AM morning batch!
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-[#FFF8E9] rounded-full border border-[#E7E9E3] font-bold text-xs text-[#174D36] whitespace-nowrap self-end sm:self-auto">
            Pre-Orders Active
          </span>
        </div>
      )}

      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E23744]/10 text-[#E23744] text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Campus Food Discovery · {meals.length} Fresh Verified Dishes</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-[#1C1917] font-heading">
            Campus Dining Menu
          </h2>
          <p className="text-xs sm:text-sm text-[#78716C] mt-1 max-w-xl">
            Order in advance, pay securely via UPI, and collect with your confirmed pickup token without long lines.
          </p>
        </div>

        {/* Search input */}
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search rajma, thali, momos, rolls..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#F2ECE4] rounded-xl text-xs sm:text-sm text-[#1C1917] placeholder-[#78716C] focus:outline-none focus:border-[#E23744] shadow-xs"
          />
        </div>
      </div>

      {/* 10 Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mb-6">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shadow-2xs ${
                isSelected
                  ? 'bg-[#E23744] text-white shadow-xs'
                  : 'bg-white text-[#78716C] hover:text-[#1C1917] border border-[#F2ECE4] hover:border-[#E23744]'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Filter and Sorting Control Strip */}
      <div className="p-3 sm:p-4 bg-white rounded-2xl border border-[#F2ECE4] shadow-xs mb-8 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Pure Veg Switch */}
          <button
            type="button"
            onClick={() => setIsPureVegOnly(!isPureVegOnly)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              isPureVegOnly
                ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold'
                : 'bg-[#FAF6F0] border-[#F2ECE4] text-[#78716C] hover:border-emerald-500'
            }`}
          >
            <span className="w-3.5 h-3.5 border border-[#16A34A] flex items-center justify-center rounded-[2px] bg-white">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
            </span>
            <span>Pure Veg Only</span>
          </button>

          {/* In Stock Only */}
          <button
            type="button"
            onClick={() => setInStockOnly(!inStockOnly)}
            className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              inStockOnly
                ? 'bg-[#E23744] text-white font-bold border-[#E23744]'
                : 'bg-[#FAF6F0] border-[#F2ECE4] text-[#78716C] hover:border-[#E23744]'
            }`}
          >
            In-Stock Only
          </button>

          {/* Price Range Pills */}
          <div className="flex items-center gap-1">
            <span className="text-[#78716C] ml-2 hidden sm:inline">Price:</span>
            {(['all', 'under70', '70to120', 'above120'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setPriceRange(r)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  priceRange === r
                    ? 'bg-[#E23744] text-white'
                    : 'bg-[#FAF6F0] text-[#78716C] border border-[#F2ECE4] hover:text-[#1C1917]'
                }`}
              >
                {r === 'all' ? 'All' : r === 'under70' ? '< ₹70' : r === '70to120' ? '₹70-₹120' : '> ₹120'}
              </button>
            ))}
          </div>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-[#78716C]">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 bg-[#FAF6F0] border border-[#F2ECE4] rounded-xl text-xs font-bold text-[#1C1917] focus:outline-none cursor-pointer"
          >
            <option value="popular">Popularity (Most Ordered)</option>
            <option value="rating">Top Rated ⭐</option>
            <option value="price_low">Price: Low to High 🏷️</option>
            <option value="price_high">Price: High to Low 🏷️</option>
            <option value="prep_time">Fastest Preparation ⏱️</option>
          </select>

          {(isPureVegOnly || inStockOnly || priceRange !== 'all' || searchQuery || selectedCategory !== 'All Food') && (
            <button
              onClick={() => {
                setIsPureVegOnly(false);
                setInStockOnly(false);
                setPriceRange('all');
                setSelectedCategory('All Food');
                setSearchQuery('');
              }}
              className="text-[11px] font-bold text-[#E23744] underline hover:text-[#CB202D] cursor-pointer ml-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* TODAY'S SPECIAL SHOWCASE */}
      {selectedCategory === 'All Food' && !searchQuery && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#E23744] uppercase tracking-wider">
                <Flame className="w-4 h-4 fill-[#E23744]" />
                <span>Today's Limited Canteen Specials</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#1C1917] font-heading mt-0.5">
                Chef's Handcrafted Batches
              </h3>
            </div>
            <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-100/80 px-3 py-1 rounded-full hidden sm:inline">
              Guaranteed &lt;7 min counter pickup
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {dailySpecials.map((special) => {
              const inCartCount = getCartQuantity(special.id);
              const isSoldOut = special.available <= 0;
              const isFav = favorites.includes(special.id);

              return (
                <div
                  key={`special-${special.id}`}
                  className="bg-white rounded-2xl overflow-hidden border border-[#F2ECE4] shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div
                    onClick={() => setSelectedDish(special)}
                    className="h-56 w-full relative overflow-hidden bg-[#FAF6F0] cursor-pointer"
                  >
                    <img
                      src={special.imageUrl}
                      alt={special.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.currentTarget.src = '/images/meals/thali_meal.jpg'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                    {/* Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#E23744] text-white text-[11px] font-bold uppercase tracking-wider shadow-xs">
                        {special.tag}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-semibold backdrop-blur-xs">
                        {special.available} left
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(special.id);
                      }}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#1C1917] flex items-center justify-center cursor-pointer shadow-md"
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-[#E23744] text-[#E23744]' : 'text-[#78716C]'}`} />
                    </button>

                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-[#FDE047] font-bold">
                          <Star className="w-3.5 h-3.5 fill-[#FDE047]" />
                          <span>{special.rating}</span>
                          <span className="text-white/80 font-normal">({special.reviewsCount || 180}+ reviews)</span>
                        </div>
                        <div className="text-[11px] text-white/90 mt-0.5">
                          {special.calories} kcal · {special.prepTimeMinutes}m prep
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-2xl font-bold text-[#FDE047] font-heading">
                          ₹{special.price}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 flex items-center justify-between gap-3">
                    <div>
                      <h4
                        onClick={() => setSelectedDish(special)}
                        className="font-bold text-base text-[#1C1917] hover:text-[#E23744] cursor-pointer"
                      >
                        {special.name}
                      </h4>
                      <p className="text-xs text-[#78716C] line-clamp-1 mt-0.5">
                        {special.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setSelectedDish(special)}
                        className="px-3 py-2 rounded-xl bg-[#FAF6F0] hover:bg-[#F2ECE4] text-[#1C1917] font-bold text-xs cursor-pointer border border-[#F2ECE4]"
                      >
                        Customize
                      </button>

                      {inCartCount > 0 ? (
                        <div className="px-3.5 py-2 rounded-xl bg-[#E23744] text-white font-bold text-xs flex items-center gap-1 shadow-xs">
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>{inCartCount} in Basket</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(special.id)}
                          disabled={isSoldOut}
                          className="px-4 py-2 rounded-xl bg-[#E23744] hover:bg-[#CB202D] text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5 text-white" />
                          <span>Add</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DISHES GRID */}
      {sortedMeals.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#F2ECE4] text-[#78716C] space-y-3">
          <p className="text-base font-semibold text-[#1C1917]">No campus dishes matched your active filters.</p>
          <button
            onClick={() => {
              setIsPureVegOnly(false);
              setInStockOnly(false);
              setPriceRange('all');
              setSelectedCategory('All Food');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-[#E23744] text-white font-bold text-xs cursor-pointer shadow-xs"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedMeals.map((meal) => {
            const inCartCount = getCartQuantity(meal.id);
            const isSoldOut = meal.available <= 0;
            const isFav = favorites.includes(meal.id);
            const isVeg = meal.dietaryType === 'pure_veg' || meal.dietaryType === 'veg' || meal.type === 'veg';

            return (
              <article
                key={meal.id}
                className="bg-white rounded-2xl overflow-hidden border border-[#F2ECE4] shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                {/* Image */}
                <div
                  onClick={() => setSelectedDish(meal)}
                  className="h-44 w-full relative overflow-hidden bg-[#FAF6F0] cursor-pointer"
                >
                  <img
                    src={meal.imageUrl}
                    alt={meal.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.currentTarget.src = '/images/meals/thali_meal.jpg'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

                  {/* Tag / Category */}
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold uppercase backdrop-blur-xs">
                    {meal.tag}
                  </span>

                  {/* Favorite button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(meal.id);
                    }}
                    className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-[#1C1917] flex items-center justify-center cursor-pointer shadow-sm transition-transform active:scale-90"
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-[#E23744] text-[#E23744]' : 'text-[#78716C]'}`} />
                  </button>

                  {/* Prep time & outlet */}
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px]">
                    <span className="font-semibold text-white/90">
                      {meal.vendorName}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-[#FDE047]">
                      <Clock className="w-3 h-3" />
                      {meal.prepTimeMinutes || 6}m prep
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {/* FSSAI indicator */}
                        <span
                          className={`w-3 h-3 border flex items-center justify-center rounded-[2px] shrink-0 ${
                            isVeg ? 'border-[#16A34A]' : 'border-[#DC2626]'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isVeg ? 'bg-[#16A34A]' : 'bg-[#DC2626]'
                            }`}
                          />
                        </span>

                        <h3
                          onClick={() => setSelectedDish(meal)}
                          className="font-bold text-sm text-[#1C1917] hover:text-[#E23744] cursor-pointer line-clamp-1"
                        >
                          {meal.name}
                        </h3>
                      </div>

                      <div className="flex items-center text-xs font-bold text-[#F59E0B] shrink-0">
                        <Star className="w-3 h-3 fill-[#F59E0B] mr-0.5" />
                        <span>{meal.rating || 4.8}</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#78716C] line-clamp-2 mt-1 leading-relaxed">
                      {meal.description}
                    </p>

                    <div className="text-[11px] text-[#78716C] mt-2 flex items-center justify-between">
                      <span>{meal.calories} kcal · {meal.proteinGrams || 12}g protein</span>
                      <span className={`font-semibold ${isSoldOut ? 'text-[#DC2626]' : 'text-emerald-700'}`}>
                        {isSoldOut ? 'Sold out' : `${meal.available} ready`}
                      </span>
                    </div>
                  </div>

                  {/* Actions & Price */}
                  <div className="pt-3 border-t border-[#F2ECE4] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#78716C] block uppercase font-bold">Campus Price</span>
                      <span className="text-lg font-bold text-[#E23744] font-heading">
                        ₹{meal.price}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedDish(meal)}
                        className="px-2.5 py-1.5 rounded-xl bg-[#FAF6F0] hover:bg-[#F2ECE4] text-[#1C1917] font-bold text-xs cursor-pointer border border-[#F2ECE4]"
                        title="Choose portions and add-ons"
                      >
                        Customize
                      </button>

                      {inCartCount > 0 ? (
                        <div className="px-3 py-1.5 rounded-xl bg-[#E23744] text-white text-xs font-bold flex items-center gap-1 shadow-xs">
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>{inCartCount}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(meal.id)}
                          disabled={isSoldOut}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer transition-all active:scale-95 ${
                            isSoldOut
                              ? 'bg-[#F2ECE4] text-[#78716C] cursor-not-allowed'
                              : 'bg-[#E23744] hover:bg-[#CB202D] text-white'
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5 text-white" />
                          <span>Add</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Verified Student Reviews Section */}
      <StudentReviews />

      {/* Dish Detail Modal */}
      <DishDetailModal
        meal={selectedDish}
        onClose={() => setSelectedDish(null)}
      />
    </section>
  );
};
