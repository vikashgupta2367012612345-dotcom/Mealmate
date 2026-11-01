import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { VENTURE_BLUEPRINT } from '../data/initialData';
import {
  FileText,
  Calculator,
  PieChart,
  Calendar,
  Download,
  Upload,
  X,
  CheckCircle,
  HelpCircle,
  ExternalLink,
  Target
} from 'lucide-react';

interface VentureQuestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VentureQuestModal: React.FC<VentureQuestModalProps> = ({ isOpen, onClose }) => {
  const { exportBackup, importBackup, showToast, resetAllData } = useApp();
  const [activeTab, setActiveTab] = useState<'blueprint' | 'economics' | 'market' | 'roadmap' | 'backup'>('blueprint');

  // Interactive Unit Economics State
  const [avgMealPrice, setAvgMealPrice] = useState(120);
  const [commissionRate, setCommissionRate] = useState(10);
  const [variableCost, setVariableCost] = useState(3);
  const [monthlyFixedCost, setMonthlyFixedCost] = useState(25000);
  const [expectedCustomers, setExpectedCustomers] = useState(350);
  const [purchasesPerCustomer, setPurchasesPerCustomer] = useState(10);

  if (!isOpen) return null;

  // Real-time calculations
  const sellingPrice = Math.round((avgMealPrice * commissionRate) / 100);
  const contributionMargin = sellingPrice - variableCost;
  const contributionMarginPercent = sellingPrice > 0 ? Math.round((contributionMargin / sellingPrice) * 100) : 0;
  const expectedMonthlyUnits = expectedCustomers * purchasesPerCustomer;
  const expectedMonthlyRevenue = expectedMonthlyUnits * sellingPrice;
  const expectedMonthlyContribution = expectedMonthlyUnits * contributionMargin;
  const monthlyOperatingSurplus = expectedMonthlyContribution - monthlyFixedCost;
  const breakEvenUnits = contributionMargin > 0 ? Math.ceil(monthlyFixedCost / contributionMargin) : 0;
  const breakEvenCustomers = purchasesPerCustomer > 0 ? Math.ceil(breakEvenUnits / purchasesPerCustomer) : 0;

