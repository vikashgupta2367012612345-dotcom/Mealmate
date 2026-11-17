import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  createRecaptchaVerifier,
  firebaseSendPhoneOtp,
  configurePersistence
} from '../firebase';
import {
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  User,
  KeyRound,
  Mail,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ChefHat,
  Building2,
  Home,
  Loader2,
  X,
  Info,
  Smartphone,
  Check,
  RotateCw,
  UtensilsCrossed,
  Flame,
  Star,
  MapPin,
  Copy
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const {
    loginUser,
    loginWithPhoneOtp,
    loginWithGoogle,
    rememberedCredentials,
    clearRememberedCredentials,
    savedDeviceEmails,
    removeSavedDeviceEmail,
    registerUser,
    forgotPassword,
    showToast
  } = useApp();

  // Mode: 'phone' (Swiggy/Zomato style) | 'email' | 'signup' | 'forgot'
  const [activeTab, setActiveTab] = useState<'phone' | 'email' | 'signup' | 'forgot'>('phone');

  // Remember credentials preference (reads saved setting so preference persists)
  const [rememberMe, setRememberMe] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('mm_remember_credentials');
      if (saved !== null) return saved === 'true';
      return Boolean(rememberedCredentials);
    } catch (e) {
      return false;
    }
  });

  // Phone / Real SMS OTP state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(30);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Email / Password inputs (prefilled with remembered email if saved)
  const [loginEmail, setLoginEmail] = useState(() => rememberedCredentials?.email || '');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Device email suggestions dropdown state & refs
  const [showEmailSuggestions, setShowEmailSuggestions] = useState(false);
  const emailDropdownRef = useRef<HTMLDivElement | null>(null);
  const loginPasswordRef = useRef<HTMLInputElement | null>(null);

  // Sign up inputs
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRollNo, setRegRollNo] = useState('');
  const [regHostel, setRegHostel] = useState('Mandakini Boys Hostel');
  const [regRole, setRegRole] = useState<'student' | 'vendor' | 'admin'>('student');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Forgot password inputs
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Loading & error states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [domainCopied, setDomainCopied] = useState(false);

  // Close email suggestions dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emailDropdownRef.current && !emailDropdownRef.current.contains(e.target as Node)) {
        setShowEmailSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Resend OTP countdown ticker
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOtpSent && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOtpSent, otpTimer]);

  /**
   * Handle user clicking "Sign in with Google"
   * - If the user previously signed in with Google on this device AND ticked "Remember login credentials",
   *   restore their verified session automatically in 1 click without re-prompting.
   * - Otherwise, launch real Firebase Google OAuth popup (select_account) so the user can choose
   *   any Google/Gmail account signed into their current device!
   */
  const handleGoogleSignInClick = async (forceAccountPicker = false) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsGoogleSubmitting(true);

    try {
      if (
        !forceAccountPicker &&
        rememberMe &&
        rememberedCredentials?.isGoogle &&
        rememberedCredentials?.email
      ) {
        const res = await loginWithGoogle({ email: rememberedCredentials.email }, true);
        if (!res.success) {
          setErrorMessage(res.error || 'Google Sign-In failed. Please try again.');
        }
      } else {
        const res = await loginWithGoogle(undefined, rememberMe);
        if (!res.success) {
          setErrorMessage(res.error || 'Google Sign-In failed. Please try again.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Google Sign-In encountered an error.');
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  // Compute filtered device email suggestions + smart domain completions
  const normalizedTypedEmail = loginEmail.trim().toLowerCase();
  const matchingDeviceEmails = savedDeviceEmails.filter(
    item => !normalizedTypedEmail || item.email.toLowerCase().includes(normalizedTypedEmail)
  );
  const domainCompletionSuggestions: string[] = (() => {
    if (!normalizedTypedEmail || normalizedTypedEmail.includes(' ')) return [];
    const commonDomains = ['gmail.com', 'dgu.ac.in'];
    if (!normalizedTypedEmail.includes('@')) {
      return commonDomains
        .map(d => `${normalizedTypedEmail}@${d}`)
        .filter(candidate => !savedDeviceEmails.some(s => s.email.toLowerCase() === candidate));
    }
    const [localPart, domainPart] = normalizedTypedEmail.split('@');
    if (localPart && domainPart !== undefined) {
      return commonDomains
        .filter(d => d.startsWith(domainPart) && d !== domainPart)
        .map(d => `${localPart}@${d}`)
        .filter(candidate => !savedDeviceEmails.some(s => s.email.toLowerCase() === candidate));
    }
    return [];
  })();

  const handleSelectEmailSuggestion = (selectedEmail: string) => {
    setLoginEmail(selectedEmail);
    setShowEmailSuggestions(false);
    setErrorMessage(null);
    setTimeout(() => {
      loginPasswordRef.current?.focus();
    }, 30);
  };

  /**
   * Request Real SMS OTP to user's phone number via Firebase Phone Auth
   */
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '').slice(-10);
    if (!cleanNumber || cleanNumber.length !== 10) {
      setErrorMessage('Please enter your 10-digit mobile number.');
      return;
    }

    setIsSendingOtp(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Clean up previous verifier if any to prevent already-rendered errors
      try {
        if ((window as any).recaptchaVerifier?.clear) {
          (window as any).recaptchaVerifier.clear();
        }
      } catch (e) {}
      (window as any).recaptchaVerifier = null;

      const verifier = createRecaptchaVerifier('recaptcha-container');
      (window as any).recaptchaVerifier = verifier;

      const formattedPhone = `+91${cleanNumber}`;
      const result = await firebaseSendPhoneOtp(formattedPhone, verifier, rememberMe);
      setConfirmationResult(result);
      setIsOtpSent(true);
      setOtpTimer(60);
      setOtpValues(['', '', '', '', '', '']); // Keep completely empty, no suggestions
      setSuccessMessage(`Real SMS verification code dispatched to +91 ${cleanNumber}. Please check your phone messages.`);
    } catch (err: any) {
      console.warn('Firebase Phone Auth send notice:', err?.code || err?.message);
      try {
        if ((window as any).recaptchaVerifier?.clear) {
          (window as any).recaptchaVerifier.clear();
        }
      } catch (e) {}
      (window as any).recaptchaVerifier = null;

      const code = err?.code || '';
      const rawMsg = err?.message || '';
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'current domain';

      if (code === 'auth/billing-not-enabled' || rawMsg.includes('billing-not-enabled')) {
        setErrorMessage(
          'Firebase requires a Blaze billing account to dispatch cellular SMS to real phone numbers. To use Phone Sign-In for FREE without credit card/billing: add your number under "Phone numbers for testing" in Firebase Console (Authentication > Sign-in method > Phone).'
        );
      } else if (code === 'auth/operation-not-allowed' || rawMsg.includes('operation-not-allowed')) {
        setErrorMessage(
          'Phone Sign-In is disabled in your Firebase project (mealmate-d6e7e). In Firebase Console > Authentication > Sign-in method, click "Phone", toggle "Enable", and click "Save".'
        );
      } else if (code === 'auth/unauthorized-domain' || rawMsg.includes('unauthorized-domain')) {
        setErrorMessage(
          `Domain not authorized in Firebase! In Firebase Console > Authentication > Settings > Authorized domains, add "${currentHost}".`
        );
      } else if (code === 'auth/invalid-phone-number') {
        setErrorMessage('Invalid mobile number. Please enter a valid 10-digit number.');
      } else if (code === 'auth/too-many-requests' || code === 'auth/quota-exceeded') {
        setErrorMessage('Daily SMS quota exceeded or too many attempts. Please try again later or sign in with University Email.');
      } else if (code === 'auth/captcha-check-failed' || code === 'auth/invalid-app-credential') {
        setErrorMessage('reCAPTCHA verification check failed. Please tap "Send One Time Password" again.');
      } else {
        setErrorMessage(`Firebase SMS Notice [${code || 'error'}]: ${rawMsg.replace('Firebase: ', '') || 'Could not send SMS verification code.'}`);
      }
    } finally {
      setIsSendingOtp(false);
    }
  };

  /**
   * Handle 6-digit OTP input change
   */
  const handleOtpBoxChange = (index: number, val: string) => {
    const char = val.slice(-1);
    if (char && !/^[0-9]$/.test(char)) return;

    const newOtp = [...otpValues];
    newOtp[index] = char;
    setOtpValues(newOtp);

    // Auto advance focus to next input
    if (char && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const newOtp = [...otpValues];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pasted[i] || '';
      }
      setOtpValues(newOtp);
      otpInputRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  /**
   * Verify Real Phone OTP and login
   */
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const code = otpValues.join('');
    if (code.length !== 6) {
      setErrorMessage('Please enter the 6-digit verification code received on your phone.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await loginWithPhoneOtp(phoneNumber, code, rememberMe, confirmationResult);
      if (!res.success) {
        setErrorMessage(res.error || 'OTP verification failed. Please enter the valid code received via SMS.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Verification encountered an error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle Email & Password Login Submit
   */
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMessage('Please enter your registered email address and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await loginUser(loginEmail.trim(), loginPassword, rememberMe);
      if (!res.success) {
        setErrorMessage(res.error || 'Authentication failed. Please verify your credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Unable to sign in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle Register Submit
   */
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!regName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!regEmail.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match. Please verify both fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await registerUser({
        name: regName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim() || undefined,
        rollNo: regRollNo.trim().toUpperCase(),
        hostelBlock: regHostel,
        role: regRole,
        password: regPassword,
        assignedVendor: regRole === 'vendor' ? 'DGU Central Canteen' : undefined,
        rememberMe
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Registration could not be completed.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle Forgot Password Submit
   */
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!forgotEmail.trim()) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await forgotPassword(forgotEmail.trim());
      if (res.success) {
        setForgotSubmitted(true);
        setSuccessMessage(`Password reset link sent to ${forgotEmail.trim()}. Please check your inbox.`);
      } else {
        setErrorMessage(res.error || 'Could not send reset email. Please verify the email address.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Password reset request failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex flex-col justify-between text-[#1C1917] font-sans selection:bg-[#E23744]/20">
      {/* Top Professional Food App Brand Bar */}
      <header className="bg-[#E23744] text-white px-4 sm:px-8 py-3.5 shadow-md border-b border-[#CB202D]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-white text-[#E23744] font-heading font-extrabold text-base flex items-center justify-center shadow-sm tracking-tight">
              MM
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-lg tracking-tight leading-tight">MealMate</span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] bg-white/15 text-white px-2 py-0.5 rounded-md font-medium">
                  <MapPin className="w-3 h-3 text-[#FDE047]" />
                  DBS Global University · Dehradun
                </span>
              </div>
              <p className="text-[11px] text-white/90 font-medium leading-none mt-0.5">
                Skip the queue, not the meal · Campus Food Ordering
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-white/15 text-white px-3 py-1 rounded-full border border-white/20 hidden md:flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#FDE047]" />
              Secure Campus Portal
            </span>
          </div>
        </div>
      </header>

      {/* Main Two-Column Showcase Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl shadow-2xl border border-[#F2ECE4] overflow-hidden my-auto">
          {/* LEFT COLUMN: Food Visual Storytelling */}
          <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-[#881337] via-[#B91C1C] to-[#E23744] text-white p-8 xl:p-10 flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-[#F59E0B]/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#EA580C]/25 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

            <div className="relative z-10 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/20 text-[#FDE047] text-xs font-bold tracking-wide uppercase border border-white/20 backdrop-blur-xs">
                <Flame className="w-3.5 h-3.5 text-[#FDE047]" />
                Fresh Canteen Pre-Orders
              </div>
              <h2 className="text-3xl xl:text-4xl font-heading font-black tracking-tight leading-tight">
                Order ahead, <br />
                <span className="text-[#FDE047]">skip the rush.</span>
              </h2>
              <p className="text-white/95 text-xs xl:text-sm leading-relaxed max-w-sm font-medium">
                Get piping hot meals prepared just in time for your pickup slot at DGU Central Canteen.
              </p>
            </div>

            {/* Center: Campus Food Collage */}
            <div className="relative z-10 my-6 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="group relative rounded-2xl overflow-hidden shadow-lg border border-white/20 aspect-4/3 bg-black/20">
                  <img
                    src="/images/meals/rajma_rice_bowl.jpg"
                    alt="Rajma Rice Bowl"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-2.5">
                    <span className="text-xs font-bold text-white leading-tight">Rajma Rice Bowl</span>
                    <span className="text-[10px] text-[#F3A64A] font-semibold">₹89 · Bestseller</span>
                  </div>
                </div>

                <div className="group relative rounded-2xl overflow-hidden shadow-lg border border-white/20 aspect-4/3 bg-black/20">
                  <img
                    src="/images/meals/chicken_biryani.jpg"
                    alt="Chicken Biryani"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-2.5">
                    <span className="text-xs font-bold text-white leading-tight">Chicken Biryani</span>
                    <span className="text-[10px] text-[#F3A64A] font-semibold">₹129 · Chef Special</span>
                  </div>
                </div>
              </div>

              {/* Social Proof */}
              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-[#F3A64A]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#F3A64A]" />
                    ))}
                    <span className="text-white font-bold ml-1">4.9</span>
                  </div>
                  <span className="text-[11px] text-white/70">1,200+ DGU Students</span>
                </div>
                <p className="text-[11px] text-white/85 italic leading-snug">
                  "Saved 25 mins between MBA lectures! My meal was fresh & ready right at Counter 2."
                </p>
                <div className="text-[10px] text-white/60 font-medium">
                  — Campus Canteen User, DBS Global University
                </div>
              </div>
            </div>

            {/* Bottom Perks */}
            <div className="relative z-10 pt-4 border-t border-white/15 grid grid-cols-3 gap-2 text-center text-[11px]">
              <div>
                <span className="font-bold text-white block">15 Min</span>
                <span className="text-white/60 text-[10px]">Avg Pickup</span>
              </div>
              <div className="border-x border-white/15">
                <span className="font-bold text-white block">100%</span>
                <span className="text-white/60 text-[10px]">Fresh Cooked</span>
              </div>
              <div>
                <span className="font-bold text-white block">Zero</span>
                <span className="text-white/60 text-[10px]">Queue Wait</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: The Auth Card */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
            <div>
              {/* Header Titles */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <UtensilsCrossed className="w-5 h-5 text-[#E23744]" />
                  <span className="text-xs font-bold text-[#E23744] uppercase tracking-wider">
                    DBS Global University Dining
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-heading font-black text-[#1C1917] tracking-tight">
                  {activeTab === 'phone' && 'Sign in to order food'}
                  {activeTab === 'email' && 'Campus ID Sign In'}
                  {activeTab === 'signup' && 'Create your food pass'}
                  {activeTab === 'forgot' && 'Reset your password'}
                </h1>
                <p className="text-xs text-[#78716C] mt-1">
                  {activeTab === 'phone' && 'Enter your 10-digit mobile number to receive an SMS verification code.'}
                  {activeTab === 'email' && 'Sign in with your registered university email address.'}
                  {activeTab === 'signup' && 'Register your university profile to order meals with confirmed pickup slots.'}
                  {activeTab === 'forgot' && 'Enter your registered email to receive a password reset link.'}
                </p>
              </div>

              {/* Segmented Auth Navigation Tabs */}
              {activeTab !== 'forgot' && (
                <div className="flex bg-[#FAF6F0] p-1 rounded-2xl border border-[#F2ECE4] mb-5 gap-1 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('phone');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      activeTab === 'phone'
                        ? 'bg-white text-[#E23744] shadow-xs'
                        : 'text-[#78716C] hover:text-[#1C1917]'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Phone OTP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('email');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      activeTab === 'email'
                        ? 'bg-white text-[#E23744] shadow-xs'
                        : 'text-[#78716C] hover:text-[#1C1917]'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email & Pass</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('signup');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      activeTab === 'signup'
                        ? 'bg-white text-[#E23744] shadow-xs'
                        : 'text-[#78716C] hover:text-[#1C1917]'
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>New Account</span>
                  </button>
                </div>
              )}

              {/* Status Alert Banners */}
              {errorMessage && (
                <div className="mb-4 space-y-2">
                  <div className="p-3.5 bg-rose-50 text-rose-800 rounded-2xl text-xs flex items-start gap-2.5 border border-rose-200 animate-in fade-in duration-150">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                    <div className="space-y-2 flex-1">
                      <div>
                        <span className="font-bold block">Authentication Notice</span>
                        <span className="font-normal block leading-relaxed">{errorMessage}</span>
                      </div>

                      {activeTab === 'email' && (errorMessage.includes('Incorrect password') || errorMessage.includes('No account')) && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setForgotEmail(loginEmail);
                              setActiveTab('forgot');
                              setErrorMessage(null);
                              setForgotSubmitted(false);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-[#E23744] font-bold text-[11px] hover:bg-rose-100/60 transition-colors cursor-pointer"
                          >
                            Reset Password
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRegEmail(loginEmail);
                              setActiveTab('signup');
                              setErrorMessage(null);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[#E23744] text-white font-bold text-[11px] hover:bg-[#CB202D] transition-colors cursor-pointer"
                          >
                            Create New Account{loginEmail ? ` (${loginEmail.split('@')[0]})` : ''}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Helper Card for Firebase Setup (Authorized Domains & Test Numbers) */}
                  {(errorMessage.includes('billing') || errorMessage.includes('authorized') || errorMessage.includes('domain')) && (
                    <div className="p-4 bg-[#FFF8E9] border border-[#F59E0B]/40 rounded-2xl text-xs text-[#1C1917] space-y-3 shadow-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-[#F59E0B]/20">
                        <span className="font-bold text-[#B45309] flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4" />
                          Firebase Console Setup Instructions
                        </span>
                        <span className="text-[10px] bg-[#F59E0B]/20 text-[#B45309] px-2 py-0.5 rounded-md font-bold">
                          100% Free
                        </span>
                      </div>

                      {/* Step A: Add Domain */}
                      <div className="space-y-1">
                        <div className="font-bold text-[#1C1917]">1. In your Firebase "Add domain" modal:</div>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 bg-white px-2.5 py-1.5 rounded-lg border border-[#E7E9E3] font-mono text-[11px] text-[#E23744] truncate select-all">
                            {typeof window !== 'undefined' ? window.location.hostname : 'ais-dev-ar3cmqai5auhtweaefdoel-956251413796.asia-southeast1.run.app'}
                          </code>
                          <button
                            type="button"
                            onClick={() => {
                              const host = typeof window !== 'undefined' ? window.location.hostname : '';
                              if (host && navigator.clipboard) {
                                navigator.clipboard.writeText(host);
                                setDomainCopied(true);
                                setTimeout(() => setDomainCopied(false), 2500);
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#E23744] hover:bg-[#CB202D] text-white font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0 transition-all"
                          >
                            {domainCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-[#FDE047]" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Domain</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Step B: Add Test Phone Number */}
                      <div className="space-y-1 pt-2 border-t border-[#F59E0B]/15">
                        <div className="font-bold text-[#1C1917]">2. To enable OTP without billing:</div>
                        <p className="text-[11px] text-[#78716C] leading-snug">
                          In Firebase Console → <strong>Authentication</strong> → <strong>Sign-in method</strong> → <strong>Phone</strong> → <strong>Phone numbers for testing</strong>:
                        </p>
                        <div className="bg-white p-2 rounded-lg border border-[#E7E9E3] font-mono text-[11px] text-[#1C1917] space-y-0.5">
                          <div>• Phone: <strong className="text-[#E23744]">+91 9506050449</strong></div>
                          <div>• Test SMS Code: <strong className="text-[#E23744]">123456</strong></div>
                        </div>
                        <p className="text-[10px] text-[#78716C] italic">
                          Click Save. You can then log in instantly with code 123456 at zero cost!
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {successMessage && (
                <div className="p-3 mb-4 bg-emerald-50 text-emerald-800 rounded-2xl text-xs flex items-center gap-2 border border-emerald-200 animate-in fade-in duration-150">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="font-medium">{successMessage}</span>
                </div>
              )}

              {/* ============================================================== */}
              {/* TAB 1: PHONE NUMBER & REAL SMS OTP                             */}
              {/* ============================================================== */}
              {activeTab === 'phone' && (
                <div className="space-y-4">
                  {!isOtpSent ? (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                          Mobile Number
                        </label>
                        <div className="flex items-center rounded-2xl bg-[#FAF6F0] border border-[#F2ECE4] overflow-hidden focus-within:border-[#E23744] focus-within:ring-2 focus-within:ring-[#E23744]/15 transition-all">
                          {/* Country Code Prefix */}
                          <div className="flex items-center gap-1.5 px-3 py-3 border-r border-[#F2ECE4] bg-[#f5ede1] text-xs font-bold text-[#1C1917] shrink-0 select-none">
                            <span className="text-sm">🇮🇳</span>
                            <span>+91</span>
                          </div>
                          {/* Number Input (Clean and empty by default) */}
                          <input
                            type="tel"
                            maxLength={10}
                            required
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                            placeholder="Enter 10-digit mobile number"
                            className="w-full px-3 py-3 text-xs sm:text-sm font-semibold bg-transparent text-[#1C1917] focus:outline-none tracking-wider"
                          />
                        </div>
                      </div>

                      {/* Remember Credentials Checkbox Toggle */}
                      <div className="p-3 rounded-2xl bg-[#FAF6F0] border border-[#F2ECE4]">
                        <label className="flex items-start gap-2.5 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => {
                              const val = e.target.checked;
                              setRememberMe(val);
                              configurePersistence(val);
                              try {
                                if (val) {
                                  localStorage.setItem('mm_remember_credentials', 'true');
                                } else {
                                  localStorage.removeItem('mm_remember_credentials');
                                  if (rememberedCredentials) clearRememberedCredentials();
                                }
                              } catch (err) {}
                            }}
                            className="mt-0.5 w-4 h-4 rounded text-[#E23744] border-[#F2ECE4] focus:ring-[#E23744] accent-[#E23744] cursor-pointer"
                          />
                          <div>
                            <span className="font-bold text-xs text-[#1C1917] block">
                              Remember login credentials on this device
                            </span>
                            <span className="text-[11px] text-[#78716C] block leading-snug">
                              {rememberMe
                                ? 'Session stays saved across browser refreshes on this device.'
                                : 'Session resets on reload. Google Sign-In will show your device accounts.'}
                            </span>
                          </div>
                        </label>
                      </div>

                      {/* Inline reCAPTCHA Widget Container */}
                      <div id="recaptcha-container" className="my-2 min-h-[1px] flex justify-center overflow-hidden" />

                      <button
                        type="submit"
                        disabled={isSendingOtp}
                        className="w-full py-3.5 rounded-2xl bg-[#E23744] hover:bg-[#CB202D] text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                      >
                        {isSendingOtp ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-[#FDE047]" />
                            <span>Sending Real SMS OTP via Firebase...</span>
                          </>
                        ) : (
                          <>
                            <span>Send One Time Password</span>
                            <ArrowRight className="w-4 h-4 text-[#FDE047]" />
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    /* OTP Verification Screen (Clean, strictly no suggestions) */
                    <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF6F0] border border-[#F2ECE4]">
                        <div>
                          <span className="text-[11px] text-[#78716C] block">Real SMS sent to</span>
                          <span className="font-bold text-xs text-[#E23744]">+91 {phoneNumber}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsOtpSent(false);
                            setConfirmationResult(null);
                            setErrorMessage(null);
                          }}
                          className="text-[11px] text-[#E23744] font-bold hover:underline cursor-pointer"
                        >
                          Change Number
                        </button>
                      </div>

                      {/* 6 Digit OTP Input Boxes (Empty, waiting for real SMS) */}
                      <div>
                        <label className="block text-xs font-bold text-[#1C1917] mb-2 text-center">
                          Enter 6-Digit SMS Code Received
                        </label>
                        <div className="flex justify-center gap-2 sm:gap-2.5" onPaste={handleOtpPaste}>
                          {otpValues.map((digit, idx) => (
                            <input
                              key={idx}
                              ref={(el) => { otpInputRefs.current[idx] = el; }}
                              type="text"
                              maxLength={1}
                              inputMode="numeric"
                              value={digit}
                              onChange={(e) => handleOtpBoxChange(idx, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                              className="w-10 sm:w-12 h-12 sm:h-14 text-center text-lg sm:text-xl font-bold rounded-2xl border border-[#F2ECE4] bg-[#FAF6F0] text-[#1C1917] focus:border-[#E23744] focus:ring-2 focus:ring-[#E23744]/20 focus:outline-none transition-all"
                            />
                          ))}
                        </div>
                      </div>

                      {/* Resend Timer */}
                      <div className="flex items-center justify-between text-xs text-[#78716C]">
                        <span>Didn't receive the SMS code?</span>
                        {otpTimer > 0 ? (
                          <span className="font-semibold text-[#1C1917]">Resend in {otpTimer}s</span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => handleSendOtp(e)}
                            className="font-bold text-[#E23744] hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <RotateCw className="w-3 h-3" />
                            Resend SMS OTP
                          </button>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3.5 rounded-2xl bg-[#E23744] hover:bg-[#CB202D] text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-[#FDE047]" />
                            <span>Verifying SMS Code...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 text-white" />
                            <span>Verify & Proceed to Food Menu</span>
                          </>
                        )}
                      </button>

                      {/* Carrier Delivery Guide & Fallback */}
                      <div className="p-3 bg-[#FAF6F0] border border-[#F2ECE4] rounded-2xl text-[11px] text-[#78716C] space-y-1.5 leading-relaxed">
                        <div className="flex items-center gap-1.5 font-bold text-[#E23744]">
                          <Info className="w-3.5 h-3.5 shrink-0" />
                          <span>SMS Delivery Notice</span>
                        </div>
                        <p>
                          • Real carrier SMS to Indian mobile numbers (+91) may take 1-2 minutes depending on your telecom operator (Jio, Airtel, Vi).
                        </p>
                        <p>
                          • If you configured this as a test number in Firebase Console, enter the 6-digit test code you assigned in the console (Firebase does not dispatch cellular SMS to testing numbers).
                        </p>
                        <div className="pt-1 border-t border-[#F2ECE4] flex justify-between items-center text-[10px]">
                          <span>Delayed SMS?</span>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('email');
                              setErrorMessage(null);
                              setSuccessMessage(null);
                            }}
                            className="font-bold text-[#E23744] hover:underline cursor-pointer"
                          >
                            Sign in with University Email instead
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Native Datalist for Browser Device Email Suggestions */}
              <datalist id="device-email-suggestions">
                {savedDeviceEmails.map(item => (
                  <option key={item.email} value={item.email}>
                    {item.name ? `${item.name} (${item.email})` : item.email}
                  </option>
                ))}
              </datalist>

              {/* ============================================================== */}
              {/* TAB 2: UNIVERSITY EMAIL & PASSWORD                             */}
              {/* ============================================================== */}
              {activeTab === 'email' && (
                <form onSubmit={handleLoginSubmit} autoComplete="on" className="space-y-3.5 text-xs">
                  <div ref={emailDropdownRef} className="relative">
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="login-email" className="block font-bold text-[#1C1917]">
                        Email Address
                      </label>
                      {savedDeviceEmails.length > 0 && (
                        <span className="text-[10px] font-semibold text-[#78716C]">
                          {savedDeviceEmails.length} saved on this device
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="login-email"
                        name="email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        list="device-email-suggestions"
                        required
                        value={loginEmail}
                        onFocus={() => setShowEmailSuggestions(true)}
                        onChange={(e) => {
                          setLoginEmail(e.target.value);
                          setShowEmailSuggestions(true);
                        }}
                        placeholder="Enter your registered email address"
                        className="w-full pl-9 pr-8 py-2.5 rounded-2xl bg-[#FAF6F0] border border-[#F2ECE4] text-[#1C1917] focus:border-[#E23744] focus:ring-2 focus:ring-[#E23744]/15 focus:outline-none"
                      />
                      {loginEmail && (
                        <button
                          type="button"
                          onClick={() => {
                            setLoginEmail('');
                            setShowEmailSuggestions(true);
                          }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#1C1917] p-0.5 cursor-pointer"
                          title="Clear email"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Smart Device Email Suggestions Dropdown */}
                    {showEmailSuggestions && (matchingDeviceEmails.length > 0 || domainCompletionSuggestions.length > 0) && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-white rounded-2xl border border-[#F2ECE4] shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                        {matchingDeviceEmails.length > 0 && (
                          <div>
                            <div className="px-3 py-1.5 bg-[#FAF6F0] border-b border-[#F2ECE4] text-[10px] font-bold text-[#78716C] uppercase tracking-wider flex items-center justify-between">
                              <span>Suggested Emails on This Device</span>
                              <span>Tap to fill</span>
                            </div>
                            <div className="max-h-44 overflow-y-auto divide-y divide-[#F2ECE4]/60">
                              {matchingDeviceEmails.map(item => (
                                <div
                                  key={item.email}
                                  className="flex items-center justify-between px-3 py-2 hover:bg-[#FFF8E9] transition-colors group"
                                >
                                  <button
                                    type="button"
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      handleSelectEmailSuggestion(item.email);
                                    }}
                                    className="flex-1 flex items-center gap-2.5 text-left cursor-pointer min-w-0"
                                  >
                                    <span className="w-7 h-7 rounded-full bg-[#E23744]/10 text-[#E23744] font-bold text-[11px] flex items-center justify-center shrink-0">
                                      {(item.name?.[0] || item.email[0]).toUpperCase()}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                      <div className="font-semibold text-[#1C1917] truncate">
                                        {item.email}
                                      </div>
                                      <div className="text-[10px] text-[#78716C] flex items-center gap-1.5">
                                        {item.name && <span className="truncate">{item.name}</span>}
                                        <span className="px-1.5 py-0.2 rounded bg-[#FAF6F0] border border-[#F2ECE4] text-[9px] font-bold text-[#78716C]">
                                          {item.provider === 'google' ? 'Google' : 'Campus ID'}
                                        </span>
                                      </div>
                                    </div>
                                  </button>
                                  <button
                                    type="button"
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      removeSavedDeviceEmail(item.email);
                                    }}
                                    className="p-1 text-[#78716C] hover:text-[#E23744] opacity-70 hover:opacity-100 cursor-pointer ml-1"
                                    title="Remove from suggestions"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {domainCompletionSuggestions.length > 0 && (
                          <div>
                            <div className="px-3 py-1 bg-[#FAF6F0] border-y border-[#F2ECE4] text-[10px] font-bold text-[#78716C] uppercase tracking-wider">
                              Quick Email Completion
                            </div>
                            <div className="p-1.5 flex flex-wrap gap-1.5">
                              {domainCompletionSuggestions.map(candidate => (
                                <button
                                  key={candidate}
                                  type="button"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleSelectEmailSuggestion(candidate);
                                  }}
                                  className="px-2.5 py-1 rounded-xl bg-[#FAF6F0] hover:bg-[#FFF8E9] border border-[#F2ECE4] hover:border-[#E23744]/40 text-[#1C1917] font-semibold text-[11px] transition-colors cursor-pointer"
                                >
                                  {candidate}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Quick-pick suggestion chips visible directly under email input */}
                    {savedDeviceEmails.length > 0 && !showEmailSuggestions && (
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold text-[#78716C]">Suggestions:</span>
                        {savedDeviceEmails.slice(0, 3).map(item => (
                          <button
                            key={item.email}
                            type="button"
                            onClick={() => handleSelectEmailSuggestion(item.email)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer flex items-center gap-1 ${
                              loginEmail.trim().toLowerCase() === item.email.toLowerCase()
                                ? 'bg-[#E23744] text-white border-[#E23744]'
                                : 'bg-[#FAF6F0] text-[#1C1917] border-[#F2ECE4] hover:border-[#E23744]/50 hover:bg-[#FFF8E9]'
                            }`}
                          >
                            <Mail className="w-3 h-3 shrink-0" />
                            <span className="max-w-[190px] truncate">{item.email}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="login-password" className="font-bold text-[#1C1917]">Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('forgot');
                          setForgotEmail(loginEmail);
                          setErrorMessage(null);
                          setSuccessMessage(null);
                          setForgotSubmitted(false);
                        }}
                        className="text-[#E23744] hover:underline font-semibold text-[11px] cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        ref={loginPasswordRef}
                        id="login-password"
                        name="password"
                        type={showLoginPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter account password"
                        className="w-full pl-9 pr-10 py-2.5 rounded-2xl bg-[#FAF6F0] border border-[#F2ECE4] text-[#1C1917] focus:border-[#E23744] focus:ring-2 focus:ring-[#E23744]/15 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#1C1917] cursor-pointer"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Credentials Checkbox */}
                  <div className="p-3 rounded-2xl bg-[#FAF6F0] border border-[#F2ECE4]">
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setRememberMe(val);
                          configurePersistence(val);
                          try {
                            if (val) {
                              localStorage.setItem('mm_remember_credentials', 'true');
                            } else {
                              localStorage.removeItem('mm_remember_credentials');
                              if (rememberedCredentials) clearRememberedCredentials();
                            }
                          } catch (err) {}
                        }}
                        className="mt-0.5 w-4 h-4 rounded text-[#E23744] border-[#F2ECE4] focus:ring-[#E23744] accent-[#E23744] cursor-pointer"
                      />
                      <div>
                        <span className="font-bold text-xs text-[#1C1917] block">
                          Remember login credentials on this device
                        </span>
                        <span className="text-[11px] text-[#78716C] block leading-snug">
                          {rememberMe
                            ? 'Session persists across browser refreshes on this device.'
                            : 'Session resets on reload. Google Sign-In will show your device accounts.'}
                        </span>
                      </div>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-2xl bg-[#E23744] hover:bg-[#CB202D] text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#FDE047]" />
                        <span>Verifying Firebase Credentials...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4 text-white" />
                        <span>Sign In to MealMate</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* ============================================================== */}
              {/* TAB 3: REGISTER NEW STUDENT ACCOUNT                            */}
              {/* ============================================================== */}
              {activeTab === 'signup' && (
                <form onSubmit={handleSignUpSubmit} autoComplete="on" className="space-y-3 text-xs">
                  <div>
                    <label htmlFor="register-name" className="block font-bold text-[#1C1917] mb-1">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="register-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-[#FAF6F0] border border-[#F2ECE4] text-[#1C1917] focus:border-[#E23744] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label htmlFor="register-email" className="block font-bold text-[#1C1917] mb-1">University / Personal Email</label>
                      <input
                        id="register-email"
                        name="email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="student@dgu.ac.in"
                        className="w-full px-3 py-2.5 rounded-2xl bg-[#FAF6F0] border border-[#F2ECE4] text-[#1C1917] focus:border-[#E23744] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="register-phone" className="block font-bold text-[#1C1917] mb-1">Mobile Number</label>
                      <input
                        id="register-phone"
                        name="tel"
                        type="tel"
                        autoComplete="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="10-digit number"
                        className="w-full px-3 py-2.5 rounded-2xl bg-[#FAF6F0] border border-[#F2ECE4] text-[#1C1917] focus:border-[#E23744] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-bold text-[#1C1917] mb-1">Roll / Student ID</label>
                      <input
                        type="text"
                        value={regRollNo}
                        onChange={(e) => setRegRollNo(e.target.value)}
                        placeholder="Enter roll number"
                        className="w-full px-3 py-2.5 rounded-2xl bg-[#FAF6F0] border border-[#F2ECE4] text-[#1C1917] focus:border-[#E23744] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#1C1917] mb-1">Hostel / Campus Block</label>
                      <select
                        value={regHostel}
                        onChange={(e) => setRegHostel(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-2xl bg-[#FAF6F0] border border-[#F2ECE4] text-[#1C1917] focus:border-[#E23744] focus:outline-none"
                      >
                        <option value="Mandakini Boys Hostel">Mandakini Boys Hostel</option>
                        <option value="Alaknanda Girls Hostel">Alaknanda Girls Hostel</option>
                        <option value="Bhagirathi Block">Bhagirathi Block</option>
                        <option value="Day Scholar / Faculty">Day Scholar / Faculty</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label htmlFor="register-password" className="block font-bold text-[#1C1917] mb-1">Password</label>
                      <input
                        id="register-password"
                        name="new-password"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full px-3 py-2.5 rounded-2xl bg-[#FAF6F0] border border-[#F2ECE4] text-[#1C1917] focus:border-[#E23744] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="register-confirm-password" className="block font-bold text-[#1C1917] mb-1">Confirm Password</label>
                      <input
                        id="register-confirm-password"
                        name="confirm-password"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full px-3 py-2.5 rounded-2xl bg-[#FAF6F0] border border-[#F2ECE4] text-[#1C1917] focus:border-[#E23744] focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-2xl bg-[#E23744] hover:bg-[#CB202D] text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#FDE047]" />
                        <span>Creating University Account...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 text-white" />
                        <span>Register Campus Profile</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* ============================================================== */}
              {/* TAB 4: FORGOT PASSWORD                                         */}
              {/* ============================================================== */}
              {activeTab === 'forgot' && (
                <form onSubmit={handleForgotSubmit} className="space-y-4 text-xs">
                  <div>
                    <label htmlFor="forgot-email" className="block font-bold text-[#1C1917] mb-1">
                      Your Registered Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="forgot-email"
                        name="email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        list="device-email-suggestions"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="Enter your registered email address"
                        className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-[#FAF6F0] border border-[#F2ECE4] text-[#1C1917] focus:border-[#E23744] focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-2xl bg-[#E23744] hover:bg-[#CB202D] text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#FDE047]" />
                        <span>Sending Reset Email...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 text-[#FDE047]" />
                        <span>Send Password Reset Link</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('email');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="w-full py-2.5 rounded-2xl border border-[#F2ECE4] bg-[#FAF6F0] text-[#1C1917] font-bold text-xs hover:bg-[#F2ECE4] transition-colors cursor-pointer"
                  >
                    Return to Sign In
                  </button>
                </form>
              )}

              {/* ------------------------------------------------------------- */}
              {/* GOOGLE SIGN IN OPTION                                         */}
              {/* ------------------------------------------------------------- */}
              {activeTab !== 'forgot' && (
                <div className="mt-5 pt-4 border-t border-[#F2ECE4] space-y-3">
                  <div className="relative flex items-center justify-center">
                    <div className="w-full border-t border-[#F2ECE4]" />
                    <span className="absolute bg-white px-3 text-[11px] font-bold text-[#78716C] uppercase tracking-wider">
                      or continue with
                    </span>
                  </div>

                  {/* Google Login Button */}
                  <button
                    type="button"
                    disabled={isGoogleSubmitting || isSubmitting}
                    onClick={() => handleGoogleSignInClick(false)}
                    className="w-full py-3.5 px-4 rounded-2xl border border-[#F2ECE4] bg-white hover:bg-[#FAF6F0] text-[#1C1917] font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all shadow-xs hover:shadow-md active:scale-[0.99] cursor-pointer disabled:opacity-60"
                  >
                    {isGoogleSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#E23744]" />
                        <span>Signing in with Google...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                        <span className="font-bold text-sm text-[#1C1917]">
                          {rememberMe && rememberedCredentials?.isGoogle && rememberedCredentials?.email
                            ? `Sign in with Google (${rememberedCredentials.email.split('@')[0]})`
                            : 'Sign in with Google'}
                        </span>
                      </>
                    )}
                  </button>

                  {(rememberMe || Boolean(rememberedCredentials)) && (
                    <div className="flex items-center justify-between px-2 pt-0.5 gap-2 flex-wrap">
                      <span className="text-[11px] font-medium text-[#78716C] flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                        {rememberedCredentials?.email
                          ? `Remembered: ${rememberedCredentials.email}`
                          : 'Credentials remembered on this device'}
                      </span>
                      <div className="flex items-center gap-3">
                        {rememberedCredentials?.isGoogle && (
                          <button
                            type="button"
                            disabled={isGoogleSubmitting}
                            onClick={() => handleGoogleSignInClick(true)}
                            className="text-[10px] text-[#E23744] hover:underline font-semibold cursor-pointer"
                          >
                            Switch Google account
                          </button>
                        )}
                        {rememberedCredentials && (
                          <button
                            type="button"
                            onClick={() => {
                              clearRememberedCredentials();
                              setRememberMe(false);
                            }}
                            className="text-[10px] text-[#DC2626] hover:underline font-semibold cursor-pointer"
                          >
                            Forget
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Legal Notice */}
            <div className="mt-6 pt-3 border-t border-[#E7E9E3]">
              <p className="text-[10px] text-[#737B74] text-center leading-relaxed">
                By continuing, you agree to DBS Global University's{' '}
                <span className="text-[#E23744] underline cursor-pointer">Terms of Service</span> and{' '}
                <span className="text-[#E23744] underline cursor-pointer">Privacy & Canteen Guidelines</span>.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-3 text-center text-xs text-[#737B74] border-t border-[#E7E9E3] bg-[#FFF8E9]">
        DBS Global University · MealMate Campus Pre-Ordering Platform · Dehradun
      </footer>
    </div>
  );
};
