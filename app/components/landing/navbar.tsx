"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, signOut } from "@/app/lib/auth";
import { supabase } from "@/app/lib/supabase";
import { routes } from "../../routes";

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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setAvatarUrl(currentUser?.profile?.avatar_url || null);
    };

    loadUser();

    // Subscribe to auth state changes so UI updates immediately after sign-in/sign-out
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, _session) => {
      loadUser();
    });

    // Listen for profile updates triggered by client-side avatar uploads
    const onProfileUpdated = () => loadUser();
    window.addEventListener('user-profile-updated', onProfileUpdated);

    return () => {
      // Remove DOM event listener
      try { window.removeEventListener('user-profile-updated', onProfileUpdated); } catch (e) {}

      // Guarded unsubscribe for different Supabase client shapes
      try {
        // v2 returns { data: { subscription } }
        // attempt both possible unsubscribe accessors
        // @ts-ignore
        authListener?.subscription?.unsubscribe?.();
        // @ts-ignore
        authListener?.unsubscribe?.();
      } catch (e) {
        // ignore
      }
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    setDropdownOpen(false);
    router.push("/");
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user) return "U";
    const firstName = user?.profile?.first_name || user?.user_metadata?.first_name || "";
    const lastName = user?.profile?.last_name || user?.user_metadata?.last_name || "";
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (firstName) return firstName.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return "U";
  };

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

        /* User Avatar Button */
        .avatar-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #f97316;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          overflow: hidden;
        }
        .avatar-btn:hover {
          transform: scale(1.05);
          opacity: 0.9;
        }
        .avatar-img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }
        .avatar-placeholder {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: #f97316;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 16px;
        }

        /* Dropdown Menu */
        .dropdown-menu {
          position: absolute;
          top: 50px;
          right: 0;
          width: 180px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          overflow: hidden;
          z-index: 100;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          transition: all 0.2s ease;
        }
        .dropdown-menu.open {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }
        .dropdown-header {
          padding: 12px 16px;
          border-bottom: 1px solid #f0f0f0;
        }
        .dropdown-name {
          font-size: 13px;
          font-weight: 600;
          color: #1a1a1a;
        }
        .dropdown-email {
          font-size: 11px;
          color: #9ca3af;
          margin-top: 2px;
        }
        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          color: #4b4b4b;
          text-decoration: none;
          transition: background 0.2s;
          cursor: pointer;
          font-size: 13px;
        }
        .dropdown-item:hover {
          background: #f9fafb;
          color: #f97316;
        }
        .dropdown-divider {
          height: 1px;
          background: #f0f0f0;
          margin: 4px 0;
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

          {/* Logo */}
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
          <div className="flex items-center gap-3">
            {/* Orders Icon - Only show when logged in */}
            {user && (
              <Link href={routes.orders} className="icon-btn" aria-label="Orders">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 7h-4.18A3 3 0 0 0 16 5.18V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v1.18A3 3 0 0 0 8.18 7H4"/>
                  <path d="M4 7v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7"/>
                  <line x1="8" y1="11" x2="16" y2="11"/>
                  <line x1="8" y1="15" x2="16" y2="15"/>
                </svg>
              </Link>
            )}

            {/* Cart Icon - Only show when logged in */}
            {user && (
              <Link href="/cart" className="icon-btn" aria-label="Cart">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                <span className="cart-badge">0</span>
              </Link>
            )}

            {/* User Section - Avatar only, no name */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  className="avatar-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="avatar-img" />
                  ) : (
                    <div className="avatar-placeholder">
                      {getUserInitials()}
                    </div>
                  )}
                </button>

                {/* Dropdown Menu - Only Profile and Logout */}
                <div className={`dropdown-menu ${dropdownOpen ? "open" : ""}`}>
                  <div className="dropdown-header">
                    <div className="dropdown-name">
                      {user?.profile?.first_name || user?.user_metadata?.first_name || "User"} 
                      {user?.profile?.last_name ? ` ${user.profile.last_name}` : user?.user_metadata?.last_name ? ` ${user.user_metadata.last_name}` : ""}
                    </div>
                    <div className="dropdown-email">{user?.email}</div>
                  </div>
                  
                  <Link href="/dashboard" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <line x1="3" y1="9" x2="21" y2="9"/>
                      <line x1="9" y1="21" x2="9" y2="9"/>
                    </svg>
                    Profile
                  </Link>
                  
                  <div className="dropdown-divider" />
                  
                  <button className="dropdown-item w-full text-left" onClick={handleSignOut}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link href={routes.login} className="btn-signin hidden md:block">Sign In</Link>
            )}

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
        
        {user ? (
          <>
            <Link href="/orders" className="mobile-link" onClick={() => setMobileOpen(false)}>
              Orders
            </Link>
            <div className="py-4 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold">
                    {getUserInitials()}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-gray-900">
                    {user?.profile?.first_name || user?.user_metadata?.first_name || "User"} 
                    {user?.profile?.last_name ? ` ${user.profile.last_name}` : user?.user_metadata?.last_name ? ` ${user.user_metadata.last_name}` : ""}
                  </div>
                  <div className="text-xs text-gray-500">{user?.email}</div>
                </div>
              </div>
              <Link href="/dashboard" className="block text-sm text-gray-600 py-2" onClick={() => setMobileOpen(false)}>
                Profile
              </Link>
              <button onClick={handleSignOut} className="block text-sm text-red-600 py-2 w-full text-left">
                Logout
              </button>
            </div>
          </>
        ) : (
          <div className="flex gap-3 mt-6">
            <Link href={routes.login} className="btn-signin flex-1 text-center" style={{ border: "1px solid #e5e7eb", borderRadius: 100 }} onClick={() => setMobileOpen(false)}>
              Sign In
            </Link>
          </div>
        )}
      </div>

      {/* Spacer */}
      <div style={{ height: 64 }} />
    </>
  );
}