  const handleDownloadBackup = () => {
    const data = exportBackup();
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonStr);
    downloadAnchor.setAttribute('download', `MealMate_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Downloaded MealMate JSON backup file.');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        importBackup(json);
      } catch (err) {
        showToast('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#102a23]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-[#fffdf8] rounded-xl max-w-5xl w-full p-5 sm:p-8 relative shadow-2xl border border-[#e4e6df] max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#e4e6df] gap-3">
          <div>
            <div className="text-[11px] font-bold text-[#126b55] uppercase tracking-wider flex items-center gap-1.5">
              <span>DGU Venture Quest · DBS Global University</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#16342e]">
              MealMate Strategic Blueprint & Capstone
            </h2>
            <p className="text-xs text-[#64736d]">
              Student: <strong className="text-[#16342e]">Vikash Kumar Gupta</strong> (Roll: 0251MBA621) · MBA 2026
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f0eee6] hover:bg-[#e4e6df] text-[#16342e] flex items-center justify-center font-bold text-base self-end sm:self-auto"
          >
            ×
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto border-b border-[#e4e6df] text-xs font-semibold gap-4 pt-2">
          {[
            { id: 'blueprint', label: 'Consolidated Blueprint (Asgn 1)', icon: FileText },
            { id: 'economics', label: 'Interactive Unit Economics', icon: Calculator },
            { id: 'market', label: 'TAM / SAM / SOM', icon: PieChart },
            { id: 'roadmap', label: '30-Day Launch Sprint', icon: Calendar },
            { id: 'backup', label: 'Backup & JSON Sync', icon: Download }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-[#126b55] font-bold border-b-2 border-[#126b55]'
                    : 'text-[#64736d] hover:text-[#16342e]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto py-4">
          {/* TAB 1: BLUEPRINT */}
          {activeTab === 'blueprint' && (
            <div className="space-y-5 text-xs sm:text-sm text-[#16342e]">
              {/* Submission Notice Banner */}
              <div className="p-4 bg-[#e2ead1] rounded-lg border border-[#c2dc37] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-[10px] uppercase font-bold text-[#126b55]">
                    Assignment 1 & 2 Capstone Status
                  </div>
                  <strong className="text-sm font-serif text-[#16342e]">
                    Assignment 1 Complete · Assignment 2 Working Prototype Active
                  </strong>
                  <p className="text-xs text-[#4b6259]">
                    Verified across all 12 foundational missions on DGU Venture Quest platform.
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="inline-block bg-[#126b55] text-white px-3 py-1 rounded text-xs font-bold">
                    100% Validated Logic
                  </span>
                </div>
              </div>

              {/* Strategic Pillars Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#f7f4eb] rounded-lg border border-[#e4e6df] space-y-2">
                  <span className="text-[10px] font-bold text-[#126b55] uppercase">
                    1. Core Problem Solved
                  </span>
                  <p className="text-xs text-[#64736d] leading-relaxed">
                    Students lose time in queues and face uncertainty about whether preferred, affordable meals will be available when their classes end. Canteens lack reliable demand visibility, causing stock-outs, overproduction, slow service, and avoidable food waste.
                  </p>
                </div>

                <div className="p-4 bg-[#f7f4eb] rounded-lg border border-[#e4e6df] space-y-2">
                  <span className="text-[10px] font-bold text-[#126b55] uppercase">
                    2. Jobs To Be Done (JTBD)
                  </span>
                  <p className="text-xs text-[#64736d] leading-relaxed italic">
                    "When my classes leave only a short break and campus outlets are likely to be crowded, I want to pre-order a suitable, affordable meal for a confirmed pickup time, so that I can eat on time, stay within budget and return to class without uncertainty."
                  </p>
                </div>

                <div className="p-4 bg-[#f7f4eb] rounded-lg border border-[#e4e6df] space-y-2">
                  <span className="text-[10px] font-bold text-[#126b55] uppercase">
                    3. Formal Value Proposition
                  </span>
                  <p className="text-xs text-[#64736d] leading-relaxed">
                    For time-constrained DGU students who struggle with queues and uncertain meal availability, MealMate provides campus-priced meal pre-ordering with confirmed pickup slots, so they can eat on time, control spending and return to class without avoidable waiting.
                  </p>
                </div>

                <div className="p-4 bg-[#f7f4eb] rounded-lg border border-[#e4e6df] space-y-2">
                  <span className="text-[10px] font-bold text-[#126b55] uppercase">
                    4. Beachhead Customer Segment
                  </span>
                  <p className="text-xs text-[#64736d] leading-relaxed">
                    DGU students aged 20–27 who purchase at least four prepared meals per week and have meal breaks shorter than 45 minutes, beginning with hostel residents and first-year MBA cohorts.
                  </p>
                </div>
              </div>

              {/* Competitive Differentiation Matrix */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold uppercase text-[#126b55] tracking-wider block">
                  Competitive Landscape Matrix
                </span>
                <div className="overflow-x-auto border border-[#e4e6df] rounded-lg">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#f7f4eb] border-b border-[#e4e6df] text-[#64736d]">
                      <tr>
                        <th className="p-2.5">Alternative</th>
                        <th className="p-2.5">Type</th>
                        <th className="p-2.5">Price / Cost</th>
                        <th className="p-2.5">Primary Weakness</th>
                        <th className="p-2.5">MealMate Advantage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e4e6df]">
                      <tr>
                        <td className="p-2.5 font-bold">Swiggy / Zomato</td>
                        <td className="p-2.5 text-[#64736d]">Indirect Delivery</td>
                        <td className="p-2.5">₹80–₹250+ plus delivery charges</td>
                        <td className="p-2.5 text-[#991b1b]">High fees, long wait times, no campus canteen pickup</td>
                        <td className="p-2.5 text-[#166534] font-semibold">Campus pricing, ₹0 booking fee, 7 min pickup</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold">Walk-in Canteen</td>
                        <td className="p-2.5 text-[#64736d]">Status Quo</td>
                        <td className="p-2.5">₹60–₹150</td>
                        <td className="p-2.5 text-[#991b1b]">Unpredictable queues, sudden dish stock-outs</td>
                        <td className="p-2.5 text-[#166534] font-semibold">Guaranteed inventory & reserved pickup window</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold">WhatsApp Pre-order</td>
                        <td className="p-2.5 text-[#64736d]">Substitute</td>
                        <td className="p-2.5">₹80–₹150</td>
                        <td className="p-2.5 text-[#991b1b]">Chaotic messages, missed orders, no slot capping</td>
                        <td className="p-2.5 text-[#166534] font-semibold">Digital kitchen tokens & live demand balancing</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE UNIT ECONOMICS */}
          {activeTab === 'economics' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-[#16342e]">
                    Live Unit Economics & Financial Simulation
                  </h3>
                  <p className="text-xs text-[#64736d]">
                    Adjust business levers to simulate break-even volume and operating surplus.
                  </p>
                </div>
                <div className="flex gap-2 text-xs">
                  <button
                    onClick={() => {
                      setExpectedCustomers(150);
                      setPurchasesPerCustomer(6);
                    }}
                    className="px-2.5 py-1 bg-[#f0eee6] hover:bg-[#e4e6df] rounded font-medium"
                  >
                    Conservative
                  </button>
                  <button
                    onClick={() => {
                      setExpectedCustomers(350);
                      setPurchasesPerCustomer(10);
                    }}
                    className="px-2.5 py-1 bg-[#126b55] text-white rounded font-bold"
                  >
                    Base Plan
                  </button>
                  <button
                    onClick={() => {
                      setExpectedCustomers(800);
                      setPurchasesPerCustomer(12);
                    }}
                    className="px-2.5 py-1 bg-[#f0eee6] hover:bg-[#e4e6df] rounded font-medium"
                  >
                    Ambitious
                  </button>
                </div>
              </div>

              {/* Levers Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#f7f4eb] p-4 rounded-lg border border-[#e4e6df] text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span>Active Monthly Students</span>
                    <strong className="text-[#126b55]">{expectedCustomers}</strong>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="1000"
                    step="25"
                    value={expectedCustomers}
                    onChange={e => setExpectedCustomers(Number(e.target.value))}
                    className="w-full accent-[#126b55]"
                  />
                  <span className="text-[10px] text-[#64736d]">DGU beachhead target: 350 users</span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span>Purchases per Student / Month</span>
                    <strong className="text-[#126b55]">{purchasesPerCustomer} orders</strong>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="20"
                    step="1"
                    value={purchasesPerCustomer}
                    onChange={e => setPurchasesPerCustomer(Number(e.target.value))}
                    className="w-full accent-[#126b55]"
                  />
                  <span className="text-[10px] text-[#64736d]">Approx ~2.5 meals/week</span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span>Vendor Commission (%)</span>
                    <strong className="text-[#126b55]">{commissionRate}%</strong>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="20"
                    step="1"
                    value={commissionRate}
                    onChange={e => setCommissionRate(Number(e.target.value))}
                    className="w-full accent-[#126b55]"
                  />
                  <span className="text-[10px] text-[#64736d]">₹{sellingPrice} platform rev per ₹{avgMealPrice} meal</span>
                </div>
              </div>

              {/* Output Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-[#fffdf8] rounded-lg border border-[#e4e6df]">
                  <span className="text-[11px] text-[#64736d] block font-medium">Selling Price / Unit</span>
                  <div className="text-xl font-serif font-bold text-[#16342e]">₹{sellingPrice}</div>
                  <span className="text-[10px] text-[#64736d]">Per unit revenue realized</span>
                </div>

                <div className="p-3 bg-[#fffdf8] rounded-lg border border-[#e4e6df]">
                  <span className="text-[11px] text-[#64736d] block font-medium">Contribution Margin</span>
                  <div className="text-xl font-serif font-bold text-[#126b55]">₹{contributionMargin} ({contributionMarginPercent}%)</div>
                  <span className="text-[10px] text-[#64736d]">₹{sellingPrice} minus ₹{variableCost} variable</span>
                </div>

                <div className="p-3 bg-[#fffdf8] rounded-lg border border-[#e4e6df]">
                  <span className="text-[11px] text-[#64736d] block font-medium">Monthly Units</span>
                  <div className="text-xl font-serif font-bold text-[#16342e]">{expectedMonthlyUnits}</div>
                  <span className="text-[10px] text-[#64736d]">{expectedCustomers} users × {purchasesPerCustomer} orders</span>
                </div>

                <div className={`p-3 rounded-lg border ${monthlyOperatingSurplus >= 0 ? 'bg-[#dcfce7] border-[#bbf7d0]' : 'bg-[#fee2e2] border-[#fecaca]'}`}>
                  <span className="text-[11px] text-[#4b6259] block font-medium">Monthly Surplus / Deficit</span>
                  <div className={`text-xl font-serif font-bold ${monthlyOperatingSurplus >= 0 ? 'text-[#166534]' : 'text-[#991b1b]'}`}>
                    {monthlyOperatingSurplus >= 0 ? `+₹${monthlyOperatingSurplus.toLocaleString()}` : `-₹${Math.abs(monthlyOperatingSurplus).toLocaleString()}`}
                  </div>
                  <span className="text-[10px] text-[#4b6259]">After ₹{monthlyFixedCost.toLocaleString()} fixed costs</span>
                </div>
              </div>

              {/* Break-even Summary Card */}
              <div className="p-4 bg-[#f7f4eb] rounded-lg border border-[#d9ded5] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                <div>
                  <strong className="block text-sm font-bold text-[#16342e]">
                    Break-Even Threshold: {breakEvenUnits.toLocaleString()} units ({breakEvenCustomers} active students)
                  </strong>
                  <p className="text-xs text-[#64736d] mt-0.5">
                    Formula: Fixed Cost (₹{monthlyFixedCost.toLocaleString()}) / Contribution Margin (₹{contributionMargin})
                  </p>
                </div>
                <div className="bg-[#fffdf8] px-3.5 py-2 rounded-md border border-[#d9ded5] text-center">
                  <span className="text-[10px] text-[#64736d] uppercase font-bold block">Current Safety Margin</span>
                  <span className="text-base font-bold text-[#126b55]">
                    +{Math.max(0, expectedMonthlyUnits - breakEvenUnits)} units (+{Math.round(((expectedMonthlyUnits - breakEvenUnits) / breakEvenUnits) * 100)}%)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TAM / SAM / SOM */}
          {activeTab === 'market' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[#16342e]">
                  Market Sizing Breakdown (TAM / SAM / SOM)
                </h3>
                <p className="text-xs text-[#64736d]">
                  Derived from Mission 8 market size analysis for higher-education students in Dehradun & Uttarakhand.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-[#f7f4eb] rounded-lg border border-[#e4e6df] space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <strong className="text-sm font-serif text-[#16342e]">
                      TAM (Total Addressable Market)
                    </strong>
                    <span className="font-bold text-base text-[#126b55]">
                      4,00,000 students · ₹57,60,00,000
                    </span>
                  </div>
                  <p className="text-xs text-[#64736d]">
                    Planning estimate of 400,000 higher-education students in Uttarakhand (AISHE 2022–23 parliamentary baseline).
                  </p>
                </div>

                <div className="p-4 bg-[#f7f4eb] rounded-lg border border-[#e4e6df] space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <strong className="text-sm font-serif text-[#16342e]">
                      SAM (Serviceable Available Market)
                    </strong>
                    <span className="font-bold text-base text-[#126b55]">
                      40,000 students (10.0% of TAM) · ₹5,76,00,000
                    </span>
                  </div>
                  <p className="text-xs text-[#64736d]">
                    Working estimate across reachable Dehradun higher-education campus clusters and hostel networks.
                  </p>
                </div>

                <div className="p-4 bg-[#e2ead1] rounded-lg border border-[#c2dc37] space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <strong className="text-sm font-serif text-[#16342e]">
                      SOM (Serviceable Obtainable Market — 12 Months)
                    </strong>
                    <span className="font-bold text-base text-[#166534]">
                      4,200 students (10.5% of SAM) · ₹60,48,000
                    </span>
                  </div>
                  <p className="text-xs text-[#4b6259]">
                    4,200 obtainable active student accounts over 12 months, based on 350 active monthly students × ₹1,440 annual platform revenue.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 30-DAY ROADMAP */}
          {activeTab === 'roadmap' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[#16342e]">
                  30-Day Launch Sprint & Experiment Plan
                </h3>
                <p className="text-xs text-[#64736d]">
                  Four phased weekly sprints from research to pilot launch and data adjustment.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-4 bg-[#f7f4eb] rounded-lg border border-[#e4e6df] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#126b55]">Week 1: Prepare</span>
                    <span className="bg-[#fffdf8] px-2 py-0.5 rounded text-[10px] text-[#64736d] border border-[#d9ded5]">
                      Research & Menus
                    </span>
                  </div>
                  <p className="text-[#64736d]">
                    Interview 50 students, observe peak cafeteria queues, recruit Green Leaf Canteen and North Block Café, and digitize their menus.
                  </p>
                  <div className="text-[11px] font-semibold text-[#16342e]">
                    Target: 50 interviews, 2 pilot commitments, 100 waitlist sign-ups.
                  </div>
                </div>

                <div className="p-4 bg-[#f7f4eb] rounded-lg border border-[#e4e6df] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#126b55]">Week 2: Launch</span>
                    <span className="bg-[#fffdf8] px-2 py-0.5 rounded text-[10px] text-[#64736d] border border-[#d9ded5]">
                      Controlled Pilot
                    </span>
                  </div>
                  <p className="text-[#64736d]">
                    Launch five-day pre-order pilot with 50 activated students and capped pickup slots (12:30, 12:40, 12:50 PM).
                  </p>
                  <div className="text-[11px] font-semibold text-[#16342e]">
                    Target: 150 fulfilled orders, &gt;90% fulfillment, &lt;7m pickup wait.
                  </div>
                </div>

                <div className="p-4 bg-[#f7f4eb] rounded-lg border border-[#e4e6df] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#126b55]">Week 3: Measure</span>
                    <span className="bg-[#fffdf8] px-2 py-0.5 rounded text-[10px] text-[#64736d] border border-[#d9ded5]">
                      Repeat & Retention
                    </span>
                  </div>
                  <p className="text-[#64736d]">
                    Expand student cohort, test referral code MM-DGU20, analyze 7-day repeat rate, and measure channel CAC.
                  </p>
                  <div className="text-[11px] font-semibold text-[#16342e]">
                    Target: 150 active users, 500 cumulative orders, &gt;30% repeat rate.
                  </div>
                </div>

                <div className="p-4 bg-[#f7f4eb] rounded-lg border border-[#e4e6df] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#126b55]">Week 4: Learn & Adjust</span>
                    <span className="bg-[#fffdf8] px-2 py-0.5 rounded text-[10px] text-[#64736d] border border-[#d9ded5]">
                      Scale
                    </span>
                  </div>
                  <p className="text-[#64736d]">
                    Eliminate workflow bottlenecks, onboard South Square as 3rd partner outlet, and present verified Assignment 2 findings.
                  </p>
                  <div className="text-[11px] font-semibold text-[#16342e]">
                    Target: 250 active users, 1,000 orders, CAC &lt;₹60.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: BACKUP & JSON SYNC */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[#16342e]">
                  Data Backup & Venture Quest File Sync
                </h3>
                <p className="text-xs text-[#64736d]">
                  Export or import your full Venture Quest backup (compatible with MealMate_Backup_2026-09-30_fb1451f5.json).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 bg-[#f7f4eb] rounded-lg border border-[#e4e6df] space-y-3">
                  <strong className="text-sm font-bold text-[#16342e] flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-[#126b55]" />
                    <span>Export Application JSON</span>
                  </strong>
                  <p className="text-xs text-[#64736d]">
                    Downloads a complete snapshot of all menus, active orders, pickup slots, and venture blueprint data.
                  </p>
                  <button
                    onClick={handleDownloadBackup}
                    className="w-full py-2.5 bg-[#126b55] hover:bg-[#0b4c3b] text-white text-xs font-bold rounded-md flex items-center justify-center gap-2"
                  >
                    <span>Download Backup File</span>
                  </button>
                </div>

                <div className="p-5 bg-[#f7f4eb] rounded-lg border border-[#e4e6df] space-y-3">
                  <strong className="text-sm font-bold text-[#16342e] flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-[#126b55]" />
                    <span>Import JSON Backup</span>
                  </strong>
                  <p className="text-xs text-[#64736d]">
                    Upload any previous MealMate or DGU Venture Quest JSON export file to restore state.
                  </p>
                  <label className="w-full py-2.5 bg-[#fffdf8] hover:bg-[#f0eee6] border border-[#d9ded5] text-[#16342e] text-xs font-bold rounded-md flex items-center justify-center gap-2 cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-[#126b55]" />
                    <span>Select JSON File</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-[#e4e6df] flex justify-between items-center text-xs">
                <span className="text-[#64736d]">Need to reset to default campus seed data?</span>
                <button
                  onClick={resetAllData}
                  className="text-[#991b1b] font-bold hover:underline"
                >
                  Reset Demo State
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
