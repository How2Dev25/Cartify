"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { routes } from "../../routes";

// ─── Types ───────────────────────────────────────────────────────────────────
interface FormData {
  photo: string | null;
  firstName: string;
  lastName: string;
  phone: string;
  birthDate: string;
  gender: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

const STEPS = [
  { id: 1, label: "Profile Photo", desc: "Add your picture" },
  { id: 2, label: "Personal Details", desc: "Tell us about you" },
  { id: 3, label: "Shipping Address", desc: "Where we deliver" },
  { id: 4, label: "Account Setup", desc: "Secure your account" },
];

const COUNTRIES = [
  "Philippines", "United States", "United Kingdom", "Canada", "Australia",
  "Singapore", "Japan", "South Korea", "Germany", "France", "Netherlands",
  "United Arab Emirates", "India", "Thailand", "Malaysia", "Indonesia",
];

const PH_PROVINCES = [
  "Metro Manila", "Cebu", "Davao", "Laguna", "Cavite", "Bulacan", "Pampanga",
  "Rizal", "Batangas", "Quezon", "Iloilo", "Zamboanga", "Cagayan de Oro",
  "General Santos", "Bacolod", "Baguio", "Albay", "Leyte", "Negros Occidental",
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [data, setData] = useState<FormData>({
    photo: null,
    firstName: "", lastName: "", phone: "", birthDate: "", gender: "",
    addressLine1: "", addressLine2: "", city: "", province: "", postalCode: "", country: "Philippines",
    email: "", password: "", confirmPassword: "", agreeTerms: false,
  });

  const set = (k: keyof FormData, v: string | boolean | null) =>
    setData((p) => ({ ...p, [k]: v }));

  const animateStep = (direction: "forward" | "back") => {
    const el = formRef.current;
    if (!el) return;
    const fromX = direction === "forward" ? 40 : -40;
    gsap.fromTo(el,
      { opacity: 0, x: fromX },
      { opacity: 1, x: 0, duration: 0.38, ease: "power3.out" }
    );
  };

  useEffect(() => {
    animateStep(direction);
  }, [step]);

  useEffect(() => {
    gsap.fromTo(".reg-left", { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.7, ease: "power3.out" });
    gsap.fromTo(".reg-right", { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.7, ease: "power3.out" });
  }, []);

  const handlePhoto = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => set("photo", e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (step === 2) {
      if (!data.firstName.trim()) e.firstName = "First name is required.";
      if (!data.lastName.trim()) e.lastName = "Last name is required.";
      if (!data.phone.trim()) e.phone = "Phone number is required.";
      if (!data.birthDate) e.birthDate = "Date of birth is required.";
      if (!data.gender) e.gender = "Please select a gender.";
    }
    if (step === 3) {
      if (!data.addressLine1.trim()) e.addressLine1 = "Address is required.";
      if (!data.city.trim()) e.city = "City is required.";
      if (!data.province.trim()) e.province = "Province / State is required.";
      if (!data.postalCode.trim()) e.postalCode = "Postal code is required.";
    }
    if (step === 4) {
      if (!data.email.trim() || !/\S+@\S+\.\S+/.test(data.email)) e.email = "A valid email is required.";
      if (data.password.length < 8) e.password = "Password must be at least 8 characters.";
      if (data.password !== data.confirmPassword) e.confirmPassword = "Passwords do not match.";
      if (!data.agreeTerms) e.agreeTerms = "You must agree to the terms.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validate()) return;
    if (step === 4) { handleSubmit(); return; }
    setDirection("forward");
    setStep((s) => s + 1);
  };
  
  const back = () => {
    setDirection("back");
    setStep((s) => s - 1);
    setErrors({});
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => router.push("/"), 1800);
  };

  const strength = (() => {
    const p = data.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#3b82f6", "#22c55e"][strength];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar */}
          <aside className="lg:col-span-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white shadow-xl">
            <Link href="/" className="inline-flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center border border-orange-500/30">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
              </div>
              <span className="text-xl font-bold">Cart<span className="text-orange-500">ify</span></span>
            </Link>

            <div className="space-y-4">
              {STEPS.map((s, i) => {
                const isActive = s.id === step;
                const isDone = s.id < step;
                return (
                  <div key={s.id}>
                    <div
                      className={`flex items-start gap-4 p-3 rounded-xl transition-all cursor-pointer ${
                        isActive ? 'bg-white/10' : isDone ? 'hover:bg-white/5' : ''
                      }`}
                      onClick={() => isDone && setStep(s.id)}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 transition-all ${
                        isDone ? 'bg-orange-500 text-white' : isActive ? 'border-2 border-orange-500 text-orange-500' : 'border-2 border-white/20 text-white/40'
                      }`}>
                        {isDone ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        ) : s.id}
                      </div>
                      <div>
                        <div className={`text-sm font-semibold ${isActive ? 'text-white' : isDone ? 'text-white/80' : 'text-white/40'}`}>
                          {s.label}
                        </div>
                        <div className="text-xs text-white/30">{s.desc}</div>
                      </div>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`ml-6 w-px h-6 ${isDone ? 'bg-orange-500' : 'bg-white/10'}`} />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-12 pt-8 border-t border-white/10">
              <p className="text-white/40 text-sm italic font-['Playfair_Display']">
                "Style is a way to say who you are without having to speak."
              </p>
              <p className="text-white/20 text-xs mt-3 uppercase tracking-wide">Rachel Zoe</p>
            </div>
          </aside>

          {/* Right Form Area */}
          <main className="lg:col-span-8 bg-white rounded-2xl shadow-xl p-8">
            <div ref={formRef}>
              
              {/* Step 1: Photo */}
              {step === 1 && !isSubmitting && (
                <>
                  <div className="mb-8">
                    <div className="text-orange-500 text-xs font-semibold uppercase tracking-wide mb-2">Step 1 of 4</div>
                    <h2 className="text-2xl font-bold text-gray-900 font-['Playfair_Display']">Add a profile photo</h2>
                    <p className="text-gray-500 text-sm mt-1">Put a face to your name — you can always change this later.</p>
                  </div>

                  {data.photo ? (
                    <div className="flex flex-col items-center py-8">
                      <img src={data.photo} alt="Profile preview" className="w-32 h-32 rounded-full object-cover border-4 border-orange-500 shadow-lg" />
                      <div className="flex gap-3 mt-6">
                        <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-orange-500 hover:text-orange-500 transition" onClick={() => fileInputRef.current?.click()}>
                          Change photo
                        </button>
                        <button className="px-4 py-2 text-gray-500 text-sm hover:text-red-500 transition" onClick={() => set("photo", null)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition ${
                        dragOver ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-orange-400'
                      }`}
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                        const f = e.dataTransfer.files[0];
                        if (f) handlePhoto(f);
                      }}
                    >
                      <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.6">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                      </div>
                      <p className="font-semibold text-gray-900 mb-1">Drop your photo here</p>
                      <p className="text-sm text-gray-500">or click to browse<br/>JPG, PNG, WEBP up to 5 MB</p>
                    </div>
                  )}

                  <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhoto(f); }} />

