"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, uploadAvatarLocally } from "@/app/lib/auth";
import { supabase } from "@/app/lib/supabase";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "address" | "security">("profile");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    birth_date: "",
    gender: "",
    address_line1: "",
    address_line2: "",
    city: "",
    province: "",
    postal_code: "",
    country: "",
  });

  useEffect(() => {
    const load = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) { router.push("/login"); return; }
      setUser(currentUser);
      const p = currentUser.profile || {};
      setForm({
        first_name: p.first_name || currentUser.user_metadata?.first_name || "",
        last_name: p.last_name || currentUser.user_metadata?.last_name || "",
        email: currentUser.email || "",
        phone: p.phone || "",
        birth_date: p.birth_date || "",
        gender: p.gender || "",
        address_line1: p.address_line1 || "",
        address_line2: p.address_line2 || "",
        city: p.city || "",
        province: p.province || "",
        postal_code: p.postal_code || "",
        country: p.country || "",
      });
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("users")
      .update({
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        birth_date: form.birth_date || null,
        gender: form.gender,
        address_line1: form.address_line1,
        address_line2: form.address_line2,
        city: form.city,
        province: form.province,
        postal_code: form.postal_code,
        country: form.country,
      })
      .eq("id", user.id);

    setSaving(false);
    if (!error) {
      setSaveSuccess(true);
      setEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
      const updated = await getCurrentUser();
      if (updated) setUser(updated);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setAvatarUploading(true);
    await uploadAvatarLocally(user.id, file);
    const updated = await getCurrentUser();
    if (updated) setUser(updated);
    setAvatarUploading(false);
  };

  const getInitials = () => {
    const f = form.first_name.charAt(0).toUpperCase();
    const l = form.last_name.charAt(0).toUpperCase();
    return f && l ? `${f}${l}` : f || user?.email?.charAt(0).toUpperCase() || "U";
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    try { return new Date(dateStr).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }); }
    catch { return dateStr; }
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fafafa", fontFamily: "'Sora', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap');`}</style>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 44, height: 44, borderRadius: "50%", border: "3px solid #ffe8d6", borderTopColor: "#f97316", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
        <p style={{ color: "#9ca3af", fontSize: 14 }}>Loading your profile…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  const avatarUrl = user?.profile?.avatar_url || null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Sans:ital,wght@0,400;0,500;1,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --brand: #f97316;
          --brand-dark: #ea6d10;
          --brand-light: #fff7f2;
          --brand-muted: #ffe8d6;
          --text-primary: #111827;
          --text-secondary: #4b5563;
          --text-muted: #9ca3af;
          --border: #e5e7eb;
          --bg: #f8f7f5;
          --surface: #ffffff;
          --radius: 16px;
          --radius-sm: 10px;
        }

        .profile-page {
          min-height: 100vh;
          background: var(--bg);
          font-family: 'Sora', sans-serif;
          padding-bottom: 60px;
        }

        /* ── Hero Banner ── */
        .profile-banner {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%);
          padding: 48px 0 80px;
          position: relative;
          overflow: hidden;
        }
        .profile-banner::before {
          content: '';
          position: absolute;
          top: -60px; right: -60px;
          width: 300px; height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(249,115,22,0.25) 0%, transparent 70%);
        }
        .profile-banner::after {
          content: '';
          position: absolute;
          bottom: -80px; left: 10%;
          width: 400px; height: 200px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%);
        }
        .banner-inner {
          max-width: 960px;
          margin: 0 auto;
          padding: 0 24px;
          position: relative;
          z-index: 1;
          display: flex;
          align-items: flex-end;
          gap: 28px;
        }

        /* Avatar */
        .avatar-wrap {
          position: relative;
          flex-shrink: 0;
        }
        .avatar-circle {
          width: 100px; height: 100px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--brand) 0%, #fb923c 100%);
          display: flex; align-items: center; justify-content: center;
          font-size: 36px; font-weight: 700; color: white;
          border: 4px solid rgba(255,255,255,0.2);
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(249,115,22,0.4);
          transition: transform 0.2s;
        }
        .avatar-circle img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
        .avatar-upload-btn {
          position: absolute;
          bottom: 2px; right: 2px;
          width: 28px; height: 28px;
          border-radius: 50%;
          background: var(--brand);
          border: 2.5px solid white;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .avatar-upload-btn:hover { background: var(--brand-dark); transform: scale(1.1); }
        .avatar-upload-btn svg { width: 12px; height: 12px; stroke: white; stroke-width: 2.2; fill: none; }
        .avatar-uploading { animation: pulse 1s ease-in-out infinite; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.6; } }

        .banner-info { padding-bottom: 4px; }
        .banner-name {
          font-size: 26px; font-weight: 700;
          color: white;
          letter-spacing: -0.04em;
          line-height: 1.2;
        }
        .banner-email {
          font-size: 13px;
          color: rgba(255,255,255,0.55);
          margin-top: 5px;
          font-family: 'DM Sans', sans-serif;
        }
        .banner-role {
          margin-top: 10px;
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(249,115,22,0.2);
          border: 1px solid rgba(249,115,22,0.35);
          color: #fb923c;
          font-size: 11px; font-weight: 600;
          padding: 4px 10px;
          border-radius: 20px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .banner-role::before {
          content: ''; width: 6px; height: 6px;
          border-radius: 50%;
          background: #22c55e;
          display: block;
        }

        /* ── Main Content ── */
        .profile-content {
          max-width: 960px;
          margin: -36px auto 0;
          padding: 0 24px;
          position: relative;
          z-index: 2;
        }

        /* ── Tabs ── */
        .tabs-bar {
          display: flex;
          gap: 4px;
          background: white;
          border-radius: var(--radius);
          padding: 6px;
          margin-bottom: 20px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          border: 1px solid var(--border);
        }
        .tab-btn {
          flex: 1;
          display: flex; align-items: center; justify-content: center; gap: 7px;
          padding: 10px 16px;
          border-radius: 10px;
          border: none;
          background: none;
          font-family: 'Sora', sans-serif;
          font-size: 13px; font-weight: 600;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: -0.01em;
          white-space: nowrap;
        }
        .tab-btn svg { width: 15px; height: 15px; stroke: currentColor; stroke-width: 1.8; fill: none; flex-shrink: 0; }
        .tab-btn:hover { color: var(--brand); background: var(--brand-light); }
        .tab-btn.active {
          background: var(--brand);
          color: white;
          box-shadow: 0 3px 10px rgba(249,115,22,0.35);
        }
        .tab-btn.active:hover { background: var(--brand); color: white; }

        /* ── Card ── */
        .card {
          background: white;
          border-radius: var(--radius);
          border: 1px solid var(--border);
          box-shadow: 0 2px 16px rgba(0,0,0,0.05);
          overflow: hidden;
          animation: fadeUp 0.3s ease both;
        }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

        .card-header {
          padding: 22px 28px 18px;
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px;
        }
        .card-title {
          font-size: 15px; font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.03em;
          display: flex; align-items: center; gap: 9px;
        }
        .card-title-icon {
          width: 32px; height: 32px;
          border-radius: 9px;
          background: var(--brand-light);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .card-title-icon svg { width: 15px; height: 15px; stroke: var(--brand); stroke-width: 1.8; fill: none; }

        /* Edit / Save / Cancel buttons */
        .btn-edit {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 16px;
          border-radius: 100px;
          font-family: 'Sora', sans-serif;
          font-size: 12.5px; font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: 1.5px solid var(--border);
          background: white;
          color: var(--text-secondary);
          letter-spacing: -0.01em;
        }
        .btn-edit svg { width: 13px; height: 13px; stroke: currentColor; stroke-width: 2; fill: none; }
        .btn-edit:hover { border-color: var(--brand); color: var(--brand); background: var(--brand-light); }

        .btn-save {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 18px;
          border-radius: 100px;
          font-family: 'Sora', sans-serif;
          font-size: 12.5px; font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          background: var(--brand);
          color: white;
          box-shadow: 0 2px 10px rgba(249,115,22,0.3);
          letter-spacing: -0.01em;
        }
        .btn-save:hover { background: var(--brand-dark); transform: translateY(-1px); box-shadow: 0 4px 14px rgba(249,115,22,0.4); }
        .btn-save:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .btn-cancel {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 14px;
          border-radius: 100px;
          font-family: 'Sora', sans-serif;
          font-size: 12.5px; font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: 1.5px solid var(--border);
          background: white;
          color: var(--text-muted);
        }
        .btn-cancel:hover { color: #ef4444; border-color: #fca5a5; background: #fef2f2; }

        .header-actions { display: flex; align-items: center; gap: 8px; }

        /* ── Field Grid ── */
        .fields-grid {
          padding: 24px 28px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px 28px;
        }
        .fields-grid.single-col { grid-template-columns: 1fr; }
        @media (max-width: 600px) {
          .fields-grid { grid-template-columns: 1fr; padding: 20px; }
          .fields-grid.single-col { padding: 20px; }
          .banner-inner { flex-direction: column; align-items: flex-start; }
          .tabs-bar { overflow-x: auto; }
          .tab-btn { font-size: 12px; padding: 9px 12px; }
        }

        .field-group { display: flex; flex-direction: column; gap: 6px; }
        .field-group.full { grid-column: 1 / -1; }

        .field-label {
          font-size: 11px; font-weight: 600;
          color: var(--text-muted);
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }

        /* View mode */
        .field-value {
          font-size: 14px; font-weight: 500;
          color: var(--text-primary);
          padding: 10px 14px;
          background: #fafafa;
          border: 1.5px solid var(--border);
          border-radius: var(--radius-sm);
          min-height: 42px;
          display: flex; align-items: center;
          letter-spacing: -0.01em;
          font-family: 'DM Sans', sans-serif;
        }
        .field-value.empty { color: var(--text-muted); font-style: italic; font-size: 13px; }

        /* Edit mode */
        .field-input {
          font-size: 14px; font-weight: 500;
          color: var(--text-primary);
          padding: 10px 14px;
          background: white;
          border: 1.5px solid var(--border);
          border-radius: var(--radius-sm);
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          width: 100%;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: -0.01em;
        }
        .field-input:focus { border-color: var(--brand); box-shadow: 0 0 0 3px rgba(249,115,22,0.1); }
        .field-input:disabled { background: #fafafa; color: var(--text-muted); cursor: not-allowed; }

        select.field-input { appearance: none; cursor: pointer; }

        /* ── Success Toast ── */
        .toast {
          position: fixed;
          bottom: 28px; right: 28px;
          background: #111827;
          color: white;
          padding: 13px 18px;
          border-radius: 12px;
          font-size: 13px; font-weight: 600;
          display: flex; align-items: center; gap: 9px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.2);
          z-index: 999;
          animation: slideUp 0.3s ease both;
          font-family: 'Sora', sans-serif;
        }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .toast-icon {
          width: 22px; height: 22px;
          border-radius: 50%;
          background: #22c55e;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .toast-icon svg { width: 12px; height: 12px; stroke: white; stroke-width: 2.5; fill: none; }

        /* ── Security section ── */
        .security-info {
          padding: 24px 28px;
          display: flex; flex-direction: column; gap: 16px;
        }
        .security-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 18px;
          border: 1.5px solid var(--border);
          border-radius: var(--radius-sm);
          gap: 16px;
        }
        .security-row-left { display: flex; align-items: center; gap: 14px; }
        .security-row-icon {
          width: 38px; height: 38px;
          border-radius: 10px;
          background: var(--brand-light);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .security-row-icon svg { width: 16px; height: 16px; stroke: var(--brand); stroke-width: 1.8; fill: none; }
        .security-row-title { font-size: 13.5px; font-weight: 600; color: var(--text-primary); letter-spacing: -0.02em; }
        .security-row-sub { font-size: 12px; color: var(--text-muted); font-family: 'DM Sans', sans-serif; margin-top: 2px; }
        .btn-action-sm {
          padding: 7px 14px;
          border-radius: 8px;
          font-family: 'Sora', sans-serif;
          font-size: 12px; font-weight: 600;
          border: 1.5px solid var(--border);
          background: white;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .btn-action-sm:hover { border-color: var(--brand); color: var(--brand); background: var(--brand-light); }
      `}</style>

      <div className="profile-page">

        {/* Banner */}
        <div className="profile-banner">
          <div className="banner-inner">
            <div className="avatar-wrap">
              <div className={`avatar-circle${avatarUploading ? " avatar-uploading" : ""}`}>
                {avatarUrl
                  ? <img src={avatarUrl} alt="Avatar" />
                  : getInitials()
                }
              </div>
              <div
                className="avatar-upload-btn"
                onClick={() => fileInputRef.current?.click()}
                title="Change photo"
              >
                {avatarUploading
                  ? <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>
                  : <svg viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                }
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleAvatarChange}
              />
            </div>

            <div className="banner-info">
              <div className="banner-name">
                {form.first_name || form.last_name
                  ? `${form.first_name} ${form.last_name}`.trim()
                  : "Your Account"
                }
              </div>
              <div className="banner-email">{user?.email}</div>
              <div className="banner-role">{user?.role || "customer"}</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="profile-content">

          {/* Tabs */}
          <div className="tabs-bar">
            <button
              className={`tab-btn${activeTab === "profile" ? " active" : ""}`}
              onClick={() => { setActiveTab("profile"); setEditing(false); }}
            >
              <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Personal Info
            </button>
            <button
              className={`tab-btn${activeTab === "address" ? " active" : ""}`}
              onClick={() => { setActiveTab("address"); setEditing(false); }}
            >
              <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              Address
            </button>
            <button
              className={`tab-btn${activeTab === "security" ? " active" : ""}`}
              onClick={() => { setActiveTab("security"); setEditing(false); }}
            >
              <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Security
            </button>
          </div>

          {/* ── Personal Info Tab ── */}
          {activeTab === "profile" && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <div className="card-title-icon">
                    <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  Personal Information
                </div>
                <div className="header-actions">
                  {editing ? (
                    <>
                      <button className="btn-cancel" onClick={() => setEditing(false)}>Cancel</button>
                      <button className="btn-save" onClick={handleSave} disabled={saving}>
                        {saving ? "Saving…" : (
                          <>
                            <svg viewBox="0 0 24 24" width="13" height="13" stroke="white" strokeWidth="2.5" fill="none"><polyline points="20 6 9 17 4 12"/></svg>
                            Save Changes
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <button className="btn-edit" onClick={() => setEditing(true)}>
                      <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      Edit
                    </button>
                  )}
                </div>
              </div>

              <div className="fields-grid">
                {/* First Name */}
                <div className="field-group">
                  <label className="field-label">First Name</label>
                  {editing
                    ? <input className="field-input" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} placeholder="First name" />
                    : <div className={`field-value${!form.first_name ? " empty" : ""}`}>{form.first_name || "Not set"}</div>
                  }
                </div>

                {/* Last Name */}
                <div className="field-group">
                  <label className="field-label">Last Name</label>
                  {editing
                    ? <input className="field-input" value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} placeholder="Last name" />
                    : <div className={`field-value${!form.last_name ? " empty" : ""}`}>{form.last_name || "Not set"}</div>
                  }
                </div>

                {/* Email */}
                <div className="field-group">
                  <label className="field-label">Email Address</label>
                  <div className="field-value" style={{ color: "#6b7280" }}>{form.email}</div>
                </div>

                {/* Phone */}
                <div className="field-group">
                  <label className="field-label">Phone Number</label>
                  {editing
                    ? <input className="field-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+63 900 000 0000" />
                    : <div className={`field-value${!form.phone ? " empty" : ""}`}>{form.phone || "Not set"}</div>
                  }
                </div>

                {/* Birth Date */}
                <div className="field-group">
                  <label className="field-label">Date of Birth</label>
                  {editing
                    ? <input className="field-input" type="date" value={form.birth_date} onChange={e => setForm(f => ({ ...f, birth_date: e.target.value }))} />
                    : <div className={`field-value${!form.birth_date ? " empty" : ""}`}>{form.birth_date ? formatDate(form.birth_date) : "Not set"}</div>
                  }
                </div>

                {/* Gender */}
                <div className="field-group">
                  <label className="field-label">Gender</label>
                  {editing
                    ? (
                      <select className="field-input" value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="non_binary">Non-binary</option>
                        <option value="prefer_not_to_say">Prefer not to say</option>
                      </select>
                    )
                    : <div className={`field-value${!form.gender ? " empty" : ""}`} style={{ textTransform: "capitalize" }}>{form.gender?.replace(/_/g, " ") || "Not set"}</div>
                  }
                </div>
              </div>
            </div>
          )}

          {/* ── Address Tab ── */}
          {activeTab === "address" && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <div className="card-title-icon">
                    <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  </div>
                  Delivery Address
                </div>
                <div className="header-actions">
                  {editing ? (
                    <>
                      <button className="btn-cancel" onClick={() => setEditing(false)}>Cancel</button>
                      <button className="btn-save" onClick={handleSave} disabled={saving}>
                        {saving ? "Saving…" : (
                          <>
                            <svg viewBox="0 0 24 24" width="13" height="13" stroke="white" strokeWidth="2.5" fill="none"><polyline points="20 6 9 17 4 12"/></svg>
                            Save Changes
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <button className="btn-edit" onClick={() => setEditing(true)}>
                      <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      Edit
                    </button>
                  )}
                </div>
              </div>

              <div className="fields-grid">
                <div className="field-group full">
                  <label className="field-label">Address Line 1</label>
                  {editing
                    ? <input className="field-input" value={form.address_line1} onChange={e => setForm(f => ({ ...f, address_line1: e.target.value }))} placeholder="House / Unit / Building No., Street" />
                    : <div className={`field-value${!form.address_line1 ? " empty" : ""}`}>{form.address_line1 || "Not set"}</div>
                  }
                </div>

                <div className="field-group full">
                  <label className="field-label">Address Line 2 <span style={{ fontWeight: 400, textTransform: "none", fontSize: 10 }}>(optional)</span></label>
                  {editing
                    ? <input className="field-input" value={form.address_line2} onChange={e => setForm(f => ({ ...f, address_line2: e.target.value }))} placeholder="Barangay, Subdivision" />
                    : <div className={`field-value${!form.address_line2 ? " empty" : ""}`}>{form.address_line2 || "—"}</div>
                  }
                </div>

                <div className="field-group">
                  <label className="field-label">City / Municipality</label>
                  {editing
                    ? <input className="field-input" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="City" />
                    : <div className={`field-value${!form.city ? " empty" : ""}`}>{form.city || "Not set"}</div>
                  }
                </div>

                <div className="field-group">
                  <label className="field-label">Province / Region</label>
                  {editing
                    ? <input className="field-input" value={form.province} onChange={e => setForm(f => ({ ...f, province: e.target.value }))} placeholder="Province" />
                    : <div className={`field-value${!form.province ? " empty" : ""}`}>{form.province || "Not set"}</div>
                  }
                </div>

                <div className="field-group">
                  <label className="field-label">Postal Code</label>
                  {editing
                    ? <input className="field-input" value={form.postal_code} onChange={e => setForm(f => ({ ...f, postal_code: e.target.value }))} placeholder="1234" maxLength={10} />
                    : <div className={`field-value${!form.postal_code ? " empty" : ""}`}>{form.postal_code || "Not set"}</div>
                  }
                </div>

                <div className="field-group">
                  <label className="field-label">Country</label>
                  {editing
                    ? (
                      <select className="field-input" value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))}>
                        <option value="">Select country</option>
                        <option value="PH">Philippines</option>
                        <option value="US">United States</option>
                        <option value="SG">Singapore</option>
                        <option value="AU">Australia</option>
                        <option value="JP">Japan</option>
                        <option value="UK">United Kingdom</option>
                        <option value="CA">Canada</option>
                        <option value="OTHER">Other</option>
                      </select>
                    )
                    : <div className={`field-value${!form.country ? " empty" : ""}`}>{form.country || "Not set"}</div>
                  }
                </div>
              </div>
            </div>
          )}

          {/* ── Security Tab ── */}
          {activeTab === "security" && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <div className="card-title-icon">
                    <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </div>
                  Security & Account
                </div>
              </div>
              <div className="security-info">

                <div className="security-row">
                  <div className="security-row-left">
                    <div className="security-row-icon">
                      <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                    <div>
                      <div className="security-row-title">Password</div>
                      <div className="security-row-sub">Last changed — unknown</div>
                    </div>
                  </div>
                  <button className="btn-action-sm">Change Password</button>
                </div>

                <div className="security-row">
                  <div className="security-row-left">
                    <div className="security-row-icon">
                      <svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    </div>
                    <div>
                      <div className="security-row-title">Email Address</div>
                      <div className="security-row-sub">{user?.email}</div>
                    </div>
                  </div>
                  <button className="btn-action-sm">Change Email</button>
                </div>

                <div className="security-row">
                  <div className="security-row-left">
                    <div className="security-row-icon" style={{ background: "#fef2f2" }}>
                      <svg viewBox="0 0 24 24" style={{ stroke: "#ef4444" }}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    </div>
                    <div>
                      <div className="security-row-title" style={{ color: "#ef4444" }}>Sign Out</div>
                      <div className="security-row-sub">Sign out of your current session</div>
                    </div>
                  </div>
                  <button
                    className="btn-action-sm"
                    style={{ borderColor: "#fca5a5", color: "#ef4444" }}
                    onClick={async () => { const { signOut } = await import("@/app/lib/auth"); await signOut(); }}
                  >
                    Sign Out
                  </button>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {saveSuccess && (
        <div className="toast">
          <div className="toast-icon">
            <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          Profile updated successfully!
        </div>
      )}
    </>
  );
}