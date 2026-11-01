import React from 'react';
import { MealItem } from '../types';
import { X, Star, Clock, Flame, ShieldCheck, Heart, Plus, Check } from 'lucide-react';

interface DishDetailModalProps {
  meal: MealItem | null;
  onClose: () => void;
  onAddToCart: (mealId: string) => void;
  isInCart: boolean;
  cartQuantity: number;
}

export const DishDetailModal: React.FC<DishDetailModalProps> = ({
  meal,
  onClose,
  onAddToCart,
  isInCart,
  cartQuantity
}) => {
  if (!meal) return null;

  const isSoldOut = meal.available <= 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#102a23]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#fffdf8] rounded-xl max-w-lg w-full overflow-hidden relative shadow-2xl border border-[#e4e6df] animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-3.5 top-3.5 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
          aria-label="Close details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Image */}
        <div className="h-56 sm:h-64 w-full relative overflow-hidden bg-[#e8dac5]">
          {meal.imageUrl ? (
            <img
              src={meal.imageUrl}
              alt={meal.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Graceful fallback to styled backdrop
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-7xl">
              {meal.emoji}
            </div>
          )}

          {/* Scrim Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          {/* Outlet & Category Badges */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs">
            <span className="font-semibold text-white/90 bg-black/40 px-2.5 py-1 rounded-md backdrop-blur-xs">
              {meal.vendorName}
            </span>
            <span className="bg-[#d9f04a] text-[#16342e] px-2.5 py-0.5 rounded font-bold uppercase tracking-wider text-[10px]">
              {meal.tag}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Title & Dietary marker */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {/* Standard FSSAI Indian Food Mark */}
                <span
                  className={`w-3.5 h-3.5 border flex items-center justify-center rounded-[2px] ${
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

                <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#16342e]">
                  {meal.name}
                </h3>
              </div>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-2 text-xs text-[#64736d]">
                <div className="flex items-center text-[#d97706] font-bold">
                  <Star className="w-3.5 h-3.5 fill-[#f59e0b] stroke-[#d97706] mr-1" />
                  <span>{meal.rating || 4.8}</span>
                </div>
                <span>·</span>
                <span>{meal.reviewCount || 180}+ campus reviews</span>
                <span>·</span>
                <span className="text-[#126b55] font-semibold">FSSAI Certified</span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-2xl font-serif font-bold text-[#16342e]">₹{meal.price}</span>
              <span className="text-[10px] text-[#64736d] block">Campus price</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#4b6259] leading-relaxed">
            {meal.description}
          </p>

          {/* Nutrition & Specs Strip */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-[#f7f4eb] rounded-lg border border-[#e4e6df] text-center text-xs">
            <div>
              <span className="text-[10px] text-[#64736d] block font-semibold">Energy</span>
              <strong className="text-sm font-bold text-[#16342e]">
                {meal.calories || 380} kcal
              </strong>
            </div>
            <div className="border-x border-[#d9ded5]">
              <span className="text-[10px] text-[#64736d] block font-semibold">Protein</span>
              <strong className="text-sm font-bold text-[#126b55]">
                {meal.proteinGrams || 14}g
              </strong>
            </div>
            <div>
              <span className="text-[10px] text-[#64736d] block font-semibold">Prep Time</span>
              <strong className="text-sm font-bold text-[#16342e]">
                {meal.prepTimeMinutes || 5} mins
              </strong>
            </div>
          </div>

          {/* Quality & Allergen Note */}
          <div className="space-y-1.5 text-xs text-[#64736d]">
            {meal.allergens && meal.allergens.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-[#16342e]">Allergen information:</span>
                <span>{meal.allergens.join(', ')}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-[#126b55]">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Prepared fresh daily at {meal.vendorName} using campus-audited ingredients.</span>
            </div>
          </div>

          {/* Add to Basket Action */}
          <div className="pt-2">
            <button
              onClick={() => {
                onAddToCart(meal.id);
                onClose();
              }}
              disabled={isSoldOut}
              className={`w-full py-3.5 rounded-md font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm ${
                isSoldOut
                  ? 'bg-[#d9ded5] text-[#8a9992] cursor-not-allowed'
                  : 'bg-[#126b55] hover:bg-[#0b4c3b] text-white active:scale-[0.99]'
              }`}
            >
              {isSoldOut ? (
                <span>Sold Out For Current Window</span>
              ) : isInCart ? (
                <>
                  <Check className="w-4 h-4 text-[#d9f04a]" />
                  <span>Added to Basket ({cartQuantity}x) · Add Another (₹{meal.price})</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-[#d9f04a]" />
                  <span>Add to Basket · ₹{meal.price}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
