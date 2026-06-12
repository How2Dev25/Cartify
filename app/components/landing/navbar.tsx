"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, signOut, isCustomer } from "@/app/lib/auth";
import { supabase } from "@/app/lib/supabase";
import { routes } from "../../routes";
import { getCartItemCount } from "@/app/lib/cart";

const links = [
  { href: routes.products, label: "Products" },
  { href: routes.about, label: "About" },
  { href: routes.contact, label: "Contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const checkRole = async () => {
      const customer = await isCustomer();
      if (!customer) {
        await signOut();
      }
    };
    checkRole();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Load user and cart count
  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setAvatarUrl(currentUser?.profile?.avatar_url || null);
      
      // Load cart count if user is logged in
      if (currentUser) {
        const count = await getCartItemCount(currentUser.id);
        setCartCount(count);
      }
    };

    loadUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, _session) => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setAvatarUrl(currentUser?.profile?.avatar_url || null);
      
      // Reload cart count on auth change
      if (currentUser) {
        const count = await getCartItemCount(currentUser.id);
        setCartCount(count);
      } else {
        setCartCount(0);
      }
    });

    const onProfileUpdated = () => loadUser();
    window.addEventListener('user-profile-updated', onProfileUpdated);

    // Listen for cart updates
    const handleCartUpdate = () => {
      if (user) {
        getCartItemCount(user.id).then(setCartCount);
      }
    };
    window.addEventListener('cart-updated', handleCartUpdate);

    return () => {
      try { window.removeEventListener('user-profile-updated', onProfileUpdated); } catch (e) {}
      try { window.removeEventListener('cart-updated', handleCartUpdate); } catch (e) {}
      try {
        // @ts-ignore
        authListener?.subscription?.unsubscribe?.();
        // @ts-ignore
        authListener?.unsubscribe?.();
      } catch (e) {}
    };
  }, [user?.id]);

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    setCartCount(0);
    setDropdownOpen(false);
    router.push("/");
  };

  const getUserInitials = () => {
    if (!user) return "U";
    const firstName = user?.profile?.first_name || user?.user_metadata?.first_name || "";
    const lastName = user?.profile?.last_name || user?.user_metadata?.last_name || "";
    if (firstName && lastName) return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    if (firstName) return firstName.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return "U";
  };

  const getDisplayName = () => {
    const firstName = user?.profile?.first_name || user?.user_metadata?.first_name || "";
    const lastName = user?.profile?.last_name || user?.user_metadata?.last_name || "";
    return [firstName, lastName].filter(Boolean).join(" ") || "My Account";
  };

  // Refresh cart count when navigating back to page
  useEffect(() => {
    const refreshCartCount = () => {
      if (user) {
        getCartItemCount(user.id).then(setCartCount);
      }
    };
    
    window.addEventListener('focus', refreshCartCount);
    return () => window.removeEventListener('focus', refreshCartCount);
  }, [user]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=DM+Sans:wght@400;500&display=swap');

        :root {
          --brand: #f97316;
          --brand-dark: #ea6d10;
          --brand-light: #fff7f2;
          --brand-muted: #ffe8d6;
          --text-primary: #111827;
          --text-secondary: #6b7280;
          --text-muted: #9ca3af;
          --border: #e5e7eb;
          --surface: #ffffff;
          --nav-height: 68px;
        }

        /* ── Base Nav ── */
        .nav-root {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          font-family: 'Sora', sans-serif;
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
          height: var(--nav-height);
        }

        .nav-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background: transparent;
          backdrop-filter: none;
          transition: all 0.3s ease;
          border-bottom: 1px solid transparent;
        }

        .nav-root.scrolled::before {
          background: rgba(255,255,255,0.96);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom-color: rgba(0,0,0,0.06);
          box-shadow: 0 2px 20px rgba(0,0,0,0.06);
        }

        .nav-inner {
          position: relative;
          z-index: 1;
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 28px;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        /* ── Logo ── */
        .nav-logo {
          font-size: 20px;
          font-weight: 700;
          text-decoration: none;
          letter-spacing: -0.05em;
          display: flex;
          align-items: center;
          gap: 0;
          transition: opacity 0.2s;
          flex-shrink: 0;
        }
        .nav-logo:hover { opacity: 0.85; }
        .logo-word { color: #ffffff; transition: color 0.3s ease; }
        .nav-root.scrolled .logo-word { color: var(--text-primary); }
        .logo-accent { color: var(--brand); }
        .logo-dot {
          width: 6px; height: 6px;
          background: var(--brand);
          border-radius: 50%;
          display: inline-block;
          margin-left: 2px;
          margin-bottom: 8px;
          flex-shrink: 0;
        }

        /* ── Nav Links ── */
        .nav-links {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .nav-link {
          font-size: 13.5px;
          font-weight: 500;
          color: rgba(255,255,255,0.85);
          text-decoration: none;
          padding: 7px 14px;
          border-radius: 8px;
          transition: color 0.3s ease, background 0.2s;
          letter-spacing: -0.01em;
        }
        .nav-link:hover { color: var(--brand); background: var(--brand-light); }
        .nav-root.scrolled .nav-link { color: var(--text-secondary); }
        .nav-root.scrolled .nav-link:hover { color: var(--brand); background: var(--brand-light); }

        /* ── Right Actions ── */
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        /* ── Icon Buttons (Orders / Cart) ── */
        .nav-icon-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: rgba(255,255,255,0.15);
          border: 1.5px solid rgba(255,255,255,0.3);
          color: white;
          text-decoration: none;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .nav-icon-btn svg { width: 17px; height: 17px; stroke: currentColor; stroke-width: 1.8; fill: none; }
        .nav-icon-btn:hover {
          background: var(--brand);
          border-color: var(--brand);
          color: white;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(249,115,22,0.45);
        }
        .nav-root.scrolled .nav-icon-btn {
          background: var(--brand-light);
          border-color: var(--brand-muted);
          color: var(--brand);
        }
        .nav-root.scrolled .nav-icon-btn:hover {
          background: var(--brand);
          border-color: var(--brand);
          color: white;
        }

        .badge {
          position: absolute;
          top: -6px; right: -6px;
          min-width: 18px; height: 18px;
          padding: 0 4px;
          background: var(--brand);
          color: white;
          font-size: 10px;
          font-weight: 700;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid white;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
        }
        .nav-icon-btn:hover .badge {
          background: white;
          color: var(--brand);
          border-color: var(--brand);
        }

        /* ── Sign In Button ── */
        .btn-signin {
          display: flex;
          align-items: center;
          gap: 7px;
          font-family: 'Sora', sans-serif;
          font-size: 13.5px;
          font-weight: 600;
          text-decoration: none;
          padding: 9px 18px;
          border-radius: 5px;
          background: var(--brand);
          color: white;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          letter-spacing: -0.01em;
          box-shadow: 0 2px 10px rgba(249,115,22,0.3);
          white-space: nowrap;
        }
        .btn-signin:hover {
          background: var(--brand-dark);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(249,115,22,0.4);
        }
        .btn-signin svg { width: 15px; height: 15px; stroke: white; stroke-width: 2; fill: none; flex-shrink: 0; }

        /* ── Avatar Button ── */
        .avatar-trigger {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 4px 12px 4px 4px;
          border-radius: 100px;
          background: var(--brand-light);
          border: 1.5px solid var(--brand-muted);
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
        }
        .avatar-trigger:hover {
          border-color: var(--brand);
          background: white;
          box-shadow: 0 2px 12px rgba(249,115,22,0.15);
        }

        .avatar-ring {
          width: 30px; height: 30px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
          background: var(--brand);
          display: flex; align-items: center; justify-content: center;
        }
        .avatar-ring img {
          width: 100%; height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }
        .avatar-initials {
          color: white;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.02em;
        }

        .trigger-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          max-width: 90px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .trigger-chevron {
          display: flex;
          align-items: center;
          color: var(--text-muted);
          transition: transform 0.2s;
        }
        .trigger-chevron.open { transform: rotate(180deg); }
        .trigger-chevron svg { width: 13px; height: 13px; stroke: currentColor; stroke-width: 2.2; fill: none; }

        /* ── Dropdown ── */
        .dropdown-wrap {
          position: relative;
        }
        .dropdown-panel {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 260px;
          background: white;
          border-radius: 18px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06);
          border: 1px solid var(--border);
          overflow: hidden;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-8px) scale(0.98);
          transform-origin: top right;
          transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
          z-index: 200;
        }
        .dropdown-panel.open {
          opacity: 1;
          visibility: visible;
          transform: translateY(0) scale(1);
        }

        /* Dropdown hero card */
        .dropdown-hero {
          background: linear-gradient(135deg, #fff7f2 0%, #ffe8d6 100%);
          padding: 18px 18px 16px;
          display: flex;
          align-items: center;
          gap: 14px;
          border-bottom: 1px solid rgba(249,115,22,0.1);
        }
        .dropdown-avatar {
          width: 52px; height: 52px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
          background: var(--brand);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 14px rgba(249,115,22,0.35);
          border: 3px solid white;
        }
        .dropdown-avatar img {
          width: 100%; height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }
        .dropdown-avatar-initials {
          color: white;
          font-size: 19px;
          font-weight: 700;
        }
        .dropdown-user-info {
          flex: 1;
          min-width: 0;
        }
        .dropdown-fullname {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.02em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .dropdown-email {
          font-size: 11.5px;
          color: var(--text-muted);
          margin-top: 2px;
          font-family: 'DM Sans', sans-serif;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .dropdown-badge {
          margin-top: 6px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          font-weight: 600;
          color: var(--brand);
          background: white;
          padding: 2px 7px;
          border-radius: 20px;
          border: 1px solid var(--brand-muted);
          letter-spacing: 0.02em;
          text-transform: uppercase;
        }
        .dropdown-badge::before {
          content: '';
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #22c55e;
          display: block;
        }

        /* Dropdown items */
        .dropdown-body {
          padding: 8px;
        }
        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 10px 12px;
          border-radius: 10px;
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 13.5px;
          font-weight: 500;
          transition: all 0.15s ease;
          cursor: pointer;
          width: 100%;
          background: none;
          border: none;
          text-align: left;
          font-family: 'Sora', sans-serif;
          letter-spacing: -0.01em;
        }
        .dropdown-item:hover {
          background: var(--brand-light);
          color: var(--brand);
        }
        .dropdown-item-icon {
          width: 30px; height: 30px;
          border-radius: 8px;
          background: #f3f4f6;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: background 0.15s;
        }
        .dropdown-item:hover .dropdown-item-icon {
          background: var(--brand-muted);
        }
        .dropdown-item-icon svg { width: 14px; height: 14px; stroke: currentColor; stroke-width: 1.8; fill: none; }

        .dropdown-sep {
          height: 1px;
          background: var(--border);
          margin: 4px 8px;
        }

        .dropdown-item.danger { color: #ef4444; }
        .dropdown-item.danger:hover { background: #fef2f2; color: #dc2626; }
        .dropdown-item.danger .dropdown-item-icon { background: #fee2e2; }
        .dropdown-item.danger:hover .dropdown-item-icon { background: #fecaca; }

        /* ── Mobile Hamburger ── */
        .ham-btn {
          display: none;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 40px; height: 40px;
          border-radius: 11px;
          background: var(--brand-light);
          border: 1.5px solid var(--brand-muted);
          gap: 4.5px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .ham-btn:hover {
          background: var(--brand);
          border-color: var(--brand);
        }
        .ham-btn:hover .hbar { background: white; }

        .hbar {
          width: 18px; height: 1.6px;
          background: var(--brand);
          border-radius: 2px;
          transition: all 0.3s ease;
          transform-origin: center;
        }
        .ham-btn.open .hbar:nth-child(1) { transform: translateY(6.1px) rotate(45deg); }
        .ham-btn.open .hbar:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .ham-btn.open .hbar:nth-child(3) { transform: translateY(-6.1px) rotate(-45deg); }
        .ham-btn.open { background: var(--brand); border-color: var(--brand); }
        .ham-btn.open .hbar { background: white; }

        /* ── Mobile Menu ── */
        .mobile-sheet {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 99;
          background: white;
          padding-top: calc(var(--nav-height) + 8px);
          padding-bottom: 28px;
          box-shadow: 0 16px 48px rgba(0,0,0,0.12);
          transform: translateY(-110%);
          transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
        }
        .mobile-sheet.open { transform: translateY(0); }

        .mobile-links { padding: 12px 20px 0; }

        .mobile-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          text-decoration: none;
          padding: 15px 16px;
          border-radius: 12px;
          transition: all 0.2s;
          letter-spacing: -0.02em;
        }
        .mobile-link:hover { color: var(--brand); background: var(--brand-light); }
        .mobile-link svg { width: 16px; height: 16px; stroke: var(--text-muted); stroke-width: 2; fill: none; }
        .mobile-link:hover svg { stroke: var(--brand); }

        .mobile-divider {
          height: 1px;
          background: var(--border);
          margin: 12px 20px;
        }

        /* Mobile user card */
        .mobile-user-card {
          margin: 0 20px;
          padding: 16px;
          background: linear-gradient(135deg, #fff7f2, #ffe8d6);
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid var(--brand-muted);
        }
        .mobile-user-avatar {
          width: 44px; height: 44px;
          border-radius: 50%;
          overflow: hidden;
          background: var(--brand);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 3px 10px rgba(249,115,22,0.3);
          border: 2.5px solid white;
        }
        .mobile-user-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
        .mobile-user-avatar-initials { color: white; font-size: 16px; font-weight: 700; }
        .mobile-user-name { font-size: 14px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em; }
        .mobile-user-email { font-size: 11.5px; color: var(--text-muted); font-family: 'DM Sans', sans-serif; }

        .mobile-actions { padding: 8px 20px 0; display: flex; flex-direction: column; gap: 4px; }
        .mobile-action-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 13px 16px;
          border-radius: 12px;
          font-size: 14.5px;
          font-weight: 600;
          color: var(--text-secondary);
          text-decoration: none;
          transition: all 0.2s;
          background: none;
          border: none;
          cursor: pointer;
          width: 100%;
          text-align: left;
          font-family: 'Sora', sans-serif;
        }
        .mobile-action-btn svg { width: 17px; height: 17px; stroke: currentColor; stroke-width: 1.8; fill: none; }
        .mobile-action-btn:hover { background: var(--brand-light); color: var(--brand); }
        .mobile-action-btn.danger { color: #ef4444; }
        .mobile-action-btn.danger:hover { background: #fef2f2; color: #dc2626; }

        .mobile-signin-row {
          padding: 16px 20px 0;
          display: flex; gap: 8px;
        }
        .mobile-signin-btn {
          flex: 1;
          display: flex; align-items: center; justify-content: center; gap: 7px;
          font-family: 'Sora', sans-serif;
          font-size: 14.5px; font-weight: 600;
          text-decoration: none;
          padding: 13px;
          border-radius: 14px;
          background: var(--brand);
          color: white;
          border: none;
          box-shadow: 0 4px 14px rgba(249,115,22,0.3);
          transition: all 0.2s;
        }
        .mobile-signin-btn:hover { background: var(--brand-dark); }
        .mobile-signin-btn svg { width: 16px; height: 16px; stroke: white; fill: none; stroke-width: 2; }

        @media (max-width: 767px) {
          .nav-links { display: none !important; }
          .btn-signin { display: none !important; }
          .ham-btn { display: flex !important; }
        }
        @media (min-width: 768px) {
          .ham-btn { display: none !important; }
        }
      `}</style>

      <nav className={`nav-root${scrolled ? " scrolled" : ""}`}>
        <div className="nav-inner">

          {/* Logo */}
          <Link href="/" className="nav-logo">
            <span className="logo-word">Cart</span>
            <span className="logo-accent">ify</span>
            <span className="logo-dot" />
          </Link>

          {/* Desktop Nav Links */}
          <div className="nav-links">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="nav-link">{l.label}</Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="nav-actions">

            {user && (
              <>
                {/* Orders */}
                <Link href={routes.orders} className="nav-icon-btn" aria-label="Orders" title="Orders">
                  <svg viewBox="0 0 24 24">
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                    <rect x="9" y="3" width="6" height="4" rx="1"/>
                    <line x1="9" y1="12" x2="15" y2="12"/>
                    <line x1="9" y1="16" x2="13" y2="16"/>
                  </svg>
                </Link>

                {/* Cart with badge */}
                <Link href="/cart" className="nav-icon-btn" aria-label="Cart" title="Cart">
                  <svg viewBox="0 0 24 24">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 01-8 0"/>
                  </svg>
                  {cartCount > 0 && (
                    <span className="badge">{cartCount > 99 ? '99+' : cartCount}</span>
                  )}
                </Link>
              </>
            )}

            {/* Authenticated: avatar trigger + dropdown */}
            {user ? (
              <div className="dropdown-wrap" ref={dropdownRef}>
                <button
                  className="avatar-trigger"
                  onClick={() => setDropdownOpen((v) => !v)}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  <div className="avatar-ring">
                    {avatarUrl
                      ? <img src={avatarUrl} alt="Profile photo" />
                      : <span className="avatar-initials">{getUserInitials()}</span>
                    }
                  </div>
                  <span className="trigger-label hidden md:block">{getDisplayName().split(" ")[0]}</span>
                  <span className={`trigger-chevron${dropdownOpen ? " open" : ""} hidden md:flex`}>
                    <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
                  </span>
                </button>

                {/* Dropdown Panel */}
                <div className={`dropdown-panel${dropdownOpen ? " open" : ""}`} role="menu">

                  {/* Hero card with avatar */}
                  <div className="dropdown-hero">
                    <div className="dropdown-avatar">
                      {avatarUrl
                        ? <img src={avatarUrl} alt="Profile photo" />
                        : <span className="dropdown-avatar-initials">{getUserInitials()}</span>
                      }
                    </div>
                    <div className="dropdown-user-info">
                      <div className="dropdown-fullname">{getDisplayName()}</div>
                      <div className="dropdown-email">{user?.email}</div>
                      <div className="dropdown-badge">Active member</div>
                    </div>
                  </div>

                  <div className="dropdown-body">
                    <Link href={routes.profile} className="dropdown-item" onClick={() => setDropdownOpen(false)} role="menuitem">
                      <span className="dropdown-item-icon">
                        <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      </span>
                      My Profile
                    </Link>

                    <Link href={routes.orders} className="dropdown-item" onClick={() => setDropdownOpen(false)} role="menuitem">
                      <span className="dropdown-item-icon">
                        <svg viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>
                      </span>
                      My Orders
                    </Link>

                    <Link href="/cart" className="dropdown-item" onClick={() => setDropdownOpen(false)} role="menuitem">
                      <span className="dropdown-item-icon">
                        <svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                      </span>
                      My Cart {cartCount > 0 && `(${cartCount})`}
                    </Link>

                    <div className="dropdown-sep" />

                    <button className="dropdown-item danger" onClick={handleSignOut} role="menuitem">
                      <span className="dropdown-item-icon">
                        <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      </span>
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Sign In button — always visible on desktop */
              <Link href={routes.login} className="btn-signin">
                <svg viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                Sign In
              </Link>
            )}

            {/* Mobile Hamburger */}
            <button
              className={`ham-btn${mobileOpen ? " open" : ""}`}
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <span className="hbar" />
              <span className="hbar" />
              <span className="hbar" />
            </button>

          </div>
        </div>
      </nav>

      {/* Mobile Sheet */}
      <div className={`mobile-sheet${mobileOpen ? " open" : ""}`}>

        {/* User card or links */}
        {user ? (
          <>
            <div className="mobile-user-card">
              <div className="mobile-user-avatar">
                {avatarUrl
                  ? <img src={avatarUrl} alt="Profile" />
                  : <span className="mobile-user-avatar-initials">{getUserInitials()}</span>
                }
              </div>
              <div>
                <div className="mobile-user-name">{getDisplayName()}</div>
                <div className="mobile-user-email">{user?.email}</div>
              </div>
            </div>
          </>
        ) : null}

        <div className="mobile-links">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="mobile-link" onClick={() => setMobileOpen(false)}>
              {l.label}
              <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
            </Link>
          ))}
        </div>

        {user ? (
          <>
            <div className="mobile-divider" />
            <div className="mobile-actions">
              <Link href="/dashboard" className="mobile-action-btn" onClick={() => setMobileOpen(false)}>
                <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                My Profile
              </Link>
              <Link href={routes.orders} className="mobile-action-btn" onClick={() => setMobileOpen(false)}>
                <svg viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>
                My Orders
              </Link>
              <Link href="/cart" className="mobile-action-btn" onClick={() => setMobileOpen(false)}>
                <svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                My Cart {cartCount > 0 && `(${cartCount})`}
              </Link>
              <div className="mobile-divider" />
              <button className="mobile-action-btn danger" onClick={handleSignOut}>
                <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Sign Out
              </button>
            </div>
          </>
        ) : (
          <div className="mobile-signin-row">
            <Link href={routes.login} className="mobile-signin-btn" onClick={() => setMobileOpen(false)}>
              <svg viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
              Sign In to Your Account
            </Link>
          </div>
        )}
      </div>

      {/* Spacer */}
      <div style={{ height: "var(--nav-height)" }} />
    </>
  );
}