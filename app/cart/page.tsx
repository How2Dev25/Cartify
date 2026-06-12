"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { routes } from "@/app/routes";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { supabase } from "@/app/lib/supabase";
import { 
  getCartWithDetails, 
  updateCartItemQuantity, 
  removeCartItem, 
  clearCart,
  applyCouponToCart,
  removeCouponFromCart
} from "@/app/lib/cart";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CartItemWithDetails {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  selected_size: string | null;
  selected_color: string | null;
  selected_color_name: string | null;
  price_at_add: number;
  product: {
    id: string;
    name: string;
    price: number;
    original_price: number;
    image_url: string | null;
    stock: number;
    status: string;
  };
}

const SHIPPING_THRESHOLD = 1500;
const SHIPPING_FEE = 120;

// ─── Sub-components ───────────────────────────────────────────────────────────

function CartRow({
  item,
  onQty,
  onRemove,
  index,
}: {
  item: CartItemWithDetails;
  onQty: (id: string, qty: number) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  index: number;
}) {
  const [updatingQty, setUpdatingQty] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);
  const displayImage = item.product.image_url || "https://placehold.co/400x400?text=No+Image";

  useEffect(() => {
    gsap.fromTo(rowRef.current,
      { opacity: 0, x: -30, scale: 0.95 },
      { opacity: 1, x: 0, scale: 1, duration: 0.5, delay: index * 0.1, ease: "back.out(0.8)" }
    );
  }, [index]);

  const handleQtyChange = async (newQty: number) => {
    if (newQty < 1) return;
    if (newQty > item.product.stock) return;
    
    setUpdatingQty(true);
    await onQty(item.id, newQty);
    setUpdatingQty(false);
  };

  const handleRemove = async () => {
    gsap.to(rowRef.current, {
      opacity: 0,
      x: 50,
      duration: 0.3,
      ease: "power2.in",
      onComplete: async () => {
        await onRemove(item.id);
      }
    });
  };

  const itemTotal = item.price_at_add * item.quantity;
  const originalTotal = item.product.original_price * item.quantity;
  const hasDiscount = item.product.original_price > item.price_at_add;

  return (
    <div ref={rowRef} className="cart-row">
      {/* Image */}
      <Link href={routes.productDetail(item.product_id)} className="cart-img-wrap">
        <img src={displayImage} alt={item.product.name} className="cart-img" />
      </Link>

      {/* Details */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "#f97316", margin: "0 0 4px" }}>
          {item.product.name.split(' ').slice(-1)[0]}
        </p>
        <Link href={routes.productDetail(item.product_id)} style={{ textDecoration: "none" }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "#111110", margin: "0 0 8px", lineHeight: 1.3, fontFamily: "'Playfair Display', serif" }}>
            {item.product.name}
          </h3>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          {item.selected_size && item.selected_size !== "One Size" && (
            <span style={{ fontSize: 12, color: "#6b7280", background: "#f3f4f6", padding: "3px 10px", borderRadius: 100 }}>
              Size: {item.selected_size}
            </span>
          )}
          {item.selected_color && (
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#6b7280" }}>
              <span style={{ width: 12, height: 12, borderRadius: "50%", background: item.selected_color, border: "1px solid rgba(0,0,0,0.1)", display: "inline-block" }} />
              {item.selected_color_name || item.selected_color}
            </span>
          )}
        </div>
      </div>

      {/* Qty stepper */}
      <div className="qty-stepper">
        <button 
          className="qty-step-btn" 
          onClick={() => handleQtyChange(item.quantity - 1)}
          disabled={updatingQty}
        >−</button>
        <span style={{ fontSize: 14, fontWeight: 600, minWidth: 20, textAlign: "center" }}>
          {updatingQty ? "..." : item.quantity}
        </span>
        <button 
          className="qty-step-btn" 
          onClick={() => handleQtyChange(item.quantity + 1)}
          disabled={updatingQty || item.quantity >= item.product.stock}
        >+</button>
      </div>

      {/* Price */}
      <div style={{ textAlign: "right", minWidth: 88 }}>
        <p style={{ fontSize: 18, fontWeight: 700, color: "#f97316", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
          ₱{itemTotal.toFixed(2)}
        </p>
        {item.quantity > 1 && (
          <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>₱{item.price_at_add} each</p>
        )}
        {hasDiscount && (
          <p style={{ fontSize: 12, color: "#d1d5db", textDecoration: "line-through", margin: 0 }}>
            ₱{originalTotal.toFixed(2)}
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
  const [cartItems, setCartItems] = useState<CartItemWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [checkingOut, setCheckingOut] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const pageRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Get current user and load cart
  useEffect(() => {
    const loadUserAndCart = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }
      
      setUserId(user.id);
      await loadCart(user.id);
    };
    
    loadUserAndCart();
  }, [router]);

  // Animation on mount
  useEffect(() => {
    if (loading) return;
    
    gsap.registerPlugin(ScrollTrigger);
    
    gsap.fromTo(pageRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.5 }
    );
    
    gsap.fromTo(".breadcrumb-item",
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }
    );
    
    gsap.fromTo(".cart-title",
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, duration: 0.6, ease: "back.out(1)" }
    );
    
    if (cartItems.length > 0) {
      gsap.fromTo(progressRef.current,
        { opacity: 0, scaleX: 0 },
        { opacity: 1, scaleX: 1, duration: 0.8, ease: "power2.out" }
      );
      
      gsap.fromTo(summaryRef.current,
        { opacity: 0, x: 50 },
        { opacity: 1, x: 0, duration: 0.8, delay: 0.3, ease: "back.out(0.8)" }
      );
    }
    
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [loading, cartItems.length]);

  const loadCart = async (uid: string) => {
    setLoading(true);
    const cartData = await getCartWithDetails(uid);
    
    if (cartData && cartData.items) {
      setCartItems(cartData.items);
      if (cartData.coupon) {
        setCouponApplied(true);
        setCouponDiscount(cartData.discount_amount);
      } else {
        setCouponApplied(false);
        setCouponDiscount(0);
      }
    } else {
      setCartItems([]);
    }
    setLoading(false);
  };

  const updateQty = async (itemId: string, newQty: number) => {
    if (!userId) return;
    
    await updateCartItemQuantity(userId, itemId, newQty);
    await loadCart(userId);
    window.dispatchEvent(new Event('cart-updated'));
  };

  const removeItem = async (itemId: string) => {
    if (!userId) return;
    
    await removeCartItem(userId, itemId);
    await loadCart(userId);
    window.dispatchEvent(new Event('cart-updated'));
  };

  const handleClearCart = async () => {
    if (!userId) return;
    
    gsap.to(".cart-row", {
      opacity: 0,
      x: -50,
      stagger: 0.05,
      duration: 0.3,
      onComplete: async () => {
        await clearCart(userId);
        await loadCart(userId);
        window.dispatchEvent(new Event('cart-updated'));
      }
    });
  };

  const handleApplyCoupon = async () => {
    if (!userId) return;
    
    const result = await applyCouponToCart(userId, couponCode);
    
    if (result.success) {
      setCouponApplied(true);
      setCouponError(false);
      await loadCart(userId);
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

  const handleRemoveCoupon = async () => {
    if (!userId) return;
    
    await removeCouponFromCart(userId);
    setCouponApplied(false);
    setCouponDiscount(0);
    setCouponCode("");
    await loadCart(userId);
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

  // Calculate totals
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price_at_add * item.quantity), 0);
  const savings = cartItems.reduce((sum, item) => {
    if (item.product.original_price > item.price_at_add) {
      return sum + ((item.product.original_price - item.price_at_add) * item.quantity);
    }
    return sum;
  }, 0);
  const discount = couponDiscount;
  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal - discount + shipping;

  const shippingProgressPct = Math.min(100, (subtotal / SHIPPING_THRESHOLD) * 100);
  const amountToFreeShipping = Math.max(0, SHIPPING_THRESHOLD - subtotal);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#fafaf9", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 48, height: 48, border: "4px solid #f3f4f6", borderTopColor: "#f97316", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#9ca3af" }}>Loading your cart...</p>
        </div>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

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
        .qty-step-btn:hover:not(:disabled) { color: #f97316; background: #fff3ed; }
        .qty-step-btn:disabled { opacity: 0.5; cursor: not-allowed; }

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
        .coupon-btn:hover:not(:disabled) { background: #f97316; }
        .coupon-btn:disabled { opacity: 0.5; cursor: not-allowed; }

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
        .checkout-btn:hover:not(:disabled) { background: #ea6d10; transform: translateY(-1px); box-shadow: 0 6px 28px rgba(249,115,22,0.45); }
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

        /* Remove coupon link */
        .remove-coupon {
          background: none;
          border: none;
          color: #ef4444;
          font-size: 11px;
          cursor: pointer;
          margin-left: 8px;
          text-decoration: underline;
        }
        .remove-coupon:hover { color: #dc2626; }

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
            {cartItems.length > 0 && (
              <span style={{ fontSize: 14, color: "#9ca3af", fontWeight: 300 }}>{itemCount} item{itemCount !== 1 ? "s" : ""}</span>
            )}
          </div>

          {cartItems.length === 0 ? (
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
                  {cartItems.map((item, index) => (
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
                    onClick={handleClearCart}
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
                  {couponApplied ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f0fdf4", padding: "10px 14px", borderRadius: 10 }}>
                      <span style={{ fontSize: 13, color: "#16a34a", fontWeight: 500 }}>✓ Coupon applied!</span>
                      <button onClick={handleRemoveCoupon} className="remove-coupon">Remove</button>
                    </div>
                  ) : (
                    <div style={{ display: "flex" }}>
                      <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={e => { setCouponCode(e.target.value); setCouponError(false); }}
                        className={`coupon-input${couponError ? " error" : ""}`}
                      />
                      <button className="coupon-btn" onClick={handleApplyCoupon}>
                        Apply
                      </button>
                    </div>
                  )}
                  {couponError && <p style={{ fontSize: 12, color: "#ef4444", margin: "6px 0 0" }}>Invalid coupon code</p>}
                </div>

                {/* Order summary */}
                <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #f0f0ee", padding: "22px" }}>
                  <h2 style={{ fontSize: 16, fontWeight: 600, color: "#111110", margin: "0 0 18px", letterSpacing: "-0.01em" }}>Order Summary</h2>

                  <div className="summary-row">
                    <span>Subtotal ({itemCount} items)</span>
                    <span style={{ color: "#111110", fontWeight: 500 }}>₱{subtotal.toFixed(2)}</span>
                  </div>
                  {savings > 0 && (
                    <div className="summary-row">
                      <span style={{ color: "#16a34a" }}>You save</span>
                      <span style={{ color: "#16a34a", fontWeight: 600 }}>-₱{savings.toFixed(2)}</span>
                    </div>
                  )}
                  {couponApplied && discount > 0 && (
                    <div className="summary-row">
                      <span style={{ color: "#f97316" }}>Coupon discount</span>
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
                        ₱{total.toFixed(2)}
                      </span>
                      <p style={{ fontSize: 11, color: "#9ca3af", margin: "2px 0 0" }}>VAT included where applicable</p>
                    </div>
                  </div>

                  {/* Checkout */}
                  <button
                    className="checkout-btn"
                    onClick={handleCheckout}
                    disabled={checkingOut || cartItems.length === 0}
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