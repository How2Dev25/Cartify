"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const LETTERS = ['C', 'A', 'R', 'T', 'I', 'F', 'Y'];

export default function LoadingAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!containerRef.current) return;

    const timeout = setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.style.transition = "opacity 0.5s ease, transform 0.5s ease";
        containerRef.current.style.opacity = "0";
        containerRef.current.style.transform = "scale(0.97)";
      }
    }, 2400); // longer visible time

    return () => clearTimeout(timeout);
  }, [pathname]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        .loading-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'DM Sans', sans-serif;
        }

        .loading-letters {
          display: flex;
          gap: 6px;
          align-items: flex-end;
        }

        .loading-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .loading-letter {
          font-size: clamp(32px, 6vw, 48px);
          font-weight: 700;
          color: #f97316;
          letter-spacing: -0.02em;
          opacity: 0;
          transform: translateY(18px);
          animation: lcLetterUp 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .loading-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #f97316;
          opacity: 0;
          transform: scale(0);
          animation: lcDotPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards,
                     lcDotPulse 1.8s ease-in-out infinite;
        }

        /* Per-column stagger */
        .loading-col:nth-child(1) .loading-letter { animation-delay: 0.10s; }
        .loading-col:nth-child(1) .loading-dot    { animation-delay: 0.38s, 1.55s; }
        .loading-col:nth-child(2) .loading-letter { animation-delay: 0.22s; }
        .loading-col:nth-child(2) .loading-dot    { animation-delay: 0.50s, 1.67s; }
        .loading-col:nth-child(3) .loading-letter { animation-delay: 0.34s; }
        .loading-col:nth-child(3) .loading-dot    { animation-delay: 0.62s, 1.79s; }
        .loading-col:nth-child(4) .loading-letter { animation-delay: 0.46s; }
        .loading-col:nth-child(4) .loading-dot    { animation-delay: 0.74s, 1.91s; }
        .loading-col:nth-child(5) .loading-letter { animation-delay: 0.58s; }
        .loading-col:nth-child(5) .loading-dot    { animation-delay: 0.86s, 2.03s; }
        .loading-col:nth-child(6) .loading-letter { animation-delay: 0.70s; }
        .loading-col:nth-child(6) .loading-dot    { animation-delay: 0.98s, 2.15s; }
        .loading-col:nth-child(7) .loading-letter { animation-delay: 0.82s; }
        .loading-col:nth-child(7) .loading-dot    { animation-delay: 1.10s, 2.27s; }

        @keyframes lcLetterUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes lcDotPop {
          0%   { opacity: 0; transform: scale(0); }
          70%  { opacity: 1; transform: scale(1.4); }
          100% { opacity: 1; transform: scale(1); }
        }

        @keyframes lcDotPulse {
          0%, 100% { opacity: 1;    transform: scale(1); }
          50%       { opacity: 0.3; transform: scale(0.5); }
        }

        .loading-subtext {
          margin-top: 32px;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #d1d5db;
        }
      `}</style>

      <div className="loading-overlay" ref={containerRef}>
        <div className="loading-letters">
          {LETTERS.map((letter, i) => (
            <div key={i} className="loading-col">
              <span className="loading-letter">{letter}</span>
              <span className="loading-dot" />
            </div>
          ))}
        </div>
        <p className="loading-subtext">Loading</p>
      </div>
    </>
  );
}