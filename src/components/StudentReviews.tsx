import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Star, CheckCircle, ThumbsUp, MessageSquare, Plus, X, Sparkles } from 'lucide-react';

interface Review {
  id: string;
  studentName: string;
  program: string;
  rollNo?: string;
  dishName: string;
  dishEmoji: string;
  vendorName: string;
  rating: number;
  comment: string;
  date: string;
  likes: number;
  userLiked?: boolean;
}

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    studentName: 'Ananya Sharma',
    program: 'MBA 1st Year · Hostel Block B',
    rollNo: '0251MBA104',
    dishName: 'Rajma rice bowl',
    dishEmoji: '🍛',
    vendorName: 'DGU Central Canteen',
    rating: 5,
    comment: 'Literally saved me between back-to-back Marketing and Finance lectures! Walked to DGU Central Canteen, showed token MM-39182, and my hot rajma bowl was packaged and ready. Zero wait.',
    date: 'Yesterday at 12:45 PM',
    likes: 42
  },
  {
    id: 'rev-2',
    studentName: 'Rohit Verma',
    program: 'BBA 2nd Year · Day Scholar',
    rollNo: '0241BBA088',
    dishName: 'Deluxe Student North Indian Thali',
    dishEmoji: '🍱',
    vendorName: 'DGU Central Canteen',
    rating: 5,
    comment: 'The paneer butter masala portion was super generous and the gulab jamun was still warm. For ₹115, you cannot find a better full meal combo anywhere in Dehradun.',
    date: '2 days ago',
    likes: 38
  },
  {
    id: 'rev-3',
    studentName: 'Priya Mehra',
    program: 'MBA 1st Year · Academic Block',
    rollNo: '0251MBA312',
    dishName: 'Cold coffee with Choco Drizzle',
    dishEmoji: '🥤',
    vendorName: 'DGU Central Canteen',
    rating: 5,
    comment: 'Thick, frosty, and not overly sweet. Ordering ahead for the 1:00 PM slot means skipping the huge 25-person crowd jamming the central counter.',
    date: '3 days ago',
    likes: 29
  },
  {
    id: 'rev-4',
    studentName: 'Kabir Nair',
    program: 'BA Mass Comm · 3rd Year',
    rollNo: '0231BMC045',
    dishName: 'Steamed Chicken Momos (8 pcs)',
    dishEmoji: '🥟',
    vendorName: 'DGU Central Canteen',
    rating: 5,
    comment: 'The fiery red garlic chutney is legendary. Steamed fresh, super juicy filling, and pickup slot reservation guarantees they don’t run out before you arrive.',
    date: '4 days ago',
    likes: 51
  },
  {
    id: 'rev-5',
    studentName: 'Tanvi Rastogi',
    program: 'M.Sc Biotech · Hostel Block A',
    rollNo: '0251MSC019',
    dishName: 'Paneer tikka wrap',
    dishEmoji: '🌯',
    vendorName: 'DGU Central Canteen',
    rating: 4,
    comment: 'Crispy whole-wheat paratha with lots of paneer and mint mayo. Extremely convenient to eat while walking to the library.',
    date: '5 days ago',
    likes: 19
  },
  {
    id: 'rev-6',
    studentName: 'Aman Deep Singh',
    program: 'MBA 2nd Year',
    rollNo: '0241MBA552',
    dishName: 'Adrak Masala Chai & 2 Samosas',
    dishEmoji: '☕',
    vendorName: 'DGU Central Canteen',
    rating: 5,
    comment: '₹45 evening snack bliss! Samosas were piping hot and flaky. Picked it up in literally 30 seconds between tutorials.',
    date: 'This week',
    likes: 33
  },
  {
    id: 'rev-7',
    studentName: 'Devansh Malhotra',
    program: 'B.Com Hons · Central regular',
    rollNo: '0231BCH114',
    dishName: 'Chole bhature',
    dishEmoji: '🥘',
    vendorName: 'DGU Central Canteen',
    rating: 5,
    comment: 'The bhaturas are huge, perfectly puffed, and golden with zero grease sogginess. Amritsari chole with pickled onions hits different during cold Dehradun mornings!',
    date: '3 days ago',
    likes: 47
  }
];

