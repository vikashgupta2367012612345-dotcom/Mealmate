import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  User,
  GraduationCap,
  Mail,
  Home,
  Heart,
  Clock,
  Gift,
  RotateCcw,
  Plus,
  MessageSquare,
  LogOut,
  CheckCircle2,
  Share2,
  Copy,
  Sparkles
} from 'lucide-react';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenMyOrders: () => void;
  onRepeatOrder?: (mealId: string) => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenMyOrders,
  onRepeatOrder
}) => {
  const {
    currentUser,
    meals,
    favorites,
    toggleFavorite,
    addToCart,
    logoutUser,
    orders,
    submitComplaint,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'favorites' | 'referrals' | 'support'>('profile');

  // Support ticket form
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketVendor, setTicketVendor] = useState('DGU Central Canteen');
  const [ticketMessage, setTicketMessage] = useState('');

  if (!isOpen) return null;

  const favMeals = meals.filter(m => favorites.includes(m.id));
  const myOrders = orders.filter(o => o.customerEmail === currentUser.email || o.customerRollNo === currentUser.rollNo);

  const handleCopyCode = () => {
    const code = `${(currentUser.rollNo || 'DGU').substring(0, 8)}-MM`;
    navigator.clipboard?.writeText(code);
    showToast(`Referral code "${code}" copied to clipboard! Share with classmates.`);
  };

  const handleAddFavoriteToCart = (mealId: string) => {
    addToCart(mealId);
    showToast('Added favourite dish to your basket!');
  };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      showToast('Please provide both subject and message for your feedback.');
      return;
    }
    submitComplaint({
      studentName: currentUser.name,
      studentRollNo: currentUser.rollNo || '0251MBA621',
      studentEmail: currentUser.email,
      vendorName: ticketVendor,
      subject: ticketSubject.trim(),
      message: ticketMessage.trim()
    });
    setTicketSubject('');
    setTicketMessage('');
    setActiveTab('profile');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#FFF8E9] rounded-2xl max-w-xl w-full border border-[#E7E9E3] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 bg-[#174D36] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F3A64A] text-[#174D36] flex items-center justify-center font-bold text-lg shadow-sm">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg font-heading">{currentUser.name}</h2>
              <p className="text-xs text-white/80 flex items-center gap-2">
                <span className="font-mono bg-white/20 px-2 py-0.5 rounded text-[11px]">
                  {currentUser.rollNo || '0251MBA621'}
                </span>
                <span>· DBS Global University</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-[#E7E9E3] bg-white px-5 pt-3 gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'profile'
                ? 'border-[#174D36] text-[#174D36]'
                : 'border-transparent text-[#737B74] hover:text-[#252D28]'
            }`}
          >
            Student Card
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`pb-3 px-2 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'favorites'
                ? 'border-[#174D36] text-[#174D36]'
                : 'border-transparent text-[#737B74] hover:text-[#252D28]'
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-[#D94848] text-[#D94848]" />
            <span>Favourites ({favorites.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('referrals')}
            className={`pb-3 px-2 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'referrals'
                ? 'border-[#174D36] text-[#174D36]'
                : 'border-transparent text-[#737B74] hover:text-[#252D28]'
            }`}
          >
            <Gift className="w-3.5 h-3.5 text-[#F3A64A]" />
            <span>Refer & Earn</span>
          </button>

          <button
            onClick={() => setActiveTab('support')}
            className={`pb-3 px-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'support'
                ? 'border-[#174D36] text-[#174D36]'
                : 'border-transparent text-[#737B74] hover:text-[#252D28]'
            }`}
          >
            Dining Grievance Desk
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* TAB: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-5 border border-[#E7E9E3] shadow-xs space-y-3">
                <h3 className="font-bold text-xs text-[#737B74] uppercase tracking-wide">
                  Verified Campus Credentials
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-[#FFF8E9] rounded-xl flex items-center gap-3">
                    <GraduationCap className="w-5 h-5 text-[#174D36] shrink-0" />
                    <div>
                      <span className="text-[10px] text-[#737B74] block">University Roll No</span>
                      <strong className="font-mono text-[#252D28] text-sm">
                        {currentUser.rollNo || '0251MBA621'}
                      </strong>
                    </div>
                  </div>

                  <div className="p-3 bg-[#FFF8E9] rounded-xl flex items-center gap-3">
                    <Mail className="w-5 h-5 text-[#174D36] shrink-0" />
                    <div className="overflow-hidden">
                      <span className="text-[10px] text-[#737B74] block">DGU Institutional Email</span>
                      <strong className="font-mono text-[#252D28] text-xs truncate block">
                        {currentUser.email || 'vikash.0251mba621@dgu.ac.in'}
                      </strong>
                    </div>
                  </div>

                  <div className="p-3 bg-[#FFF8E9] rounded-xl flex items-center gap-3">
                    <Home className="w-5 h-5 text-[#174D36] shrink-0" />
                    <div>
                      <span className="text-[10px] text-[#737B74] block">Campus Residence</span>
                      <strong className="text-[#252D28]">
                        {currentUser.hostelBlock || 'Mandakini Boys Hostel'}
                      </strong>
                    </div>
                  </div>

                  <div className="p-3 bg-[#FFF8E9] rounded-xl flex items-center gap-3">
                    <Clock className="w-5 h-5 text-[#27864B] shrink-0" />
                    <div>
                      <span className="text-[10px] text-[#737B74] block">Pre-orders Fulfilled</span>
                      <strong className="text-[#27864B] text-sm font-bold">
                        {myOrders.length} orders
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenMyOrders();
                  }}
                  className="flex-1 py-3 rounded-xl bg-[#174D36] hover:bg-[#0f3625] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Clock className="w-4 h-4 text-[#F3A64A]" />
                  <span>View Pickup Tokens & History</span>
                </button>

                <button
                  onClick={() => {
                    logoutUser();
                    onClose();
                  }}
                  className="px-4 py-3 rounded-xl bg-white border border-[#E7E9E3] hover:bg-[#FFF8E9] text-[#D94848] font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: FAVORITES */}
          {activeTab === 'favorites' && (
            <div className="space-y-3">
              {favMeals.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-[#E7E9E3] text-[#737B74]">
                  <Heart className="w-8 h-8 mx-auto text-[#737B74]/40 mb-2" />
                  <p className="text-xs">You haven't saved any dishes yet.</p>
                  <p className="text-[11px] text-[#737B74]/80 mt-1">
                    Click the heart icon on any canteen dish to save it here for instant 1-click re-ordering.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {favMeals.map(meal => (
                    <div
                      key={meal.id}
                      className="p-3 bg-white rounded-xl border border-[#E7E9E3] flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={meal.imageUrl}
                          alt={meal.name}
                          className="w-12 h-12 rounded-lg object-cover shrink-0"
                          onError={(e) => { e.currentTarget.src = '/images/meals/thali_meal.jpg'; }}
                        />
                        <div>
                          <h4 className="font-bold text-xs text-[#252D28]">{meal.name}</h4>
                          <span className="text-xs text-[#174D36] font-bold">₹{meal.price}</span>
                          <span className="text-[10px] text-[#737B74] block">{meal.vendorName}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAddFavoriteToCart(meal.id)}
                          className="px-3 py-1.5 rounded-lg bg-[#174D36] hover:bg-[#0f3625] text-white text-xs font-bold cursor-pointer flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Order</span>
                        </button>
                        <button
                          onClick={() => toggleFavorite(meal.id)}
                          className="p-1.5 rounded-lg text-[#D94848] hover:bg-[#D94848]/10 cursor-pointer"
                          title="Remove from favorites"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: REFERRALS */}
          {activeTab === 'referrals' && (
            <div className="bg-white rounded-2xl p-6 border border-[#E7E9E3] shadow-xs space-y-4">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#F3A64A]/20 text-[#174D36] flex items-center justify-center mx-auto">
                  <Gift className="w-6 h-6 text-[#174D36]" />
                </div>
                <h3 className="text-base font-bold text-[#174D36] font-heading">
                  Invite Classmates, Earn ₹50 Meal Credit
                </h3>
                <p className="text-xs text-[#737B74] max-w-sm mx-auto">
                  When your classmates use your code on their first order, they get 20% off and you receive ₹50 credited toward your next lunch!
                </p>
              </div>

              <div className="p-4 bg-[#FFF8E9] rounded-2xl border border-[#F3A64A]/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#737B74] font-semibold block uppercase">
                    Your Personal Referral Code
                  </span>
                  <span className="font-mono text-base font-bold text-[#174D36]">
                    {(currentUser.rollNo || 'DGU').substring(0, 8)}-MM
                  </span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="px-4 py-2 rounded-xl bg-[#174D36] hover:bg-[#0f3625] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center text-xs">
                <div className="p-3 bg-[#FFF8E9] rounded-xl border border-[#E7E9E3]">
                  <span className="text-[10px] text-[#737B74] block">Friends Joined</span>
                  <strong className="text-base font-bold text-[#174D36]">4 students</strong>
                </div>
                <div className="p-3 bg-[#FFF8E9] rounded-xl border border-[#E7E9E3]">
                  <span className="text-[10px] text-[#737B74] block">Credits Earned</span>
                  <strong className="text-base font-bold text-[#27864B]">₹200 Balance</strong>
                </div>
              </div>
            </div>
          )}

          {/* TAB: GRIEVANCE / SUPPORT DESK */}
          {activeTab === 'support' && (
            <div className="bg-white rounded-2xl p-6 border border-[#E7E9E3] shadow-xs space-y-4">
              <div>
                <h3 className="font-bold text-sm text-[#174D36] font-heading flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-[#F3A64A]" />
                  <span>Campus Dining Feedback & Grievance Desk</span>
                </h3>
                <p className="text-xs text-[#737B74] mt-1">
                  Report food quality issues, delayed pickup slots, or feedback directly to DGU Hospitality Administration.
                </p>
              </div>

              <form onSubmit={handleSubmitTicket} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-[#252D28] block mb-1">Outlet Concerned</label>
                  <select
                    value={ticketVendor}
                    onChange={(e) => setTicketVendor(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#FFF8E9] border border-[#E7E9E3] text-[#252D28] focus:border-[#174D36] focus:outline-none"
                  >
                    <option value="DGU Central Canteen">DGU Central Canteen</option>
                    <option value="Nescafe Student Kiosk">Nescafe Student Kiosk</option>
                    <option value="Campus Bakery & Patisserie">Campus Bakery & Patisserie</option>
                    <option value="Mandakini Night Canteen">Mandakini Night Canteen</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-[#252D28] block mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="e.g. Counter was crowded / Food was cold"
                    className="w-full p-2.5 rounded-xl bg-[#FFF8E9] border border-[#E7E9E3] text-[#252D28] focus:border-[#174D36] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#252D28] block mb-1">Details</label>
                  <textarea
                    rows={3}
                    required
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Provide specific details so we can investigate and address with the vendor..."
                    className="w-full p-2.5 rounded-xl bg-[#FFF8E9] border border-[#E7E9E3] text-[#252D28] focus:border-[#174D36] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#174D36] hover:bg-[#0f3625] text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  Submit Grievance to Administration
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
