"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { routes } from "@/app/routes";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CartItem {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  image: string;
  size: string;
  color: string;
  colorHex: string;
  qty: number;
}

// ─── Mock cart data ───────────────────────────────────────────────────────────

const initialCart: CartItem[] = [
  {
    id: 2,
    name: "Premium Leather Watch",
    category: "Accessories",
    price: 199.99,
    originalPrice: 299.99,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
    size: "One Size",
    color: "Tan",
    colorHex: "#92400e",
    qty: 1,
  },
  {
    id: 1,
    name: "Classic White Sneakers",
    category: "Footwear",
    price: 89.99,
    originalPrice: 129.99,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
    size: "41",
    color: "White",
    colorHex: "#f5f5f0",
    qty: 1,
  },
  {
    id: 3,
    name: "Designer Handbag",
    category: "Bags",
    price: 149.99,
    originalPrice: 249.99,
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop",
    size: "One Size",
    color: "Berry",
    colorHex: "#be185d",
    qty: 1,
  },
];

const SHIPPING_THRESHOLD = 1500;
const SHIPPING_FEE = 120;

// ─── Sub-components ───────────────────────────────────────────────────────────

function CartRow({
  item,
  onQty,
  onRemove,
  index,
}: {
  item: CartItem;
  onQty: (id: number, qty: number) => void;
  onRemove: (id: number) => void;
  index: number;
}) {
  const [removing, setRemoving] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(rowRef.current,
      { opacity: 0, x: -30, scale: 0.95 },
      { opacity: 1, x: 0, scale: 1, duration: 0.5, delay: index * 0.1, ease: "back.out(0.8)" }
    );
  }, [index]);

  const handleRemove = () => {
    setRemoving(true);
    gsap.to(rowRef.current, {
      opacity: 0,
      x: 50,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => onRemove(item.id)
    });
  };

  return (
    <div ref={rowRef} className="cart-row">
      {/* Image */}
      <Link href={routes.productDetail(item.id)} className="cart-img-wrap">
        <img src={item.image} alt={item.name} className="cart-img" />
      </Link>

      {/* Details */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "#f97316", margin: "0 0 4px" }}>
          {item.category}
        </p>
        <Link href={routes.productDetail(item.id)} style={{ textDecoration: "none" }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "#111110", margin: "0 0 8px", lineHeight: 1.3, fontFamily: "'Playfair Display', serif" }}>
            {item.name}
          </h3>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          {item.size !== "One Size" && (
            <span style={{ fontSize: 12, color: "#6b7280", background: "#f3f4f6", padding: "3px 10px", borderRadius: 100 }}>
              Size: EU {item.size}
            </span>
          )}
          <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#6b7280" }}>
            <span style={{ width: 12, height: 12, borderRadius: "50%", background: item.colorHex, border: "1px solid rgba(0,0,0,0.1)", display: "inline-block" }} />
            {item.color}
          </span>
        </div>
      </div>

      {/* Qty stepper */}
      <div className="qty-stepper">
        <button className="qty-step-btn" onClick={() => onQty(item.id, Math.max(1, item.qty - 1))}>−</button>
        <span style={{ fontSize: 14, fontWeight: 600, minWidth: 20, textAlign: "center" }}>{item.qty}</span>
        <button className="qty-step-btn" onClick={() => onQty(item.id, item.qty + 1)}>+</button>
      </div>

      {/* Price */}
      <div style={{ textAlign: "right", minWidth: 88 }}>
        <p style={{ fontSize: 18, fontWeight: 700, color: "#f97316", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
          ₱{(item.price * item.qty).toFixed(2)}
        </p>
        {item.qty > 1 && (
          <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>₱{item.price} each</p>
        )}
        {item.originalPrice > item.price && (
          <p style={{ fontSize: 12, color: "#d1d5db", textDecoration: "line-through", margin: 0 }}>
            ₱{(item.originalPrice * item.qty).toFixed(2)}
          </p>
        )}
      </div>

      {/* Remove */}
      <button className="remove-btn" onClick={handleRemove} aria-label="Remove item">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
        </svg>
      </button>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyCart() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(containerRef.current,
      { opacity: 0, scale: 0.9, y: 30 },
      { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "back.out(1.2)" }
    );
  }, []);

  return (
    <div ref={containerRef} style={{ textAlign: "center", padding: "80px 24px" }}>
      <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#fff3ed", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
      </div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 600, color: "#111110", margin: "0 0 10px" }}>
        Your cart is empty
      </h2>
      <p style={{ fontSize: 14, color: "#9ca3af", fontWeight: 300, marginBottom: 32 }}>
        Looks like you haven't added anything yet.
      </p>
      <Link href={routes.products} className="btn-primary-link">
        Start Shopping
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
      </Link>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>(initialCart);
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  const pageRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    // Page entrance animation
    gsap.fromTo(pageRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.5 }
    );
    
    // Breadcrumb animation
    gsap.fromTo(".breadcrumb-item",
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }
    );
    
    // Title animation
    gsap.fromTo(".cart-title",
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, duration: 0.6, ease: "back.out(1)" }
    );
    
    // Free shipping progress animation
    gsap.fromTo(progressRef.current,
      { opacity: 0, scaleX: 0 },
      { opacity: 1, scaleX: 1, duration: 0.8, ease: "power2.out" }
    );
    
    // Summary animation
    gsap.fromTo(summaryRef.current,
      { opacity: 0, x: 50 },
      { opacity: 1, x: 0, duration: 0.8, delay: 0.3, ease: "back.out(0.8)" }
    );
    
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const updateQty = (id: number, qty: number) =>
    setCart((c) => c.map((item) => (item.id === id ? { ...item, qty } : item)));

  const removeItem = (id: number) =>
    setCart((c) => c.filter((item) => item.id !== id));

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const savings = cart.reduce((sum, item) => sum + (item.originalPrice - item.price) * item.qty, 0);
  const discount = couponApplied ? subtotal * 0.1 : 0;
  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal - discount + shipping;

  const shippingProgressPct = Math.min(100, (subtotal / SHIPPING_THRESHOLD) * 100);
  const amountToFreeShipping = Math.max(0, SHIPPING_THRESHOLD - subtotal);

  const handleCoupon = () => {
    if (coupon.trim().toUpperCase() === "SAVE10") {
      setCouponApplied(true);
      setCouponError(false);
      gsap.to(".coupon-input", {
        scale: 1.05,
        duration: 0.2,
        yoyo: true,
        repeat: 1
      });
    } else {
      setCouponError(true);
      setCouponApplied(false);
      gsap.to(".coupon-input", {
        x: -5,
        duration: 0.1,
        yoyo: true,
        repeat: 3
      });
    }
  };

  const handleCheckout = () => {
    setCheckingOut(true);
    gsap.to(".checkout-btn", {
      scale: 0.95,
      duration: 0.2,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        setTimeout(() => {
          router.push(routes.checkout);
        }, 500);
      }
    });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; }

        .cart-root {
          min-height: 100vh;
          background: #fafaf9;
          font-family: 'DM Sans', sans-serif;
          color: #111110;
        }

        /* Breadcrumb */
        .bc-link { font-size: 13px; color: #9ca3af; text-decoration: none; transition: color 0.2s; }
        .bc-link:hover { color: #f97316; }

        /* Cart row */
        .cart-row {
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 22px 0;
          border-bottom: 1px solid #f0f0ee;
        }
        .cart-row:last-child { border-bottom: none; }

        .cart-img-wrap {
          width: 90px; height: 90px;
          border-radius: 14px;
          overflow: hidden;
          background: #f3f4f6;
          flex-shrink: 0;
          display: block;
        }
        .cart-img {
          width: 100%; height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .cart-img-wrap:hover .cart-img { transform: scale(1.06); }

        /* Qty stepper */
        .qty-stepper {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 100px;
          padding: 7px 14px;
          flex-shrink: 0;
        }
        .qty-step-btn {
          background: none; border: none;
          width: 22px; height: 22px;
          font-size: 17px; font-weight: 400;
          color: #374151; cursor: pointer;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          transition: color 0.2s, background 0.2s;
          font-family: 'DM Sans', sans-serif;
          padding: 0;
        }
        .qty-step-btn:hover { color: #f97316; background: #fff3ed; }

        /* Remove */
        .remove-btn {
          width: 32px; height: 32px;
          border-radius: 8px;
          border: 1px solid #f3f4f6;
          background: #fff;
          color: #d1d5db;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: color 0.2s, border-color 0.2s, background 0.2s;
        }
        .remove-btn:hover { color: #ef4444; border-color: #fecaca; background: #fef2f2; }

        /* Coupon */
        .coupon-input {
          flex: 1;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px 0 0 10px;
          padding: 11px 16px;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          color: #111110;
          outline: none;
          background: #fff;
          transition: border-color 0.2s;
          min-width: 0;
        }
        .coupon-input:focus { border-color: #f97316; }
        .coupon-input.error { border-color: #f87171; }
        .coupon-input.success { border-color: #4ade80; }
        .coupon-btn {
          background: #111110;
          color: #fff;
          border: none;
          padding: 11px 20px;
          border-radius: 0 10px 10px 0;
          font-size: 13px; font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: background 0.2s;
          white-space: nowrap;
        }
        .coupon-btn:hover { background: #f97316; }

        /* Summary rows */
        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          font-size: 14px;
          color: #6b7280;
          border-bottom: 1px solid #f3f4f6;
        }
        .summary-row:last-of-type { border-bottom: none; }

        /* Checkout btn */
        .checkout-btn {
          width: 100%;
          padding: 16px;
          border-radius: 100px;
          background: #f97316;
          color: #fff;
          font-size: 15px; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          border: none;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 4px 20px rgba(249,115,22,0.35);
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
        }
        .checkout-btn:hover { background: #ea6d10; transform: translateY(-1px); box-shadow: 0 6px 28px rgba(249,115,22,0.45); }
        .checkout-btn:disabled { background: #d1d5db; box-shadow: none; cursor: not-allowed; transform: none; }

        .btn-primary-link {
          display: inline-flex; align-items: center; gap: 8px;
          background: #f97316; color: #fff;
          padding: 13px 28px; border-radius: 100px;
          font-size: 14px; font-weight: 500;
          text-decoration: none;
          font-family: 'DM Sans', sans-serif;
          box-shadow: 0 4px 18px rgba(249,115,22,0.3);
          transition: background 0.2s, transform 0.15s;
        }
        .btn-primary-link:hover { background: #ea6d10; transform: translateY(-1px); }

        /* Progress bar */
        .progress-track {
          height: 5px; background: #f3f4f6;
          border-radius: 100px; overflow: hidden; margin: 8px 0;
        }
        .progress-fill {
          height: 100%; background: #f97316;
          border-radius: 100px;
          transition: width 0.5s cubic-bezier(0.4,0,0.2,1);
        }

        /* Trust badges */
        .trust-badge {
          display: flex; align-items: center; gap: 8px;
          font-size: 12px; color: #6b7280; font-weight: 400;
        }

        /* Responsive */
        @media (max-width: 900px) {
          .cart-layout { flex-direction: column !important; }
          .cart-summary-col { position: static !important; width: 100% !important; }
        }
        @media (max-width: 560px) {
          .cart-row { flex-wrap: wrap; }
          .cart-img-wrap { width: 70px !important; height: 70px !important; }
        }
      `}</style>

      <div ref={pageRef} className="cart-root">
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 80px" }}>

          {/* Breadcrumb */}
          <nav style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 36 }}>
            <Link href={routes.home} className="bc-link breadcrumb-item">Home</Link>
            <span className="breadcrumb-item" style={{ color: "#d1d5db", fontSize: 12 }}>›</span>
            <Link href={routes.products} className="bc-link breadcrumb-item">Products</Link>
            <span className="breadcrumb-item" style={{ color: "#d1d5db", fontSize: 12 }}>›</span>
            <span className="breadcrumb-item" style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>Cart</span>
          </nav>

          {/* Page title */}
          <div style={{ marginBottom: 36, display: "flex", alignItems: "baseline", gap: 14 }}>
            <h1 className="cart-title" style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px,4vw,40px)", fontWeight: 600, margin: 0, letterSpacing: "-0.02em" }}>
              Shopping Cart
            </h1>
            {cart.length > 0 && (
              <span style={{ fontSize: 14, color: "#9ca3af", fontWeight: 300 }}>{cart.length} item{cart.length !== 1 ? "s" : ""}</span>
            )}
          </div>

          {cart.length === 0 ? (
            <EmptyCart />
          ) : (
            <div className="cart-layout" style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>

              {/* ── Left: Items ── */}
              <div style={{ flex: 1, minWidth: 0 }}>

                {/* Free shipping progress */}
                <div ref={progressRef} style={{ background: "#fff", borderRadius: 16, border: "1px solid #f0f0ee", padding: "18px 22px", marginBottom: 20 }}>
                  {amountToFreeShipping <= 0 ? (
                    <p style={{ fontSize: 13, fontWeight: 500, color: "#16a34a", margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                      You've unlocked free shipping! 🎉
                    </p>
                  ) : (
                    <>
                      <p style={{ fontSize: 13, color: "#374151", margin: "0 0 6px" }}>
                        Add <span style={{ fontWeight: 600, color: "#f97316" }}>₱{amountToFreeShipping.toFixed(2)}</span> more for <span style={{ fontWeight: 600 }}>free shipping</span>
                      </p>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${shippingProgressPct}%` }} />
                      </div>
                    </>
                  )}
                </div>

                {/* Items card */}
                <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #f0f0ee", padding: "4px 24px 8px" }}>
                  {cart.map((item, index) => (
                    <CartRow key={item.id} item={item} onQty={updateQty} onRemove={removeItem} index={index} />
                  ))}
                </div>

                {/* Actions row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18, flexWrap: "wrap", gap: 12 }}>
                  <Link href={routes.products} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "#6b7280", textDecoration: "none", fontWeight: 500, transition: "color 0.2s" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#f97316")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#6b7280")}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    Continue Shopping
                  </Link>
                  <button
                    onClick={() => {
                      gsap.to(".cart-row", {
                        opacity: 0,
                        x: -50,
                        stagger: 0.05,
                        duration: 0.3,
                        onComplete: () => setCart([])
                      });
                    }}
                    style={{ fontSize: 13, color: "#9ca3af", background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "color 0.2s" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#ef4444")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#9ca3af")}>
                    Clear cart
                  </button>
                </div>
              </div>

              {/* ── Right: Summary ── */}
              <div ref={summaryRef} className="cart-summary-col" style={{ width: 360, flexShrink: 0, position: "sticky", top: 100 }}>

                {/* Coupon */}
                <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f0f0ee", padding: "20px 22px", marginBottom: 16 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#111110", margin: "0 0 12px" }}>Have a promo code?</p>
                  <div style={{ display: "flex" }}>
                    <input
                      type="text"
                      placeholder="e.g. SAVE10"
                      value={coupon}
                      onChange={e => { setCoupon(e.target.value); setCouponError(false); }}
                      className={`coupon-input${couponError ? " error" : couponApplied ? " success" : ""}`}
                      disabled={couponApplied}
                    />
                    <button className="coupon-btn" onClick={handleCoupon} disabled={couponApplied}>
                      {couponApplied ? "Applied ✓" : "Apply"}
                    </button>
                  </div>
                  {couponError && <p style={{ fontSize: 12, color: "#ef4444", margin: "6px 0 0" }}>Invalid code. Try SAVE10</p>}
                  {couponApplied && <p style={{ fontSize: 12, color: "#16a34a", margin: "6px 0 0" }}>10% discount applied!</p>}
                </div>

                {/* Order summary */}
                <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #f0f0ee", padding: "22px" }}>
                  <h2 style={{ fontSize: 16, fontWeight: 600, color: "#111110", margin: "0 0 18px", letterSpacing: "-0.01em" }}>Order Summary</h2>

                  <div className="summary-row">
                    <span>Subtotal ({cart.reduce((s, i) => s + i.qty, 0)} items)</span>
                    <span style={{ color: "#111110", fontWeight: 500 }}>₱{subtotal.toFixed(2)}</span>
                  </div>
                  {savings > 0 && (
                    <div className="summary-row">
                      <span style={{ color: "#16a34a" }}>You save</span>
                      <span style={{ color: "#16a34a", fontWeight: 600 }}>-₱{savings.toFixed(2)}</span>
                    </div>
                  )}
                  {couponApplied && (
                    <div className="summary-row">
                      <span style={{ color: "#f97316" }}>Promo (SAVE10)</span>
                      <span style={{ color: "#f97316", fontWeight: 600 }}>-₱{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="summary-row">
                    <span>Shipping</span>
                    <span style={{ color: shipping === 0 ? "#16a34a" : "#111110", fontWeight: 500 }}>
                      {shipping === 0 ? "Free 🎉" : `₱${SHIPPING_FEE}`}
                    </span>
                  </div>

                  {/* Divider */}
                  <div style={{ borderTop: "1.5px dashed #f0f0ee", margin: "14px 0" }} />

                  {/* Total */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
                    <span style={{ fontSize: 16, fontWeight: 600, color: "#111110" }}>Total</span>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: 24, fontWeight: 700, color: "#f97316", letterSpacing: "-0.02em" }}>
                        ₱{(total).toFixed(2)}
                      </span>
                      <p style={{ fontSize: 11, color: "#9ca3af", margin: "2px 0 0" }}>VAT included where applicable</p>
                    </div>
                  </div>

                  {/* Checkout */}
                  <button
                    className="checkout-btn"
                    onClick={handleCheckout}
                    disabled={checkingOut}
                  >
                    {checkingOut ? (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite" }}>
                          <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity="0.25"/>
                          <path d="M21 12a9 9 0 00-9-9"/>
                        </svg>
                        Processing…
                      </>
                    ) : (
                      <>
                        Proceed to Checkout
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      </>
                    )}
                  </button>

                  {/* Payment icons */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 14, flexWrap: "wrap" }}>
                    {["Visa", "Mastercard", "GCash", "Maya", "COD"].map((m) => (
                      <span key={m} style={{ fontSize: 10, fontWeight: 600, color: "#9ca3af", background: "#f8f8f7", border: "1px solid #e5e7eb", borderRadius: 5, padding: "3px 8px", letterSpacing: "0.04em" }}>{m}</span>
                    ))}
                  </div>

                  {/* Trust badges */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 18, paddingTop: 16, borderTop: "1px solid #f3f4f6" }}>
                    <div className="trust-badge">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      SSL encrypted & secure checkout
                    </div>
                    <div className="trust-badge">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round"><path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg>
                      Free returns within 30 days
                    </div>
                    <div className="trust-badge">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M20 6L9 17l-5-5"/></svg>
                      Authenticity guaranteed
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}