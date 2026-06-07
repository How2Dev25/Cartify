"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";

const slides = [
  {
    image:
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&h=700&fit=crop&q=80",
    label: "New Arrival",
    heading: "Summer Style",
    headingAccent: "For Everyone",
    sub: "Discover the perfect blend of comfort and style. Up to 40% off on selected items.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&h=700&fit=crop&q=80",
    label: "Trending Now",
    heading: "Effortless",
    headingAccent: "Chic",
    sub: "Bold prints, soft textures, and silhouettes that move with you all season long.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=700&fit=crop&q=80",
    label: "Limited Edition",
    heading: "The Season's",
    headingAccent: "Best Looks",
    sub: "Shop curated sets styled by our in-house team — exclusive drops every Friday.",
  },
];

export default function Header() {
  const [current, setCurrent] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  const goTo = useCallback((idx: number) => {
    setCurrent(idx);
    setAnimKey((k) => k + 1);
  }, []);

  const next = useCallback(() => {
    goTo((current + 1) % slides.length);
  }, [current, goTo]);

  useEffect(() => {
    const timer = setInterval(next, 4800);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        .hero-slide {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 1.2s cubic-bezier(0.4,0,0.2,1);
          background-size: cover;
          background-position: center top;
        }
        .hero-slide.active { opacity: 1; }

        .hero-slide::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.28) 55%, rgba(0,0,0,0.10) 100%);
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .anim-label  { animation: fadeUp 0.6s ease 0.10s both; }
        .anim-head   { animation: fadeUp 0.7s ease 0.22s both; }
        .anim-sub    { animation: fadeUp 0.7s ease 0.36s both; }
        .anim-btns   { animation: fadeUp 0.7s ease 0.46s both; }
        .anim-chips  { animation: fadeUp 0.7s ease 0.56s both; }

        @keyframes pulseBadge {
          0%,100% { box-shadow: 0 4px 20px rgba(249,115,22,0.45), 0 0 0 0 rgba(249,115,22,0.25); }
          50%     { box-shadow: 0 4px 20px rgba(249,115,22,0.45), 0 0 0 10px rgba(249,115,22,0); }
        }
        .badge-pulse { animation: pulseBadge 2.4s ease-in-out infinite; }
      `}</style>

      <section
        className="relative overflow-hidden "
        style={{ minHeight: 600, fontFamily: "'DM Sans', sans-serif" }}
      >
        {/* Background slides */}
        {slides.map((s, i) => (
          <div
            key={i}
            className={`hero-slide${i === current ? " active" : ""}`}
            style={{ backgroundImage: `url('${s.image}')` }}
          />
        ))}

        {/* Content */}
        <div
          key={animKey}
          className="relative z-10 flex flex-col justify-center"
          style={{ padding: "52px 48px 44px", minHeight: 540, maxWidth: 560 }}
        >
          <span
            className="anim-label inline-block text-orange-400 text-xs font-medium tracking-widest uppercase mb-5"
            style={{
              background: "rgba(249,115,22,0.13)",
              border: "1px solid rgba(249,115,22,0.35)",
              padding: "5px 14px",
              borderRadius: 100,
              backdropFilter: "blur(4px)",
              width: "fit-content",
            }}
          >
            {slide.label}
          </span>

          <h1
            className="anim-head text-white font-bold m-0 leading-tight"
            style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(38px, 5vw, 56px)" }}
          >
            {slide.heading}
            <br />
            <em className="text-orange-400 not-italic" style={{ fontStyle: "italic" }}>
              {slide.headingAccent}
            </em>
          </h1>

          <p
            className="anim-sub text-white/75 font-light mt-4 mb-7"
            style={{ fontSize: 15, lineHeight: 1.65, maxWidth: 380 }}
          >
            {slide.sub}
          </p>

          <div className="anim-btns flex flex-wrap gap-3">
            <Link
              href="/products"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-medium transition-all shadow-lg"
              style={{ fontSize: 14 }}
            >
              Shop Collection
            </Link>
            <Link
              href="/lookbook"
              className="text-white hover:bg-white/10 px-8 py-3 rounded-full font-medium transition-all"
              style={{
                fontSize: 14,
                border: "1.5px solid rgba(255,255,255,0.55)",
                backdropFilter: "blur(4px)",
              }}
            >
              View Lookbook
            </Link>
          </div>

          <div className="anim-chips flex flex-wrap gap-5 mt-8">
            {["Free Shipping", "30-Day Returns", "New Arrivals Daily"].map((chip) => (
              <div key={chip} className="flex items-center gap-2" style={{ fontSize: 13, color: "rgba(255,255,255,0.72)" }}>
                <span className="block w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                {chip}
              </div>
            ))}
          </div>
        </div>

        {/* Badge */}
        <div
          className="badge-pulse absolute top-7 right-7 z-20 flex flex-col items-center justify-center bg-orange-500 rounded-full"
          style={{ width: 76, height: 76 }}
        >
          <span className="text-white font-bold text-xl leading-none">-40%</span>
          <span className="text-white/90 text-xs tracking-wider mt-0.5">OFF</span>
        </div>

        {/* Dot navigation */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === current ? 22 : 6,
                background: i === current ? "#f97316" : "rgba(255,255,255,0.38)",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            />
          ))}
        </div>

        {/* Slide counter */}
        <div
          className="absolute bottom-5 right-7 z-20"
          style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", fontWeight: 300 }}
        >
          {String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </div>
      </section>
    </>
  );
}