export const StudentReviews: React.FC = () => {
  const { currentUser, showToast } = useApp();
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isAddingReview, setIsAddingReview] = useState(false);

  // New review form state
  const [newDishName, setNewDishName] = useState('Rajma rice bowl');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');

  const filteredReviews = reviews.filter((r) => {
    if (selectedFilter === 'all') return true;
    return r.dishName.toLowerCase().includes(selectedFilter.toLowerCase());
  });

  const handleLike = (id: string) => {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const userLiked = !r.userLiked;
          return {
            ...r,
            userLiked,
            likes: userLiked ? r.likes + 1 : r.likes - 1
          };
        }
        return r;
      })
    );
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      studentName: currentUser.name || 'DGU Student',
      program: `${currentUser.rollNo || '0251MBA621'} · MBA Student`,
      rollNo: currentUser.rollNo || '0251MBA621',
      dishName: newDishName,
      dishEmoji: '🍽️',
      vendorName: 'DGU Central Canteen',
      rating: newRating,
      comment: newComment.trim(),
      date: 'Just now',
      likes: 1,
      userLiked: true
    };

    setReviews([newRev, ...reviews]);
    setNewComment('');
    setIsAddingReview(false);
    showToast('Your campus meal review has been posted!');
  };

  return (
    <div className="mt-16 pt-12 border-t border-[#e4e6df]">
      {/* Reviews Header & Scorecard */}
      <div className="bg-[#fffdf8] p-6 sm:p-8 rounded-2xl border border-[#e4e6df] shadow-xs mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="text-xs font-bold tracking-widest text-[#126b55] uppercase flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-[#126b55]" />
              <span>Verified Campus Social Proof</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#16342e]">
              Student Taste & Pickup Ratings
            </h3>
            <p className="text-xs sm:text-sm text-[#64736d] max-w-xl">
              Authentic feedback from DBS Global University hostel residents and day scholars who regularly pre-order meals.
            </p>
          </div>

          {/* Social Proof KPI Box */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 bg-[#f7f4eb] p-4 rounded-xl border border-[#d9ded5] shrink-0">
            <div>
              <div className="flex items-center gap-1 text-2xl font-serif font-bold text-[#16342e]">
                <span>4.9</span>
                <Star className="w-5 h-5 fill-[#f59e0b] stroke-[#d97706]" />
              </div>
              <span className="text-[11px] text-[#64736d] font-semibold block">Overall Rating</span>
            </div>

            <div className="h-9 w-px bg-[#d9ded5] hidden sm:block" />

            <div>
              <div className="text-2xl font-serif font-bold text-[#126b55]">
                1,240+
              </div>
              <span className="text-[11px] text-[#64736d] font-semibold block">Verified Orders</span>
            </div>

            <div className="h-9 w-px bg-[#d9ded5] hidden sm:block" />

            <div>
              <div className="text-2xl font-serif font-bold text-[#16342e]">
                96%
              </div>
              <span className="text-[11px] text-[#64736d] font-semibold block">Repeat Orders</span>
            </div>

            <button
              onClick={() => setIsAddingReview(!isAddingReview)}
              className="w-full sm:w-auto px-4 py-2 bg-[#16342e] hover:bg-[#0e241f] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-[#d9f04a]" />
              <span>{isAddingReview ? 'Close Form' : 'Write Review'}</span>
            </button>
          </div>
        </div>

        {/* Add Review Dialog */}
        {isAddingReview && (
          <form
            onSubmit={handleAddReview}
            className="mt-6 pt-6 border-t border-[#d9ded5] p-5 bg-[#f7f4eb] rounded-xl space-y-3 animate-in fade-in duration-200"
          >
            <div className="flex items-center justify-between">
              <strong className="text-xs uppercase font-bold text-[#126b55]">
                Share Your Meal & Pickup Experience
              </strong>
              <button
                type="button"
                onClick={() => setIsAddingReview(false)}
                className="text-[#64736d] hover:text-[#16342e]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#64736d] mb-1 font-semibold">Which dish did you enjoy?</label>
                <select
                  value={newDishName}
                  onChange={(e) => setNewDishName(e.target.value)}
                  className="w-full p-2 bg-white border border-[#d9ded5] rounded-md text-[#16342e]"
                >
                  <option value="Rajma rice bowl">Rajma rice bowl</option>
                  <option value="Chole bhature">Chole bhature</option>
                  <option value="Deluxe Student North Indian Thali">Deluxe Student North Indian Thali</option>
                  <option value="Cold coffee with Choco Drizzle">Cold coffee with Choco Drizzle</option>
                  <option value="Steamed Chicken Momos (8 pcs)">Steamed Chicken Momos (8 pcs)</option>
                  <option value="Paneer tikka wrap">Paneer tikka wrap</option>
                  <option value="Adrak Masala Chai & 2 Samosas">Adrak Masala Chai & 2 Samosas</option>
                </select>
              </div>

              <div>
                <label className="block text-[#64736d] mb-1 font-semibold">Your Rating</label>
                <div className="flex items-center gap-1.5 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewRating(star)}
                      className="p-1 text-[#d97706] hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= newRating
                            ? 'fill-[#f59e0b] stroke-[#d97706]'
                            : 'stroke-[#d9ded5] fill-none'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-[#16342e] ml-2">{newRating} of 5 Stars</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[#64736d] mb-1 font-semibold text-xs">
                Review Comments (Taste, packaging, punctuality)
              </label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                required
                rows={2}
                placeholder="How was the food temperature? Did your collection slot save you time?"
                className="w-full p-2.5 text-xs bg-white border border-[#d9ded5] rounded-md text-[#16342e] focus:outline-none focus:border-[#126b55]"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-[#126b55] text-white text-xs font-bold rounded-md hover:bg-[#0b4c3b]"
            >
              Post Verified Review
            </button>
          </form>
        )}
      </div>

      {/* Filter Tabs by Dish */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4 text-xs font-medium">
        <span className="text-[#64736d] mr-1 hidden sm:inline">Filter Reviews:</span>
        {[
          { id: 'all', label: 'All Reviews (7)' },
          { id: 'Chole', label: '🥘 Chole Bhature' },
          { id: 'Rajma', label: '🍛 Rajma Bowl' },
          { id: 'Thali', label: '🍱 Student Thali' },
          { id: 'Coffee', label: '🥤 Cold Coffee' },
          { id: 'Momos', label: '🥟 Steamed Momos' },
          { id: 'Wrap', label: '🌯 Paneer Wrap' },
          { id: 'Samosas', label: '☕ Chai & Samosas' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedFilter(item.id)}
            className={`px-3 py-1.5 rounded-full border transition-all whitespace-nowrap ${
              selectedFilter === item.id
                ? 'bg-[#16342e] text-[#d9f04a] font-bold border-[#16342e] shadow-xs'
                : 'bg-[#fffdf8] text-[#64736d] border-[#d9ded5] hover:text-[#16342e]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredReviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-[#fffdf8] p-5 rounded-xl border border-[#e4e6df] shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              {/* User Bar */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#126b55] text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {rev.studentName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-[#16342e] block leading-tight">
                      {rev.studentName}
                    </strong>
                    <span className="text-[10px] text-[#64736d] block">{rev.program}</span>
                  </div>
                </div>

                <div className="flex items-center text-[#d97706] text-xs font-bold shrink-0">
                  <Star className="w-3.5 h-3.5 fill-[#f59e0b] stroke-[#d97706] mr-0.5" />
                  <span>{rev.rating}.0</span>
                </div>
              </div>

              {/* Tagged Dish Badge */}
              <div className="mb-2.5 inline-flex items-center gap-1.5 bg-[#f7f4eb] px-2.5 py-1 rounded-md border border-[#e2ead1] text-[11px] text-[#16342e]">
                <span>{rev.dishEmoji}</span>
                <strong className="truncate font-semibold">{rev.dishName}</strong>
                <span className="text-[#8a9992]">· DGU Central Canteen</span>
              </div>

              {/* Comment */}
              <p className="text-xs text-[#4b6259] leading-relaxed mb-4">
                "{rev.comment}"
              </p>
            </div>

            {/* Footer with Verified Tag & Helpful Like */}
            <div className="pt-3 border-t border-[#f0eee6] flex items-center justify-between text-[11px] text-[#64736d]">
              <span className="flex items-center gap-1 text-[#126b55] font-semibold">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Verified DGU Order</span>
              </span>

              <button
                onClick={() => handleLike(rev.id)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${
                  rev.userLiked
                    ? 'text-[#126b55] bg-[#e2ead1] font-bold'
                    : 'text-[#64736d] hover:text-[#16342e]'
                }`}
                title="Helpful review"
              >
                <ThumbsUp className="w-3 h-3" />
                <span>{rev.likes}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
