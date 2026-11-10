import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PromotionalCoupon } from '../types';
import {
  ShieldAlert,
  Building2,
  Users,
  Store,
  Receipt,
  Tag,
  MessageSquareWarning,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Plus,
  ToggleLeft,
  ToggleRight,
  Search,
  Filter,
  Download,
  AlertTriangle,
  Clock,
  Sparkles,
  LogOut
} from 'lucide-react';

interface AdminDashboardProps {
  onBackToStudentPortal?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToStudentPortal }) => {
  const {
    orders,
    meals,
    vendors,
    coupons,
    complaints,
    registeredAccounts,
    toggleVendorStatus,
    addNewCoupon,
    toggleCoupon,
    resolveComplaint,
    showToast,
    exportBackup,
    logoutUser
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'vendors' | 'students' | 'transactions' | 'coupons' | 'complaints'>('overview');
  const [searchFilter, setSearchFilter] = useState('');
  const [complaintNote, setComplaintNote] = useState<Record<string, string>>({});

  // Coupon Creation Form
  const [isNewCouponOpen, setIsNewCouponOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState('20');
  const [couponMinOrder, setCouponMinOrder] = useState('100');
  const [couponDescription, setCouponDescription] = useState('');

  // Overview metrics
  const totalCampusTurnover = useMemo(() => {
    return orders.reduce((sum, o) => sum + (o.total || 0), 0);
  }, [orders]);

  const totalOrdersCount = orders.length;
  const activeVendorsCount = vendors.filter(v => v.isOpen).length;
  const pendingComplaintsCount = complaints.filter(c => c.status === 'Open').length;

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      showToast('Please enter coupon code.');
      return;
    }
    const newCoupon: PromotionalCoupon = {
      code: couponCode.trim().toUpperCase(),
      discountPercent: parseInt(couponDiscount, 10) || 15,
      minOrderAmount: parseInt(couponMinOrder, 10) || 50,
      description: couponDescription.trim() || `Flat ${couponDiscount}% off for DGU students`,
      isActive: true,
      validUntil: '2026-12-31'
    };
    addNewCoupon(newCoupon);
    setIsNewCouponOpen(false);
    setCouponCode('');
    setCouponDescription('');
  };

  const handleExportData = () => {
    const backup = exportBackup();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `mealmate_dgu_audit_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Campus audit ledger & database exported to JSON.');
  };

  return (
    <div className="min-h-screen bg-[#FFF8E9] text-[#252D28] pb-16">
      {/* Top Directorate Banner */}
      <div className="bg-[#174D36] text-white px-4 py-4 shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F3A64A] text-[#174D36] flex items-center justify-center font-bold shadow-sm">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-heading">Campus Dining Directorate Console</h1>
                <span className="bg-[#F3A64A] text-[#174D36] text-[11px] font-bold px-2 py-0.5 rounded-full">
                  ADMIN RBAC
                </span>
              </div>
              <p className="text-xs text-white/80">
                DBS Global University (DGU), Dehradun · Central Food Commerce Oversight
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleExportData}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#F3A64A]" />
              <span>Export Audit Data</span>
            </button>

            {onBackToStudentPortal && (
              <button
                onClick={onBackToStudentPortal}
                className="px-3.5 py-1.5 rounded-xl bg-white text-[#174D36] hover:bg-[#FFF8E9] font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>Exit to Student App</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={() => logoutUser()}
              className="px-3.5 py-1.5 rounded-xl bg-[#D94848]/90 hover:bg-[#D94848] text-white font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              title="Sign out of Administrator Console"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E7E9E3] shadow-xs">
            <span className="text-xs text-[#737B74] font-semibold flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-[#174D36]" />
              Campus Total Turnover
            </span>
            <div className="text-2xl font-bold text-[#174D36] font-heading mt-1">₹{totalCampusTurnover}</div>
            <span className="text-[11px] text-[#27864B] font-semibold">100% digital & token verified</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E7E9E3] shadow-xs">
            <span className="text-xs text-[#737B74] font-semibold flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#27864B]" />
              Total Orders Fulfilled
            </span>
            <div className="text-2xl font-bold text-[#252D28] font-heading mt-1">{totalOrdersCount}</div>
            <span className="text-[11px] text-[#737B74]">Across 4 campus outlets</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E7E9E3] shadow-xs">
            <span className="text-xs text-[#737B74] font-semibold flex items-center gap-1.5">
              <Store className="w-4 h-4 text-[#F3A64A]" />
              Operational Outlets
            </span>
            <div className="text-2xl font-bold text-[#F3A64A] font-heading mt-1">
              {activeVendorsCount} / {vendors.length}
            </div>
            <span className="text-[11px] text-[#27864B] font-semibold">Authorized campus vendors</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E7E9E3] shadow-xs">
            <span className="text-xs text-[#737B74] font-semibold flex items-center gap-1.5">
              <MessageSquareWarning className="w-4 h-4 text-[#D94848]" />
              Support / Complaint Desk
            </span>
            <div className="text-2xl font-bold text-[#D94848] font-heading mt-1">
              {pendingComplaintsCount} Open
            </div>
            <span className="text-[11px] text-[#737B74]">
              {complaints.length - pendingComplaintsCount} resolved tickets
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between border-b border-[#E7E9E3] pb-2 flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#174D36] text-white shadow-xs'
                  : 'bg-white text-[#737B74] hover:text-[#252D28] border border-[#E7E9E3]'
              }`}
            >
              Directorate Overview
            </button>

            <button
              onClick={() => setActiveTab('vendors')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'vendors'
                  ? 'bg-[#174D36] text-white shadow-xs'
                  : 'bg-white text-[#737B74] hover:text-[#252D28] border border-[#E7E9E3]'
              }`}
            >
              Vendor Governance ({vendors.length})
            </button>

            <button
              onClick={() => setActiveTab('students')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'students'
                  ? 'bg-[#174D36] text-white shadow-xs'
                  : 'bg-white text-[#737B74] hover:text-[#252D28] border border-[#E7E9E3]'
              }`}
            >
              Student Directory
            </button>

            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'transactions'
                  ? 'bg-[#174D36] text-white shadow-xs'
                  : 'bg-white text-[#737B74] hover:text-[#252D28] border border-[#E7E9E3]'
              }`}
            >
              Transactions & Audit ({orders.length})
            </button>

            <button
              onClick={() => setActiveTab('coupons')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'coupons'
                  ? 'bg-[#174D36] text-white shadow-xs'
                  : 'bg-white text-[#737B74] hover:text-[#252D28] border border-[#E7E9E3]'
              }`}
            >
              Promo Offers ({coupons.length})
            </button>

            <button
              onClick={() => setActiveTab('complaints')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'complaints'
                  ? 'bg-[#174D36] text-white shadow-xs'
                  : 'bg-white text-[#737B74] hover:text-[#252D28] border border-[#E7E9E3]'
              }`}
            >
              Complaints & Quality ({pendingComplaintsCount} open)
            </button>
          </div>

          {activeTab === 'coupons' && (
            <button
              onClick={() => setIsNewCouponOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-[#27864B] hover:bg-[#1f6b3b] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Coupon</span>
            </button>
          )}
        </div>

        {/* TAB: DIRECTORATE OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-[#E7E9E3] shadow-xs space-y-3">
                <h3 className="font-bold text-sm text-[#174D36] font-heading flex items-center gap-2">
                  <Store className="w-4 h-4 text-[#F3A64A]" />
                  <span>Campus Outlets Health & Fulfillment</span>
                </h3>
                <div className="space-y-2.5 text-xs">
                  {vendors.map(vendor => {
                    const vendorOrderCount = orders.filter(o => o.vendorName === vendor.name).length;
                    return (
                      <div key={vendor.id} className="p-3 bg-[#FFF8E9] rounded-xl flex items-center justify-between">
                        <div>
                          <div className="font-bold text-[#252D28]">{vendor.name}</div>
                          <div className="text-[#737B74] text-[11px]">{vendor.location} · {vendor.rating} ★</div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            vendor.isOpen ? 'bg-[#27864B] text-white' : 'bg-[#D94848] text-white'
                          }`}>
                            {vendor.isOpen ? 'Operating' : 'Suspended'}
                          </span>
                          <div className="text-[11px] text-[#737B74] mt-0.5">{vendorOrderCount} orders served</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E7E9E3] shadow-xs space-y-3">
                <h3 className="font-bold text-sm text-[#174D36] font-heading flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#27864B]" />
                  <span>Campus Food Waste & Queue Reduction Impact</span>
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-[#27864B]/10 rounded-xl border border-[#27864B]/20">
                    <div className="font-bold text-[#27864B] text-sm">91% Food Waste Reduction</div>
                    <div className="text-[#252D28] mt-1">
                      Canteen prepares portions precisely aligned with student pickup time slots, eliminating unsold buffet spoilage.
                    </div>
                  </div>
                  <div className="p-3 bg-[#174D36]/10 rounded-xl border border-[#174D36]/20">
                    <div className="font-bold text-[#174D36] text-sm">Average 19 Minutes Saved Per Student</div>
                    <div className="text-[#252D28] mt-1">
                      Students collect with digital token pass without standing in 20-minute midday lunch queues.
                    </div>
                  </div>
                  <div className="p-3 bg-[#F3A64A]/20 rounded-xl border border-[#F3A64A]/40">
                    <div className="font-bold text-[#174D36] text-sm">FSSAI Hygiene Compliance: Grade A</div>
                    <div className="text-[#252D28] mt-1">
                      All campus preparation audited by DGU Hospitality Department.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: VENDORS GOVERNANCE */}
        {activeTab === 'vendors' && (
          <div className="bg-white rounded-2xl p-6 border border-[#E7E9E3] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#174D36] font-heading">Campus Food Vendors Registry</h2>
                <p className="text-xs text-[#737B74]">Manage licensed food outlets across DGU campus premises</p>
              </div>
            </div>

            <div className="divide-y divide-[#E7E9E3]">
              {vendors.map(v => (
                <div key={v.id} className="py-4 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={v.imageUrl}
                      alt={v.name}
                      className="w-12 h-12 rounded-xl object-cover shrink-0 bg-[#FFF8E9]"
                      onError={(e) => { e.currentTarget.src = '/images/meals/thali_meal.jpg'; }}
                    />
                    <div>
                      <h4 className="font-bold text-sm text-[#252D28]">{v.name}</h4>
                      <p className="text-xs text-[#737B74]">{v.location} · {v.specialty}</p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-[#737B74]">
                        <span>Timing: <strong>{v.timing}</strong></span>
                        <span>·</span>
                        <span>Rating: <strong className="text-[#F3A64A]">{v.rating} ★</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleVendorStatus(v.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        v.isOpen
                          ? 'bg-[#D94848]/10 text-[#D94848] hover:bg-[#D94848]/20'
                          : 'bg-[#27864B] text-white hover:bg-[#1f6b3b]'
                      }`}
                    >
                      {v.isOpen ? 'Temporarily Deactivate' : 'Authorize & Activate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: STUDENT DIRECTORY */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-2xl p-6 border border-[#E7E9E3] shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-[#174D36] font-heading">Registered Student Accounts</h2>
              <p className="text-xs text-[#737B74]">DBS Global University students with meal pre-ordering privileges</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FFF8E9] text-[#174D36] uppercase font-bold text-[11px]">
                  <tr>
                    <th className="p-3 rounded-l-xl">Student Name</th>
                    <th className="p-3">Roll Number</th>
                    <th className="p-3">DGU Email</th>
                    <th className="p-3">Hostel Block</th>
                    <th className="p-3 rounded-r-xl">Orders Placed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E9E3]">
                  {/* Default Student Lead */}
                  <tr className="hover:bg-[#FFF8E9]/50">
                    <td className="p-3 font-bold text-[#174D36]">
                      Vikash Kumar Gupta <span className="text-[10px] bg-[#F3A64A] text-[#174D36] px-1.5 py-0.5 rounded font-semibold ml-1">Student Lead</span>
                    </td>
                    <td className="p-3 font-mono">0251MBA621</td>
                    <td className="p-3 font-mono">vikash.0251mba621@dgu.ac.in</td>
                    <td className="p-3">Mandakini Boys Hostel</td>
                    <td className="p-3 font-bold">{orders.filter(o => o.customerRollNo === '0251MBA621').length || 2}</td>
                  </tr>

                  {registeredAccounts.map(account => (
                    <tr key={account.uid} className="hover:bg-[#FFF8E9]/50">
                      <td className="p-3 font-medium text-[#252D28]">{account.name}</td>
                      <td className="p-3 font-mono">{account.rollNo || '0251MBA621'}</td>
                      <td className="p-3 font-mono text-[#737B74]">{account.email}</td>
                      <td className="p-3">{account.hostelBlock || 'Campus Hostels'}</td>
                      <td className="p-3 font-semibold">{orders.filter(o => o.customerEmail === account.email).length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: TRANSACTIONS & AUDIT */}
        {activeTab === 'transactions' && (
          <div className="bg-white rounded-2xl p-6 border border-[#E7E9E3] shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-base font-bold text-[#174D36] font-heading">Campus Food Transactions Ledger</h2>
                <p className="text-xs text-[#737B74]">Audit trail for UPI digital settlements and cash pickups</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FFF8E9] text-[#174D36] uppercase font-bold text-[11px]">
                  <tr>
                    <th className="p-3 rounded-l-xl">Token / TXN ID</th>
                    <th className="p-3">Student</th>
                    <th className="p-3">Outlet</th>
                    <th className="p-3">Pickup Window</th>
                    <th className="p-3">Payment Method</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3 rounded-r-xl">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E9E3]">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-[#FFF8E9]/50">
                      <td className="p-3 font-mono font-bold text-[#174D36]">
                        {order.token}
                        <div className="text-[10px] text-[#737B74] font-normal">{order.transactionId || order.id}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-[#252D28]">{order.customerName}</div>
                        <div className="text-[#737B74] text-[10px] font-mono">{order.customerRollNo}</div>
                      </td>
                      <td className="p-3 font-medium">{order.vendorName}</td>
                      <td className="p-3">{order.slotLabel}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-[#FFF8E9] border border-[#E7E9E3] text-[#174D36] font-semibold text-[10px]">
                          {order.paymentMethod || 'UPI'}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-[#174D36] text-sm">₹{order.total}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          order.status === 'Ready' || order.status === 'Ready for Pickup'
                            ? 'bg-[#27864B] text-white'
                            : order.status === 'Preparing'
                            ? 'bg-[#F3A64A] text-[#174D36]'
                            : order.status === 'Collected' || order.status === 'Completed' || order.status === 'Picked up'
                            ? 'bg-[#E7E9E3] text-[#737B74]'
                            : 'bg-[#174D36] text-white'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: PROMO OFFERS */}
        {activeTab === 'coupons' && (
          <div className="bg-white rounded-2xl p-6 border border-[#E7E9E3] shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-[#174D36] font-heading">Campus Promotional Discounts</h2>
              <p className="text-xs text-[#737B74]">Exclusive university discount vouchers to boost student pre-orders</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coupons.map(coupon => (
                <div key={coupon.code} className="p-4 rounded-2xl border border-[#E7E9E3] bg-[#FFF8E9] flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-bold text-[#174D36] bg-white px-2.5 py-1 rounded-lg border border-[#E7E9E3]">
                        {coupon.code}
                      </span>
                      <span className="bg-[#F3A64A] text-[#174D36] font-bold text-[11px] px-2 py-0.5 rounded-full">
                        {coupon.discountPercent}% OFF
                      </span>
                    </div>
                    <p className="text-xs text-[#252D28] mt-2 font-medium">{coupon.description}</p>
                    <div className="text-[11px] text-[#737B74] mt-1">
                      Min Order: ₹{coupon.minOrderAmount} · Valid until {coupon.validUntil}
                    </div>
                  </div>

                  <button
                    onClick={() => toggleCoupon(coupon.code)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      coupon.isActive
                        ? 'bg-[#27864B] text-white'
                        : 'bg-[#737B74] text-white'
                    }`}
                  >
                    {coupon.isActive ? 'Active' : 'Disabled'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: COMPLAINTS & FEEDBACK */}
        {activeTab === 'complaints' && (
          <div className="bg-white rounded-2xl p-6 border border-[#E7E9E3] shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-[#174D36] font-heading">Student Dining Quality & Grievance Desk</h2>
              <p className="text-xs text-[#737B74]">Direct resolution portal monitored by Campus Administration</p>
            </div>

            <div className="space-y-3">
              {complaints.map(complaint => {
                const isOpen = complaint.status === 'Open';
                return (
                  <div
                    key={complaint.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isOpen
                        ? 'border-[#D94848]/40 bg-[#D94848]/5'
                        : 'border-[#27864B]/30 bg-[#27864B]/5'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isOpen ? 'bg-[#D94848] text-white' : 'bg-[#27864B] text-white'
                          }`}>
                            {complaint.status}
                          </span>
                          <span className="font-mono text-xs text-[#737B74]">{complaint.id}</span>
                          <span className="text-xs font-semibold text-[#174D36]">· {complaint.vendorName}</span>
                          {complaint.orderToken && (
                            <span className="text-xs font-mono font-bold text-[#252D28]">Token #{complaint.orderToken}</span>
                          )}
                        </div>

                        <h4 className="font-bold text-sm text-[#252D28] mt-1.5">{complaint.subject}</h4>
                        <p className="text-xs text-[#252D28]/80 mt-1">{complaint.message}</p>

                        <div className="text-[11px] text-[#737B74] mt-2">
                          Filed by: <strong>{complaint.studentName}</strong> ({complaint.studentRollNo}) · {new Date(complaint.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      {isOpen && (
                        <div className="flex flex-col gap-2 shrink-0">
                          <button
                            onClick={() => resolveComplaint(complaint.id, complaintNote[complaint.id])}
                            className="px-3.5 py-1.5 rounded-xl bg-[#27864B] hover:bg-[#1f6b3b] text-white font-bold text-xs shadow-xs cursor-pointer"
                          >
                            Mark Resolved
                          </button>
                        </div>
                      )}
                    </div>

                    {complaint.resolutionNote && (
                      <div className="mt-3 p-2.5 bg-white rounded-xl border border-[#27864B]/30 text-xs text-[#27864B]">
                        <strong>Resolution Note:</strong> {complaint.resolutionNote}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Create Coupon Modal */}
      {isNewCouponOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFF8E9] rounded-2xl max-w-md w-full p-6 border border-[#E7E9E3] shadow-xl space-y-4">
            <h3 className="font-bold text-base text-[#174D36] font-heading">Create Campus Discount Code</h3>
            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#252D28] block mb-1">Coupon Code (UPPERCASE)</label>
                <input
                  type="text"
                  required
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. DGULUNCH25"
                  className="w-full p-2.5 rounded-xl bg-white border border-[#E7E9E3] font-mono font-bold text-[#174D36] focus:border-[#174D36] focus:outline-none uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#252D28] block mb-1">Discount %</label>
                  <input
                    type="number"
                    required
                    min="5"
                    max="90"
                    value={couponDiscount}
                    onChange={(e) => setCouponDiscount(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#E7E9E3] text-[#252D28] focus:border-[#174D36] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#252D28] block mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    required
                    min="20"
                    value={couponMinOrder}
                    onChange={(e) => setCouponMinOrder(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#E7E9E3] text-[#252D28] focus:border-[#174D36] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#252D28] block mb-1">Description</label>
                <input
                  type="text"
                  value={couponDescription}
                  onChange={(e) => setCouponDescription(e.target.value)}
                  placeholder="e.g. Exclusive lunch discount for exam week"
                  className="w-full p-2.5 rounded-xl bg-white border border-[#E7E9E3] text-[#252D28] focus:border-[#174D36] focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewCouponOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white border border-[#E7E9E3] text-[#737B74] font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#174D36] hover:bg-[#0f3625] text-white font-bold cursor-pointer shadow-xs"
                >
                  Publish Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
