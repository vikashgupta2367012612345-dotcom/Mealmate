import React, { useState, useMemo } from 'react';
import { MealItem, SelectedAddOn } from '../types';
import { useApp } from '../context/AppContext';
import { X, Star, Clock, Flame, ShieldCheck, Heart, Plus, Check } from 'lucide-react';

interface DishDetailModalProps {
  meal: MealItem | null;
  onClose: () => void;
  onAddToCart?: (mealId: string) => void;
  isInCart?: boolean;
  cartQuantity?: number;
}

const DEFAULT_PORTIONS = [
  { name: 'Regular Portion', priceModifier: 0, desc: 'Standard canteen serving' },
  { name: 'Hungry / Large', priceModifier: 35, desc: '30% more quantity & sides' },
  { name: 'Mini / Light', priceModifier: -15, desc: 'Lighter serving for quick snack' }
];

const DEFAULT_ADDONS = [
  { id: 'extra-butter', name: 'Amul Butter Cube', price: 15 },
  { id: 'extra-raita', name: 'Fresh Mint Boondi Raita', price: 25 },
  { id: 'crispy-papad', name: 'Roasted Bikaneri Papad (2x)', price: 15 },
  { id: 'green-chutney', name: 'Extra Mint-Coriander Chutney', price: 10 }
];

