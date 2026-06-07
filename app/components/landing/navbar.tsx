"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { routes } from "../../routes";

const links = [
  { href: routes.products, label: "Products" },
  { href: routes.about, label: "About" },
  { href: routes.contact, label: "Contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');

        .navbar {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 50;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.35s ease, box-shadow 0.35s ease, padding 0.35s ease;
          padding: 18px 0;
          background: transparent;
        }
        .navbar.scrolled {
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          box-shadow: 0 1px 0 rgba(0,0,0,0.07), 0 4px 24px rgba(0,0,0,0.06);
          padding: 12px 0;
        }

        .nav-logo {
          font-size: 22px;
          font-weight: 700;
          text-decoration: none;
          letter-spacing: -0.04em;
          transition: all 0.3s ease;
          color: #f97316;
        }
        .nav-logo span { 
          color: #f97316;
          transition: color 0.3s ease;
        }
        
        /* Scrolled state - logo becomes dark */
        .navbar.scrolled .nav-logo {
          color: #1a1a1a;
        }
        .navbar.scrolled .nav-logo span {
          color: #f97316;
        }
        
        .nav-logo:hover { 
          opacity: 0.8;
        }

        .nav-link {
          font-size: 14px;
          font-weight: 500;
          color: #4b4b4b;
          text-decoration: none;
          position: relative;
          padding-bottom: 2px;
          transition: color 0.2s;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          left: 0; bottom: -2px;
          width: 0; height: 1.5px;
          background: #f97316;
          transition: width 0.25s ease;
          border-radius: 2px;
        }
        .nav-link:hover { color: #f97316; }
        .nav-link:hover::after { width: 100%; }

        /* Icon buttons */
        .icon-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: #fff3ed;
          border: 1px solid #ffe4d1;
          transition: all 0.2s ease;
          text-decoration: none;
          color: #f97316;
        }
        .icon-btn svg {
          stroke: #f97316;
          stroke-width: 1.8;
        }
        .icon-btn:hover {
          background: #f97316;
          border-color: #f97316;
          transform: translateY(-1px);
        }
        .icon-btn:hover svg {
          stroke: white;
        }

        /* Scrolled state icon button */
        .navbar.scrolled .icon-btn {
          background: #f97316;
          border-color: #f97316;
        }
        .navbar.scrolled .icon-btn svg {
          stroke: white;
        }
        .navbar.scrolled .icon-btn:hover {
          background: #ea6d10;
          border-color: #ea6d10;
          transform: translateY(-1px);
        }

        .cart-badge {
          position: absolute;
          top: -5px; right: -5px;
          background: #f97316;
          color: #fff;
          font-size: 10px;
          font-weight: 600;
          width: 18px; height: 18px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid #fff;
          transition: background 0.2s;
        }
        .icon-btn:hover .cart-badge {
          background: white;
          color: #f97316;
          border-color: #f97316;
        }
        .navbar.scrolled .cart-badge {
          background: white;
          color: #f97316;
          border-color: #f97316;
        }
        .navbar.scrolled .icon-btn:hover .cart-badge {
          background: #f97316;
          color: white;
          border-color: white;
        }

        .btn-signin {
          font-size: 14px;
          font-weight: 500;
          color: #4b4b4b;
          text-decoration: none;
          padding: 8px 14px;
          border-radius: 8px;
          transition: color 0.2s, background 0.2s;
        }
        .btn-signin:hover { color: #f97316; background: #fff3ed; }

        .mobile-menu {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 49;
          background: rgba(255,255,255,0.97);
          backdrop-filter: blur(16px);
          padding: 80px 24px 28px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
          transform: translateY(-110%);
          transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
        }
        .mobile-menu.open { transform: translateY(0); }

        .mobile-link {
          display: block;
          font-size: 18px;
          font-weight: 500;
          color: #1a1a1a;
          text-decoration: none;
          padding: 14px 0;
          border-bottom: 1px solid #f3f3f3;
          transition: color 0.2s;
        }
        .mobile-link:hover { color: #f97316; }

        .hamburger-bar {
          display: block;
          width: 20px; height: 1.5px;
          background: #1a1a1a;
          border-radius: 2px;
          transition: all 0.3s ease;
          transform-origin: center;
        }
        .ham-open .hamburger-bar:nth-child(1) { transform: translateY(5px) rotate(45deg); }
        .ham-open .hamburger-bar:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .ham-open .hamburger-bar:nth-child(3) { transform: translateY(-5px) rotate(-45deg); }
      `}</style>

      <nav className={`navbar${scrolled ? " scrolled" : ""}`}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          {/* Logo - Orange by default */}
          <Link href="/" className="nav-logo">
            Cart<span>ify</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="nav-link">{l.label}</Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Orders Icon */}
            <Link href="/orders" className="icon-btn" aria-label="Orders">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 7h-4.18A3 3 0 0 0 16 5.18V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v1.18A3 3 0 0 0 8.18 7H4"/>
                <path d="M4 7v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7"/>
                <line x1="8" y1="11" x2="16" y2="11"/>
                <line x1="8" y1="15" x2="16" y2="15"/>
              </svg>
            </Link>

            {/* Cart Icon */}
            <Link href="/cart" className="icon-btn" aria-label="Cart">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              <span className="cart-badge">0</span>
            </Link>

            {/* Sign In */}
            <Link href={routes.login} className="btn-signin hidden md:block">Sign In</Link>

            {/* Hamburger */}
            <button
              className={`md:hidden flex flex-col justify-center items-center gap-1 w-9 h-9 rounded-lg border border-gray-200 bg-white transition-colors hover:border-orange-300${mobileOpen ? " ham-open" : ""}`}
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              style={{ gap: "3.5px" }}
            >
              <span className="hamburger-bar" />
              <span className="hamburger-bar" />
              <span className="hamburger-bar" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`mobile-menu${mobileOpen ? " open" : ""}`}>
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="mobile-link" onClick={() => setMobileOpen(false)}>
            {l.label}
          </Link>
        ))}
        {/* Mobile Orders link */}
        <Link href="/orders" className="mobile-link" onClick={() => setMobileOpen(false)}>
          Orders
        </Link>
        <div className="flex gap-3 mt-6">
          <Link href={routes.login} className="btn-signin flex-1 text-center" style={{ border: "1px solid #e5e7eb", borderRadius: 100 }} onClick={() => setMobileOpen(false)}>
            Sign In
          </Link>
        </div>
      </div>

      {/* Spacer so content doesn't hide under fixed nav */}
      <div style={{ height: 64 }} />
    </>
  );
}