                  <div className="text-center mt-6">
                    <button className="text-gray-500 text-sm hover:text-orange-500 transition" onClick={next}>Skip for now</button>
                  </div>
                </>
              )}

              {/* Step 2: Personal Details */}
              {step === 2 && !isSubmitting && (
                <>
                  <div className="mb-8">
                    <div className="text-orange-500 text-xs font-semibold uppercase tracking-wide mb-2">Step 2 of 4</div>
                    <h2 className="text-2xl font-bold text-gray-900 font-['Playfair_Display']">Personal details</h2>
                    <p className="text-gray-500 text-sm mt-1">We need a few basics to personalise your experience.</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">First name</label>
                      <input className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-orange-500 text-gray-900 placeholder-gray-400 ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Enter your first name"
                        value={data.firstName} onChange={(e) => set("firstName", e.target.value)} />
                      {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Last name</label>
                      <input className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-orange-500 text-gray-900 placeholder-gray-400 ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Enter your last name"
                        value={data.lastName} onChange={(e) => set("lastName", e.target.value)} />
                      {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Phone number</label>
                    <input className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-orange-500 text-gray-900 placeholder-gray-400 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="+63 912 345 6789" value={data.phone} onChange={(e) => set("phone", e.target.value)} />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Date of birth</label>
                    <input type="date" className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-orange-500 text-gray-900 ${errors.birthDate ? 'border-red-500' : 'border-gray-300'}`}
                      value={data.birthDate} onChange={(e) => set("birthDate", e.target.value)} />
                    {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate}</p>}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                    <div className="flex flex-wrap gap-3">
                      {["Male", "Female", "Non-binary", "Prefer not to say"].map((g) => (
                        <button key={g} type="button"
                          className={`px-4 py-2 rounded-lg border transition font-medium ${data.gender === g ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-300 text-gray-700 hover:border-orange-300'}`}
                          onClick={() => set("gender", g)}>
                          {g}
                        </button>
                      ))}
                    </div>
                    {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                  </div>
                </>
              )}

              {/* Step 3: Shipping Address */}
              {step === 3 && !isSubmitting && (
                <>
                  <div className="mb-8">
                    <div className="text-orange-500 text-xs font-semibold uppercase tracking-wide mb-2">Step 3 of 4</div>
                    <h2 className="text-2xl font-bold text-gray-900 font-['Playfair_Display']">Shipping address</h2>
                    <p className="text-gray-500 text-sm mt-1">Your default delivery address.</p>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Country</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 text-gray-900"
                      value={data.country} onChange={(e) => set("country", e.target.value)}>
                      {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Address line 1</label>
                    <input className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-orange-500 text-gray-900 placeholder-gray-400 ${errors.addressLine1 ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="House no., street, barangay" value={data.addressLine1} onChange={(e) => set("addressLine1", e.target.value)} />
                    {errors.addressLine1 && <p className="text-red-500 text-xs mt-1">{errors.addressLine1}</p>}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Address line 2 <span className="text-gray-400 text-xs">(optional)</span></label>
                    <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 text-gray-900 placeholder-gray-400"
                      placeholder="Apartment, unit, floor" value={data.addressLine2} onChange={(e) => set("addressLine2", e.target.value)} />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">City / Municipality</label>
                      <input className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-orange-500 text-gray-900 placeholder-gray-400 ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Enter city" value={data.city} onChange={(e) => set("city", e.target.value)} />
                      {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Postal code</label>
                      <input className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-orange-500 text-gray-900 placeholder-gray-400 ${errors.postalCode ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Enter postal code" value={data.postalCode} onChange={(e) => set("postalCode", e.target.value)} />
                      {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Province / State</label>
                    {data.country === "Philippines" ? (
                      <select className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-orange-500 text-gray-900 ${errors.province ? 'border-red-500' : 'border-gray-300'}`}
                        value={data.province} onChange={(e) => set("province", e.target.value)}>
                        <option value="">Select province</option>
                        {PH_PROVINCES.map((p) => <option key={p}>{p}</option>)}
                      </select>
                    ) : (
                      <input className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-orange-500 text-gray-900 placeholder-gray-400 ${errors.province ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Enter province/state" value={data.province} onChange={(e) => set("province", e.target.value)} />
                    )}
                    {errors.province && <p className="text-red-500 text-xs mt-1">{errors.province}</p>}
                  </div>
                </>
              )}

              {/* Step 4: Account Setup */}
              {step === 4 && !isSubmitting && (
                <>
                  <div className="mb-8">
                    <div className="text-orange-500 text-xs font-semibold uppercase tracking-wide mb-2">Step 4 of 4</div>
                    <h2 className="text-2xl font-bold text-gray-900 font-['Playfair_Display']">Create your account</h2>
                    <p className="text-gray-500 text-sm mt-1">Almost there — set up your login credentials.</p>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email address</label>
                    <input type="email" className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-orange-500 text-gray-900 placeholder-gray-400 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="juan@example.com" value={data.email} onChange={(e) => set("email", e.target.value)} />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                    <div className="relative">
                      <input type={showPass ? "text" : "password"} className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-orange-500 text-gray-900 placeholder-gray-400 pr-10 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="At least 8 characters" value={data.password} onChange={(e) => set("password", e.target.value)} />
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500"
                        onClick={() => setShowPass(!showPass)}>
                        {showPass ? "Hide" : "Show"}
                      </button>
                    </div>
                    {data.password && (
                      <>
                        <div className="flex gap-1 mt-2">
                          {[1,2,3,4].map((n) => (
                            <div key={n} className="flex-1 h-1 rounded-full transition" style={{ background: n <= strength ? strengthColor : "#e5e7eb" }} />
                          ))}
                        </div>
                        <p className="text-xs mt-1" style={{ color: strengthColor }}>{strengthLabel}</p>
                      </>
                    )}
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm password</label>
                    <div className="relative">
                      <input type={showConfirm ? "text" : "password"} className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-orange-500 text-gray-900 placeholder-gray-400 pr-10 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Re-enter your password" value={data.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)} />
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500"
                        onClick={() => setShowConfirm(!showConfirm)}>
                        {showConfirm ? "Hide" : "Show"}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                  </div>

                  <div className="border-t border-gray-200 my-6" />

                  <div className="mb-6">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" className="mt-0.5 w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
                        checked={data.agreeTerms} onChange={(e) => set("agreeTerms", e.target.checked)} />
                      <span className="text-sm text-gray-700">
                        I agree to Cartify's <a href="/terms" className="text-orange-500 hover:underline">Terms of Service</a> and <a href="/privacy" className="text-orange-500 hover:underline">Privacy Policy</a>.
                      </span>
                    </label>
                    {errors.agreeTerms && <p className="text-red-500 text-xs mt-1">{errors.agreeTerms}</p>}
                  </div>
                </>
              )}

              {/* Success State */}
              {isSubmitting && (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Account created!</h3>
                  <p className="text-gray-500">Welcome to Cartify. Redirecting you to the store...</p>
                </div>
              )}

              {/* Navigation Buttons */}
              {!isSubmitting && (
                <div className="flex gap-3 mt-8 pt-4 border-t border-gray-200">
                  {step > 1 && (
                    <button className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:border-orange-500 hover:text-orange-500 transition" onClick={back}>
                      Back
                    </button>
                  )}
                  <button className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition shadow-md hover:shadow-lg" onClick={next}>
                    {step === 4 ? "Create account" : "Continue →"}
                  </button>
                </div>
              )}

              {/* Sign In Link */}
              {!isSubmitting && step === 1 && (
                <div className="text-center mt-6 pt-4">
                  <p className="text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link href="/signin" className="text-orange-500 font-semibold hover:underline">
                      Sign in
                    </Link>
                  </p>
                </div>
              )}
              
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}