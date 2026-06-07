"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { routes } from "../../routes";


// Product slides for the left panel
const slides = [
  {
    id: 1,
    tag: "New Arrival",
    headline: "Minimal carry,\nmaximal style.",
    sub: "Premium leather bags crafted for everyday life.",
    accent: "#f97316",
    bg: "#1a1008",
    imgUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=900&q=80",
  },
  {
    id: 2,
    tag: "Best Seller",
    headline: "Wear what\nmatters most.",
    sub: "Timeless pieces for every wardrobe.",
    accent: "#f97316",
    bg: "#0f1318",
    imgUrl: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=900&q=80",
  },
  {
    id: 3,
    tag: "Limited Edition",
    headline: "Scent that\nstays with you.",
    sub: "Luxury fragrances, curated for moments.",
    accent: "#f97316",
    bg: "#130f18",
    imgUrl: "https://images.unsplash.com/photo-1541643600914-78b084683702?w=900&q=80",
  },
  {
    id: 4,
    tag: "Trending",
    headline: "Tech that\nfits your life.",
    sub: "Sleek accessories for the modern explorer.",
    accent: "#f97316",
    bg: "#0d1318",
    imgUrl: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=900&q=80",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);
  const [prevSlide, setPrevSlide] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  const rightRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-advance slideshow
  const goToSlide = (next: number) => {
    if (transitioning) return;
    setTransitioning(true);
    setPrevSlide(activeSlide);
    setActiveSlide(next);
    setTimeout(() => {
      setPrevSlide(null);
      setTransitioning(false);
    }, 900);
  };

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setActiveSlide((cur) => {
        const next = (cur + 1) % slides.length;
        setPrevSlide(cur);
        setTransitioning(true);
        setTimeout(() => { setPrevSlide(null); setTransitioning(false); }, 900);
        return next;
      });
    }, 4500);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  // Right panel entrance
  useEffect(() => {
    if (!rightRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".rp-logo",   { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.1, ease: "power3.out" });
      gsap.fromTo(".rp-title",  { opacity: 0, y: 20  }, { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: "power3.out" });
      gsap.fromTo(".rp-input",  { opacity: 0, y: 16  }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, delay: 0.35, ease: "power3.out" });
      gsap.fromTo(".rp-cta",    { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.5, delay: 0.65, ease: "back.out(1.2)" });
      gsap.fromTo(".rp-footer", { opacity: 0 }, { opacity: 1, duration: 0.5, delay: 0.8, ease: "power2.out" });
    }, rightRef);
    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    setTimeout(() => {
      if (email === "demo@cartify.com" && password === "password") {
        gsap.to(".rp-form-wrap", {
          scale: 1.015, duration: 0.18, yoyo: true, repeat: 1,
          onComplete: () => router.push("/"),
        });
      } else {
        setError("Invalid email or password.");
        gsap.to(".rp-form-wrap", {
          x: -6, duration: 0.08, yoyo: true, repeat: 5,
          onComplete: () => setIsLoading(false),
        });
      }
    }, 1400);
  };

  const cur = slides[activeSlide];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,700;1,500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .lp-root {
          display: flex;
          min-height: 100vh;
          font-family: 'DM Sans', sans-serif;
          background: #fff;
        }

        /* ── LEFT PANEL ─────────────────────────────── */
        .lp-left {
          position: relative;
          flex: 0 0 52%;
          overflow: hidden;
          display: none;
        }
        @media (min-width: 900px) { .lp-left { display: block; } }

        .lp-slide {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 52px 48px;
          transition: background 0.9s ease;
        }

        /* Background image */
        .lp-slide-img {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          transition: opacity 0.9s ease, transform 1.2s cubic-bezier(0.4,0,0.2,1);
        }
        .lp-slide-img.entering { opacity: 0; transform: scale(1.06); }
        .lp-slide-img.active   { opacity: 1; transform: scale(1); }
        .lp-slide-img.exiting  { opacity: 0; transform: scale(0.96); }

        /* dark overlay */
        .lp-slide::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.12) 55%, transparent 100%);
          pointer-events: none;
        }

        .lp-slide-content {
          position: relative;
          z-index: 2;
        }

        .lp-slide-tag {
          display: inline-block;
          background: #f97316;
          color: #fff;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 4px 12px;
          border-radius: 100px;
          margin-bottom: 18px;
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s;
        }
        .lp-slide-tag.in { opacity: 1; transform: translateY(0); }

        .lp-slide-headline {
          font-family: 'Playfair Display', serif;
          font-size: clamp(32px, 3.5vw, 48px);
          font-weight: 700;
          color: #fff;
          line-height: 1.18;
          white-space: pre-line;
          margin-bottom: 14px;
          opacity: 0;
          transform: translateY(14px);
          transition: opacity 0.55s ease 0.22s, transform 0.55s ease 0.22s;
        }
        .lp-slide-headline.in { opacity: 1; transform: translateY(0); }

        .lp-slide-sub {
          font-size: 14px;
          color: rgba(255,255,255,0.7);
          font-weight: 400;
          line-height: 1.6;
          margin-bottom: 36px;
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.5s ease 0.34s, transform 0.5s ease 0.34s;
        }
        .lp-slide-sub.in { opacity: 1; transform: translateY(0); }

        /* Dots */
        .lp-dots {
          display: flex;
          gap: 8px;
          position: relative;
          z-index: 2;
        }
        .lp-dot {
          width: 28px;
          height: 3px;
          border-radius: 100px;
          background: rgba(255,255,255,0.28);
          cursor: pointer;
          transition: background 0.3s, width 0.4s cubic-bezier(0.4,0,0.2,1);
          border: none;
        }
        .lp-dot.active {
          background: #f97316;
          width: 52px;
        }

        /* Top-left wordmark on left panel */
        .lp-wordmark {
          position: absolute;
          top: 36px;
          left: 48px;
          z-index: 10;
          font-family: 'DM Sans', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.03em;
          text-decoration: none;
        }
        .lp-wordmark span { color: #f97316; }

        /* ── RIGHT PANEL ─────────────────────────────── */
        .lp-right {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 48px 40px;
          background: #fff;
          overflow-y: auto;
        }

        .rp-form-wrap {
          width: 100%;
          max-width: 400px;
        }

        .rp-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 36px;
          text-decoration: none;
        }
        .rp-logo-icon {
          width: 38px;
          height: 38px;
          background: #fff3ed;
          border: 1.5px solid #ffe4d1;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .rp-logo-text {
          font-family: 'DM Sans', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: #1a1a1a;
          letter-spacing: -0.04em;
        }
        .rp-logo-text span { color: #f97316; }

        .rp-title { margin-bottom: 6px; }
        .rp-title h2 {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 700;
          color: #111;
          letter-spacing: -0.02em;
        }
        .rp-title p {
          font-size: 14px;
          color: #9ca3af;
          margin-top: 6px;
          font-weight: 400;
        }

        .rp-divider-top {
          height: 1px;
          background: #f3f4f6;
          margin: 24px 0;
        }

        /* Inputs */
        .rp-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-bottom: 7px;
        }
        .rp-input-wrap { position: relative; }
        .rp-input {
          width: 100%;
          height: 46px;
          padding: 0 14px;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 400;
          color: #111;
          background: #fff;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
        }
        .rp-input:focus {
          border-color: #f97316;
          box-shadow: 0 0 0 3px rgba(249,115,22,0.1);
        }
        .rp-input.has-icon { padding-right: 44px; }
        .rp-input.err { border-color: #ef4444; }

        .rp-icon-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #9ca3af;
          display: flex;
          align-items: center;
          padding: 0;
          transition: color 0.2s;
        }
        .rp-icon-btn:hover { color: #f97316; }

        .rp-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 14px;
          margin-bottom: 24px;
        }
        .rp-remember {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 13px;
          color: #6b7280;
        }
        .rp-remember input { accent-color: #f97316; cursor: pointer; }
        .rp-forgot {
          font-size: 13px;
          color: #9ca3af;
          text-decoration: none;
          transition: color 0.2s;
        }
        .rp-forgot:hover { color: #f97316; }

        /* Error */
        .rp-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          font-size: 13px;
          border-radius: 8px;
          padding: 10px 14px;
          margin-bottom: 16px;
          text-align: center;
        }

        /* CTA */
        .rp-btn {
          width: 100%;
          height: 48px;
          background: #f97316;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 600;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          letter-spacing: 0.01em;
        }
        .rp-btn:hover {
          background: #ea6d10;
          transform: translateY(-1px);
          box-shadow: 0 8px 20px -4px rgba(249,115,22,0.38);
        }
        .rp-btn:active { transform: translateY(0); }
        .rp-btn:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }

        .rp-btn-spinner {
          display: inline-block;
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.65s linear infinite;
          vertical-align: middle;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Divider */
        .rp-or {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 22px 0;
          font-size: 12px;
          color: #d1d5db;
          font-weight: 500;
        }
        .rp-or::before, .rp-or::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #f3f4f6;
        }

        /* Google */
        .rp-google {
          width: 100%;
          height: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          background: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s, transform 0.15s;
        }
        .rp-google:hover {
          border-color: #f97316;
          background: #fff8f4;
          transform: translateY(-1px);
        }
        .rp-google:disabled { opacity: 0.6; cursor: not-allowed; }

        .rp-footer {
          text-align: center;
          margin-top: 28px;
          font-size: 13px;
          color: #9ca3af;
        }
        .rp-footer a { color: #f97316; font-weight: 600; text-decoration: none; }
        .rp-footer a:hover { text-decoration: underline; }

        .rp-demo {
          margin-top: 20px;
          padding: 12px 16px;
          background: #fafafa;
          border: 1px dashed #e5e7eb;
          border-radius: 10px;
          font-size: 11.5px;
          color: #9ca3af;
          text-align: center;
          line-height: 1.7;
        }
        .rp-demo strong { color: #6b7280; }
      `}</style>

      <div className="lp-root">

        {/* ── LEFT PANEL ── */}
        <div className="lp-left" style={{ background: cur.bg, transition: "background 0.9s ease" }}>

          {/* Wordmark */}
          <Link href="/" className="lp-wordmark">Cart<span>ify</span></Link>

          {/* Slides */}
          {slides.map((s, i) => {
            const isActive = i === activeSlide;
            const isPrev   = i === prevSlide;
            return (
              <div key={s.id} className="lp-slide" style={{ zIndex: isActive ? 2 : isPrev ? 1 : 0 }}>
                <div
                  className={`lp-slide-img ${isActive ? "active" : isPrev ? "exiting" : "entering"}`}
                  style={{ backgroundImage: `url(${s.imgUrl})` }}
                />
                <div className="lp-slide-content">
                  <div className={`lp-slide-tag ${isActive ? "in" : ""}`}>{s.tag}</div>
                  <div className={`lp-slide-headline ${isActive ? "in" : ""}`}>{s.headline}</div>
                  <div className={`lp-slide-sub ${isActive ? "in" : ""}`}>{s.sub}</div>
                  <div className="lp-dots">
                    {slides.map((_, di) => (
                      <button
                        key={di}
                        className={`lp-dot ${di === activeSlide ? "active" : ""}`}
                        onClick={() => {
                          if (intervalRef.current) clearInterval(intervalRef.current);
                          goToSlide(di);
                        }}
                        aria-label={`Go to slide ${di + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="lp-right" ref={rightRef}>
          <div className="rp-form-wrap">

            {/* Logo */}
           
            {/* Title */}
            <div className="rp-title">
              <h2>Welcome back</h2>
              <p>Sign in to your account to continue shopping.</p>
            </div>

            <div className="rp-divider-top" />

            {/* Error */}
            {error && <div className="rp-error">{error}</div>}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div style={{ marginBottom: 16 }}>
                <label className="rp-label">Email</label>
                <div className="rp-input-wrap">
                  <input
                    type="email"
                    className={`rp-input${error ? " err" : ""}`}
                    placeholder="hello@cartify.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: 4 }}>
                <label className="rp-label">Password</label>
                <div className="rp-input-wrap">
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`rp-input has-icon${error ? " err" : ""}`}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <button type="button" className="rp-icon-btn" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember / Forgot */}
              <div className="rp-row">
                <label className="rp-remember">
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} disabled={isLoading} />
                  Remember me
                </label>
                <Link href="/forgot-password" className="rp-forgot">Forgot password?</Link>
              </div>

              {/* Submit */}
              <button type="submit" className="rp-btn rp-cta" disabled={isLoading}>
                {isLoading ? <span className="rp-btn-spinner" /> : "Sign In"}
              </button>
            </form>

            {/* Or */}
            <div className="rp-or">or continue with</div>

            {/* Google */}
            <button
              className="rp-google rp-cta"
              onClick={() => { setIsLoading(true); setTimeout(() => router.push("/"), 1500); }}
              disabled={isLoading}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>

            {/* Footer */}
            <div className="rp-footer">
              Don't have an account? <Link href={routes.signup}>Sign up</Link>
            </div>

            {/* Demo hint */}
            <div className="rp-demo">
              <strong>Demo:</strong> demo@cartify.com &nbsp;/&nbsp; password
            </div>

          </div>
        </div>
      </div>
    </>
  );
}