export const DishDetailModal: React.FC<DishDetailModalProps> = ({
  meal,
  onClose
}) => {
  const { addToCart, favorites, toggleFavorite, cart } = useApp();

  const [selectedPortion, setSelectedPortion] = useState(DEFAULT_PORTIONS[0]);
  const [selectedAddOns, setSelectedAddOns] = useState<SelectedAddOn[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');

  if (!meal) return null;

  const isSoldOut = meal.available <= 0;
  const isFav = favorites.includes(meal.id);

  const existingInCart = cart.find(c => c.meal.id === meal.id);
  const cartQty = existingInCart ? existingInCart.quantity : 0;

  const addOnTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0);
  const finalUnitPrice = Math.max(10, meal.price + selectedPortion.priceModifier + addOnTotal);

  const handleToggleAddOn = (addon: { id: string; name: string; price: number }) => {
    setSelectedAddOns(prev => {
      const exists = prev.some(a => a.id === addon.id);
      if (exists) {
        return prev.filter(a => a.id !== addon.id);
      } else {
        return [...prev, addon];
      }
    });
  };

  const handleAdd = () => {
    addToCart(meal.id, {
      quantity: 1,
      portion: selectedPortion.name,
      extraPrice: selectedPortion.priceModifier + addOnTotal,
      selectedAddOns,
      specialInstructions: specialInstructions.trim() || undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#FFF8E9] rounded-2xl max-w-lg w-full overflow-hidden relative shadow-2xl border border-[#E7E9E3] animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-3.5 top-3.5 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Image */}
        <div className="h-52 sm:h-60 w-full relative overflow-hidden bg-[#e8dac5] shrink-0">
          <img
            src={meal.imageUrl || '/images/meals/thali_meal.jpg'}
            alt={meal.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.currentTarget;
              target.src = '/images/meals/thali_meal.jpg';
            }}
          />

          {/* Scrim Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

          {/* Badges on image */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs">
            <span className="font-semibold text-white/95 bg-[#174D36]/80 px-2.5 py-1 rounded-md backdrop-blur-xs flex items-center gap-1.5">
              <span>{meal.vendorName || 'DGU Central Canteen'}</span>
            </span>
            <span className="bg-[#F3A64A] text-[#174D36] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[11px] shadow-xs">
              {meal.tag}
            </span>
          </div>

          {/* Favorite button */}
          <button
            onClick={() => toggleFavorite(meal.id)}
            className="absolute left-3.5 top-3.5 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#174D36] flex items-center justify-center transition-transform active:scale-90 cursor-pointer shadow-md"
            title="Toggle favourite"
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-[#D94848] text-[#D94848]' : 'text-[#737B74]'}`} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* Title & Dietary marker */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {/* Standard FSSAI Indian Food Mark */}
                <span
                  className={`w-3.5 h-3.5 border flex items-center justify-center rounded-[2px] ${
                    meal.dietaryType === 'non_veg' || meal.dietaryType === 'non-veg'
                      ? 'border-[#D94848]'
                      : meal.dietaryType === 'egg'
                      ? 'border-[#F3A64A]'
                      : 'border-[#27864B]'
                  }`}
                  title={
                    meal.dietaryType === 'non_veg' || meal.dietaryType === 'non-veg'
                      ? 'Non-Vegetarian'
                      : meal.dietaryType === 'egg'
                      ? 'Contains Egg'
                      : '100% Pure Vegetarian'
                  }
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      meal.dietaryType === 'non_veg' || meal.dietaryType === 'non-veg'
                        ? 'bg-[#D94848]'
                        : meal.dietaryType === 'egg'
                        ? 'bg-[#F3A64A]'
                        : 'bg-[#27864B]'
                    }`}
                  />
                </span>

                <h3 className="text-xl sm:text-2xl font-bold text-[#174D36] font-heading">
                  {meal.name}
                </h3>
              </div>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-2 text-xs text-[#737B74]">
                <div className="flex items-center text-[#F3A64A] font-bold">
                  <Star className="w-3.5 h-3.5 fill-[#F3A64A] stroke-[#F3A64A] mr-1" />
                  <span>{meal.rating || 4.8}</span>
                </div>
                <span>·</span>
                <span>{meal.reviewsCount || 120}+ campus reviews</span>
                <span>·</span>
                <span className="text-[#27864B] font-semibold">FSSAI Certified</span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-2xl font-bold text-[#174D36] font-heading">₹{finalUnitPrice}</span>
              {selectedPortion.priceModifier !== 0 && (
                <span className="text-[11px] text-[#737B74] block">Base ₹{meal.price}</span>
              )}
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#252D28]/80 leading-relaxed">
            {meal.description}
          </p>

          {/* Nutrition & Specs Strip */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-white rounded-xl border border-[#E7E9E3] text-center text-xs shadow-xs">
            <div>
              <span className="text-[10px] text-[#737B74] block font-semibold">Calories</span>
              <strong className="text-sm font-bold text-[#252D28]">
                {meal.calories || 380} kcal
              </strong>
            </div>
            <div className="border-x border-[#E7E9E3]">
              <span className="text-[10px] text-[#737B74] block font-semibold">Protein</span>
              <strong className="text-sm font-bold text-[#27864B]">
                {meal.proteinGrams || 14}g
              </strong>
            </div>
            <div>
              <span className="text-[10px] text-[#737B74] block font-semibold">Prep Time</span>
              <strong className="text-sm font-bold text-[#174D36] flex items-center justify-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#F3A64A]" />
                {meal.prepTimeMinutes || 6} mins
              </strong>
            </div>
          </div>

          {/* Portion Customization */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#174D36] uppercase tracking-wide block">
              1. Choose Portion Size
            </label>
            <div className="grid grid-cols-3 gap-2">
              {DEFAULT_PORTIONS.map((portion) => {
                const isSelected = selectedPortion.name === portion.name;
                return (
                  <button
                    key={portion.name}
                    type="button"
                    onClick={() => setSelectedPortion(portion)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#174D36] bg-[#174D36]/10 shadow-xs'
                        : 'border-[#E7E9E3] bg-white hover:border-[#75A879]'
                    }`}
                  >
                    <div className="font-semibold text-xs text-[#252D28]">{portion.name}</div>
                    <div className="text-[10px] text-[#737B74] mt-0.5">
                      {portion.priceModifier > 0
                        ? `+₹${portion.priceModifier}`
                        : portion.priceModifier < 0
                        ? `-₹${Math.abs(portion.priceModifier)}`
                        : 'Standard'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add-ons Customization */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#174D36] uppercase tracking-wide block">
              2. Add-ons & Accompaniments (Optional)
            </label>
            <div className="space-y-1.5">
              {DEFAULT_ADDONS.map((addon) => {
                const isChecked = selectedAddOns.some(a => a.id === addon.id);
                return (
                  <label
                    key={addon.id}
                    onClick={() => handleToggleAddOn(addon)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                      isChecked
                        ? 'border-[#27864B] bg-[#27864B]/10'
                        : 'border-[#E7E9E3] bg-white hover:border-[#75A879]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                        isChecked ? 'bg-[#27864B] border-[#27864B] text-white' : 'border-[#737B74] bg-white'
                      }`}>
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                      <span className="font-medium text-[#252D28]">{addon.name}</span>
                    </div>
                    <span className="font-bold text-[#174D36]">+₹{addon.price}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Special Instructions */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#174D36] uppercase tracking-wide block">
              3. Cooking Instructions (Optional)
            </label>
            <input
              type="text"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Less spicy, extra crispy, no onion, green chili on side"
              className="w-full text-xs p-2.5 rounded-xl bg-white border border-[#E7E9E3] focus:border-[#174D36] focus:outline-none text-[#252D28]"
            />
          </div>

          {/* Canteen Freshness Note */}
          <div className="flex items-center gap-2 text-xs text-[#27864B] bg-[#27864B]/10 p-2.5 rounded-xl">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Prepared fresh upon order collection at DBS Global University Central Canteen.</span>
          </div>
        </div>

        {/* Footer Add to Basket Action */}
        <div className="p-4 bg-white border-t border-[#E7E9E3] shrink-0">
          <button
            onClick={handleAdd}
            disabled={isSoldOut}
            className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer ${
              isSoldOut
                ? 'bg-[#E7E9E3] text-[#737B74] cursor-not-allowed'
                : 'bg-[#174D36] hover:bg-[#0f3625] text-white active:scale-[0.99]'
            }`}
          >
            {isSoldOut ? (
              <span>Sold Out For Current Window</span>
            ) : cartQty > 0 ? (
              <>
                <Check className="w-4 h-4 text-[#F3A64A]" />
                <span>Add Custom Portion · ₹{finalUnitPrice} ({cartQty} in basket)</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 text-[#F3A64A]" />
                <span>Add to Basket · ₹{finalUnitPrice}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
