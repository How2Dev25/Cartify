
"use client";
import Link from "next/link";



const shop = [
  { href: "/products", label: "New Arrivals" },
  { href: "/products?cat=women", label: "Women" },
  { href: "/products?cat=men", label: "Men" },
  { href: "/products?cat=accessories", label: "Accessories" },
  { href: "/lookbook", label: "Lookbook" },
];

const help = [
  { href: "/faq", label: "FAQ" },
  { href: "/shipping", label: "Shipping & Returns" },
  { href: "/sizing", label: "Size Guide" },
  { href: "/track", label: "Track My Order" },
  { href: "/contact", label: "Contact Us" },
];

const company = [
  { href: "/about", label: "About Us" },
  { href: "/careers", label: "Careers" },
  { href: "/press", label: "Press" },
  { href: "/sustainability", label: "Sustainability" },
  { href: "/affiliates", label: "Affiliates" },
];

const socials = [
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://tiktok.com",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/>
      </svg>
    ),
  },
  {
    label: "Pinterest",
    href: "https://pinterest.com",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://facebook.com",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
];

export function Footer() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital@1&family=DM+Sans:wght@300;400;500&display=swap');

        .footer-root {
          background: #111110;
          color: #a8a8a4;
          font-family: 'DM Sans', sans-serif;
        }

        .footer-col-heading {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #fff;
          margin-bottom: 18px;
        }

        .footer-link {
          display: block;
          font-size: 14px;
          font-weight: 300;
          color: #7a7a76;
          text-decoration: none;
          margin-bottom: 11px;
          transition: color 0.2s;
        }
        .footer-link:hover { color: #f97316; }

        .footer-divider {
          border: none;
          border-top: 1px solid #222220;
          margin: 0;
        }

        .social-btn {
          width: 38px; height: 38px;
          border-radius: 10px;
          border: 1px solid #2a2a27;
          background: #1a1a18;
          color: #7a7a76;
          display: flex; align-items: center; justify-content: center;
          text-decoration: none;
          transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.15s;
          flex-shrink: 0;
        }
        .social-btn:hover {
          background: #fff3ed;
          border-color: #f97316;
          color: #f97316;
          transform: translateY(-2px);
        }

        .newsletter-input {
          flex: 1;
          background: #1a1a18;
          border: 1px solid #2a2a27;
          border-radius: 100px 0 0 100px;
          padding: 11px 18px;
          font-size: 13px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s;
          min-width: 0;
        }
        .newsletter-input::placeholder { color: #555552; }
        .newsletter-input:focus { border-color: #f97316; }

        .newsletter-btn {
          background: #f97316;
          color: #fff;
          border: none;
          padding: 11px 22px;
          border-radius: 0 100px 100px 0;
          font-size: 13px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: background 0.2s;
          white-space: nowrap;
        }
        .newsletter-btn:hover { background: #ea6d10; }

        .badge-strip {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .payment-badge {
          background: #1a1a18;
          border: 1px solid #2a2a27;
          border-radius: 6px;
          padding: 5px 10px;
          font-size: 11px;
          font-weight: 500;
          color: #555552;
          letter-spacing: 0.04em;
        }
      `}</style>

      <footer className="footer-root">
        {/* Top strip */}
        <div style={{ background: "#f97316", padding: "14px 0" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>
              🎉 Free shipping on all orders over ₱1,500 — Limited time offer!
            </p>
            <Link href="/products" style={{ fontSize: 13, fontWeight: 600, color: "#fff", textDecoration: "underline", textUnderlineOffset: 3, fontFamily: "'DM Sans', sans-serif" }}>
              Shop now →
            </Link>
          </div>
        </div>

        {/* Main footer body */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 24px 40px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "48px 32px" }} className="footer-grid">

            {/* Brand col */}
            <div>
              <Link href="/" style={{ fontSize: 26, fontWeight: 700, color: "#fff", textDecoration: "none", letterSpacing: "-0.04em", fontFamily: "'DM Sans', sans-serif", display: "inline-block", marginBottom: 12 }}>
                Cart<span style={{ color: "#f97316" }}>ify</span>
              </Link>
              <p style={{ fontSize: 14, fontWeight: 300, lineHeight: 1.7, color: "#555552", maxWidth: 260, marginBottom: 24 }}>
                Curated fashion for every season. Comfort meets style — discover looks that move with you.
              </p>

              {/* Newsletter */}
              <p className="footer-col-heading" style={{ marginBottom: 12 }}>Stay in the loop</p>
              <div style={{ display: "flex" }}>
                <input className="newsletter-input" type="email" placeholder="your@email.com" />
                <button className="newsletter-btn">Subscribe</button>
              </div>
              <p style={{ fontSize: 12, color: "#3a3a38", marginTop: 10, fontWeight: 300 }}>No spam. Unsubscribe anytime.</p>
            </div>

            {/* Shop */}
            <div>
              <p className="footer-col-heading">Shop</p>
              {shop.map((l) => <Link key={l.href} href={l.href} className="footer-link">{l.label}</Link>)}
            </div>

            {/* Help */}
            <div>
              <p className="footer-col-heading">Help</p>
              {help.map((l) => <Link key={l.href} href={l.href} className="footer-link">{l.label}</Link>)}
            </div>

            {/* Company */}
            <div>
              <p className="footer-col-heading">Company</p>
              {company.map((l) => <Link key={l.href} href={l.href} className="footer-link">{l.label}</Link>)}
            </div>
          </div>

          {/* Socials */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 40 }}>
            <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "#3a3a38", marginRight: 4 }}>Follow us</p>
            {socials.map((s) => (
              <a key={s.label} href={s.href} className="social-btn" aria-label={s.label} target="_blank" rel="noopener noreferrer">
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        <hr className="footer-divider" />

        {/* Bottom bar */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
          <p style={{ fontSize: 13, color: "#3a3a38", fontWeight: 300, margin: 0 }}>
            © {new Date().getFullYear()} Cartify. All rights reserved.
          </p>

          <div className="badge-strip">
            {["Visa", "Mastercard", "GCash", "Maya", "COD"].map((b) => (
              <span key={b} className="payment-badge">{b}</span>
            ))}
          </div>

          <div style={{ display: "flex", gap: 20 }}>
            {[{ href: "/privacy", label: "Privacy" }, { href: "/terms", label: "Terms" }, { href: "/cookies", label: "Cookies" }].map((l) => (
              <Link key={l.href} href={l.href} style={{ fontSize: 13, color: "#3a3a38", textDecoration: "none", fontWeight: 300, transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#f97316")}
                onMouseLeave={e => (e.currentTarget.style.color = "#3a3a38")}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Responsive grid override */}
        <style>{`
          @media (max-width: 768px) {
            .footer-grid { grid-template-columns: 1fr 1fr !important; }
          }
          @media (max-width: 480px) {
            .footer-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </footer>
    </>
  );
}