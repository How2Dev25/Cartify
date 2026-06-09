// app/admin/components/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getCurrentUser, signOut, isSignedIn, isAdmin } from "@/app/lib/auth";


interface AdminSidebarProps {
  sidebarOpen: boolean;
  menuItems: { id: string; label: string; href: string }[];
}

export function AdminSidebar({ sidebarOpen, menuItems }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const checkAccess = async () => {
      const signedIn = await isSignedIn();
      const admin = await isAdmin();

      if (!signedIn || !admin) {
        router.push("/");
      }
    };

    checkAccess();
  }, [router]);

  useEffect(() => {
    const fetchAdminUser = async () => {
      const user = await getCurrentUser();
      if (user) setAdminUser(user);
      setLoading(false);
    };
    fetchAdminUser();
  }, []);

  const isActive = (href: string) => {
    if (href === "/admin" && pathname === "/admin") return true;
    if (href !== "/admin" && pathname.startsWith(href)) return true;
    return false;
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  const getInitials = () => {
    if (!adminUser) return "A";
    const firstName = adminUser?.profile?.first_name || adminUser?.user_metadata?.first_name || "";
    const lastName = adminUser?.profile?.last_name || adminUser?.user_metadata?.last_name || "";
    if (firstName && lastName) return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    if (firstName) return firstName.charAt(0).toUpperCase();
    if (adminUser?.email) return adminUser.email.charAt(0).toUpperCase();
    return "A";
  };

  const getFullName = () => {
    if (!adminUser) return "Administrator";
    const firstName = adminUser?.profile?.first_name || adminUser?.user_metadata?.first_name || "";
    const lastName = adminUser?.profile?.last_name || adminUser?.user_metadata?.last_name || "";
    if (firstName && lastName) return `${firstName} ${lastName}`;
    if (firstName) return firstName;
    return "Administrator";
  };

  const avatarUrl = adminUser?.profile?.avatar_url || null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=DM+Sans:wght@400;500&display=swap');

        .asb-root {
          position: fixed;
          top: 0; left: 0;
          z-index: 40;
          height: 100vh;
          width: 256px;
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
          font-family: 'Sora', sans-serif;
        }
        .asb-root.closed { transform: translateX(-100%); }
        .asb-root.open   { transform: translateX(0); }

        .asb-inner {
          height: 100%;
          display: flex;
          flex-direction: column;
          background: #111827;
          border-right: 1px solid rgba(255,255,255,0.05);
        }

        /* ── Logo ── */
        .asb-logo {
          padding: 26px 24px 22px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          flex-shrink: 0;
        }
        .asb-logo-link {
          text-decoration: none;
          display: flex;
          align-items: baseline;
          gap: 0;
        }
        .asb-logo-word { font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.05em; }
        .asb-logo-accent { font-size: 22px; font-weight: 700; color: #f97316; letter-spacing: -0.05em; }
        .asb-logo-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #f97316;
          display: inline-block;
          margin-left: 2px;
          margin-bottom: 8px;
        }
        .asb-logo-tag {
          margin-top: 6px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 500;
          color: rgba(255,255,255,0.35);
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .asb-logo-tag::before {
          content: '';
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #22c55e;
          display: block;
          box-shadow: 0 0 6px #22c55e;
          animation: asb-blink 2.5s ease-in-out infinite;
        }
        @keyframes asb-blink { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }

        /* ── Nav Section Label ── */
        .asb-section-label {
          padding: 20px 24px 8px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.25);
          flex-shrink: 0;
        }

        /* ── Nav ── */
        .asb-nav {
          flex: 1;
          overflow-y: auto;
          padding: 0 12px 12px;
          scrollbar-width: none;
        }
        .asb-nav::-webkit-scrollbar { display: none; }

        .asb-nav-list { list-style: none; display: flex; flex-direction: column; gap: 2px; }

        .asb-nav-item {
          opacity: 0;
          animation: asb-slide-in 0.3s ease forwards;
        }
        @keyframes asb-slide-in { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }

        .asb-nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 10px;
          text-decoration: none;
          font-size: 13.5px;
          font-weight: 500;
          color: rgba(255,255,255,0.5);
          transition: all 0.18s ease;
          position: relative;
          letter-spacing: -0.01em;
        }
        .asb-nav-link:hover {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.9);
        }
        .asb-nav-link.active {
          background: rgba(249,115,22,0.15);
          color: #f97316;
        }
        .asb-nav-link.active::before {
          content: '';
          position: absolute;
          left: 0; top: 50%;
          transform: translateY(-50%);
          width: 3px; height: 20px;
          background: #f97316;
          border-radius: 0 3px 3px 0;
        }

        /* pip indicator */
        .asb-nav-pip {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          flex-shrink: 0;
          transition: background 0.2s;
        }
        .asb-nav-link.active .asb-nav-pip { background: #f97316; }
        .asb-nav-link:hover .asb-nav-pip { background: rgba(255,255,255,0.4); }

        /* ── Divider ── */
        .asb-divider {
          height: 1px;
          background: rgba(255,255,255,0.07);
          margin: 8px 12px;
          flex-shrink: 0;
        }

        /* ── Profile Footer ── */
        .asb-footer {
          flex-shrink: 0;
          border-top: 1px solid rgba(255,255,255,0.07);
          padding: 16px 14px 20px;
        }

        /* Help button */
        .asb-help-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 9px 14px;
          border-radius: 10px;
          background: none;
          border: none;
          font-family: 'Sora', sans-serif;
          font-size: 13px; font-weight: 500;
          color: rgba(255,255,255,0.4);
          cursor: pointer;
          transition: all 0.18s;
          margin-bottom: 4px;
          letter-spacing: -0.01em;
        }
        .asb-help-btn svg { width: 14px; height: 14px; stroke: currentColor; stroke-width: 1.8; fill: none; flex-shrink: 0; }
        .asb-help-btn:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.7); }

        /* Logout button */
        .asb-logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 9px 14px;
          border-radius: 10px;
          background: none;
          border: none;
          font-family: 'Sora', sans-serif;
          font-size: 13px; font-weight: 500;
          color: rgba(239,68,68,0.7);
          cursor: pointer;
          transition: all 0.18s;
          margin-bottom: 14px;
          letter-spacing: -0.01em;
        }
        .asb-logout-btn svg { width: 14px; height: 14px; stroke: currentColor; stroke-width: 1.8; fill: none; flex-shrink: 0; }
        .asb-logout-btn:hover { background: rgba(239,68,68,0.1); color: #ef4444; }

        /* Profile card */
        .asb-profile-card {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 12px 14px;
          border-radius: 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          text-decoration: none;
          transition: all 0.2s;
        }
        .asb-profile-card:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(249,115,22,0.3);
        }

        .asb-avatar {
          width: 36px; height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f97316, #fb923c);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700; color: white;
          overflow: hidden;
          flex-shrink: 0;
          box-shadow: 0 3px 10px rgba(249,115,22,0.35);
        }
        .asb-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }

        .asb-profile-info { flex: 1; min-width: 0; }
        .asb-profile-name {
          font-size: 12.5px; font-weight: 600;
          color: rgba(255,255,255,0.9);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          letter-spacing: -0.02em;
          display: flex; align-items: center; gap: 6px;
        }
        .asb-admin-badge {
          font-size: 9px; font-weight: 700;
          background: rgba(249,115,22,0.2);
          color: #f97316;
          border: 1px solid rgba(249,115,22,0.3);
          padding: 1px 6px;
          border-radius: 10px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          flex-shrink: 0;
        }
        .asb-profile-email {
          font-size: 11px;
          color: rgba(255,255,255,0.3);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          margin-top: 2px;
          font-family: 'DM Sans', sans-serif;
        }

        .asb-profile-arrow {
          color: rgba(255,255,255,0.2);
          flex-shrink: 0;
          transition: color 0.2s;
        }
        .asb-profile-card:hover .asb-profile-arrow { color: rgba(249,115,22,0.6); }
        .asb-profile-arrow svg { width: 13px; height: 13px; stroke: currentColor; stroke-width: 2; fill: none; }

        /* Version */
        .asb-version {
          text-align: center;
          font-size: 10px;
          color: rgba(255,255,255,0.15);
          margin-top: 12px;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.02em;
        }

        /* Loading skeleton */
        .asb-skeleton {
          background: rgba(255,255,255,0.07);
          border-radius: 6px;
          animation: asb-shimmer 1.4s ease-in-out infinite;
        }
        @keyframes asb-shimmer { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }

        /* Overlay */
        .asb-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          z-index: 30;
          backdrop-filter: blur(2px);
          animation: asb-fade-in 0.2s ease;
        }
        @keyframes asb-fade-in { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      <aside className={`asb-root ${sidebarOpen ? "open" : "closed"}`}>
        <div className="asb-inner">

          {/* ── Logo ── */}
          <div className="asb-logo">
            <Link href="/" className="asb-logo-link">
              <span className="asb-logo-word">Cart</span>
              <span className="asb-logo-accent">ify</span>
              <span className="asb-logo-dot" />
            </Link>
            <div className="asb-logo-tag">Admin Dashboard</div>
          </div>

          {/* ── Nav section label ── */}
          <div className="asb-section-label">Main Menu</div>

          {/* ── Navigation ── */}
          <nav className="asb-nav">
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "0 2px" }}>
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="asb-skeleton" style={{ height: 40, borderRadius: 10 }} />
                ))}
              </div>
            ) : (
              <ul className="asb-nav-list">
                {menuItems.map((item, index) => {
                  const active = isActive(item.href);
                  return (
                    <li
                      key={item.id}
                      className="asb-nav-item"
                      style={{ animationDelay: `${index * 45}ms` }}
                    >
                      <Link
                        href={item.href}
                        className={`asb-nav-link${active ? " active" : ""}`}
                      >
                        <span className="asb-nav-pip" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </nav>

          {/* ── Footer ── */}
          <div className="asb-footer">
            {/* Help */}
            <button className="asb-help-btn" onClick={() => window.open("/support", "_blank")}>
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Help & Support
            </button>

            {/* Logout */}
            <button className="asb-logout-btn" onClick={handleLogout}>
              <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign Out
            </button>

            {/* Divider */}
            <div className="asb-divider" style={{ margin: "0 0 12px" }} />

            {/* Profile card */}
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px" }}>
                <div className="asb-skeleton" style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0 }} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div className="asb-skeleton" style={{ height: 12, width: "60%", borderRadius: 4 }} />
                  <div className="asb-skeleton" style={{ height: 10, width: "80%", borderRadius: 4 }} />
                </div>
              </div>
            ) : (
              <Link href="/dashboard" className="asb-profile-card">
                <div className="asb-avatar">
                  {avatarUrl
                    ? <img src={avatarUrl} alt={getFullName()} />
                    : getInitials()
                  }
                </div>
                <div className="asb-profile-info">
                  <div className="asb-profile-name">
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {getFullName()}
                    </span>
                    <span className="asb-admin-badge">Admin</span>
                  </div>
                  <div className="asb-profile-email">{adminUser?.email || "admin@cartify.com"}</div>
                </div>
                <div className="asb-profile-arrow">
                  <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              </Link>
            )}

            <div className="asb-version">v2.0.0 · © 2025 Cartify</div>
          </div>

        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="asb-overlay lg:hidden"
          onClick={() => document.dispatchEvent(new Event("close-sidebar"))}
        />
      )}
    </>
  );
}