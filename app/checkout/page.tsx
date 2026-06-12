"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { routes } from "@/app/routes";
import { supabase } from "@/app/lib/supabase";
import { getCartWithDetails, clearCart } from "@/app/lib/cart";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  selected_size: string | null;
  selected_color: string | null;
  image_url: string | null;
}

interface ShippingMethod {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
}

const shippingMethods: ShippingMethod[] = [
  { id: "standard", name: "Standard Shipping", price: 120, estimatedDays: "5-7 days" },
  { id: "express", name: "Express Shipping", price: 250, estimatedDays: "2-3 days" },
  { id: "overnight", name: "Overnight Shipping", price: 500, estimatedDays: "1-2 days" },
];

const STEPS = [
  { label: "Delivery", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { label: "Shipping", icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" },
  { label: "Payment", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
];

// ─── Checkout Form ────────────────────────────────────────────────────────────

function CheckoutForm({
  cartItems,
  subtotal,
  onSuccess,
  userData,
  selectedShipping,
  onShippingChange,
}: {
  cartItems: CartItem[];
  subtotal: number;
  onSuccess: () => void;
  userData: any;
  selectedShipping: ShippingMethod;
  onShippingChange: (method: ShippingMethod) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    country: "Philippines",
    notes: "",
  });

  useEffect(() => {
    if (userData) {
      setFormData((prev) => ({
        ...prev,
        firstName: userData.first_name || "",
        lastName: userData.last_name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        address: userData.address_line1 || "",
        city: userData.city || "",
        province: userData.province || "",
        postalCode: userData.postal_code || "",
      }));
    }
  }, [userData]);

  const shippingCost = selectedShipping.price;
  const total = subtotal + shippingCost;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateStep1 = () => {
    const { firstName, lastName, email, phone, address, city, province, postalCode } = formData;
    if (!firstName || !lastName || !email || !phone || !address || !city || !province || !postalCode) {
      setError("Please fill in all required fields.");
      return false;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) setCurrentStep(2);
    else if (currentStep === 2) setCurrentStep(3);
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing || loading) return;
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please log in to continue.");

      // Check for duplicate pending orders in last 5 minutes
      const { data: existingPendingOrders } = await supabase
        .from("orders")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .gte("created_at", new Date(Date.now() - 5 * 60 * 1000).toISOString());

      if (existingPendingOrders && existingPendingOrders.length > 0) {
        throw new Error("You already have a pending order. Please complete or cancel it before placing a new one.");
      }

      // ── Step 1: Create payment intent BEFORE writing to DB ──
      const piResponse = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Math.round(total * 100) }),
      });

      const { clientSecret, error: piError } = await piResponse.json();
      if (piError) throw new Error(piError);
      if (!clientSecret) throw new Error("Failed to initialise payment. Please try again.");

      // ── Step 2: Confirm card with Stripe ──
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error("Card element not found.");

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: formData.phone,
          },
        },
      });

      // If Stripe itself rejects the card — show error, nothing written to DB
      if (stripeError) {
        throw new Error(stripeError.message ?? "Payment failed. Please check your card details and try again.");
      }

      if (paymentIntent?.status !== "succeeded") {
        throw new Error(`Payment was not completed (status: ${paymentIntent?.status}). Nothing was charged.`);
      }

      // ── Step 3: Payment succeeded — NOW write to DB ──
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
      const orderNumber = `ORD-${timestamp}-${randomStr}`;

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          order_number: orderNumber,
          user_id: user.id,
          status: "paid",
          subtotal,
          shipping_cost: shippingCost,
          total,
          shipping_method: selectedShipping.name,
          shipping_address: `${formData.address}, ${formData.city}, ${formData.province} ${formData.postalCode}, ${formData.country}`,
          customer_name: `${formData.firstName} ${formData.lastName}`,
          customer_email: formData.email,
          customer_phone: formData.phone,
          notes: formData.notes,
          payment_intent_id: paymentIntent.id,
          paid_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (orderError) {
        // Payment went through but DB write failed — log it but don't block the user
        console.error("Order record failed after successful payment:", orderError, paymentIntent.id);
        // Still proceed to success — order can be reconciled via payment_intent_id
      } else {
        // Write order items
        await Promise.all(
          cartItems.map((item) =>
            supabase.from("order_items").insert({
              order_id: order.id,
              product_id: item.product_id,
              quantity: item.quantity,
              price: item.price,
              selected_size: item.selected_size,
              selected_color: item.selected_color,
            })
          )
        );
      }

      await clearCart(user.id);
      window.dispatchEvent(new Event("cart-updated"));
      window.dispatchEvent(new Event("order-updated"));
      onSuccess();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setIsProcessing(false);
    }
  };

  const stripeElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#111110",
        fontFamily: "'DM Sans', sans-serif",
        "::placeholder": { color: "#9ca3af" },
        iconColor: "#f97316",
      },
      invalid: { color: "#dc2626", iconColor: "#dc2626" },
    },
  };

  return (
    <form onSubmit={handleSubmit}>

      {/* Step Indicator */}
      <div className="steps-indicator">
        {STEPS.map((step, i) => {
          const num = i + 1;
          const done = num < currentStep;
          const active = num === currentStep;
          return (
            <div key={step.label} className="step-indicator-item">
              <div className={`step-circle ${done ? "done" : ""} ${active ? "active" : ""}`}>
                {done ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d={step.icon} />
                  </svg>
                )}
              </div>
              <span className={`step-indicator-label ${active ? "active" : ""} ${done ? "done" : ""}`}>
                {step.label}
              </span>
              {i < STEPS.length - 1 && <div className={`step-connector ${done ? "done" : ""}`} />}
            </div>
          );
        })}
      </div>

      {/* Step 1: Delivery */}
      {currentStep === 1 && (
        <div className="step-card">
          <div className="step-card-header">
            <h3>Delivery Information</h3>
            <p className="step-card-sub">We'll send your order confirmation here.</p>
          </div>
          <div className="form-grid">
            <div className="field">
              <label className="field-label">First Name *</label>
              <input name="firstName" placeholder="First name" value={formData.firstName} onChange={handleInputChange} className="form-input" />
            </div>
            <div className="field">
              <label className="field-label">Last Name *</label>
              <input name="lastName" placeholder="Last name" value={formData.lastName} onChange={handleInputChange} className="form-input" />
            </div>
            <div className="field">
              <label className="field-label">Email Address *</label>
              <input name="email" type="email" placeholder="you@example.com" value={formData.email} onChange={handleInputChange} className="form-input" />
            </div>
            <div className="field">
              <label className="field-label">Phone Number *</label>
              <input name="phone" placeholder="+63 9XX XXX XXXX" value={formData.phone} onChange={handleInputChange} className="form-input" />
            </div>
            <div className="field full-width">
              <label className="field-label">Street Address *</label>
              <input name="address" placeholder="Unit, building, street name" value={formData.address} onChange={handleInputChange} className="form-input" />
            </div>
            <div className="field">
              <label className="field-label">City *</label>
              <input name="city" placeholder="City" value={formData.city} onChange={handleInputChange} className="form-input" />
            </div>
            <div className="field">
              <label className="field-label">Province *</label>
              <input name="province" placeholder="Province" value={formData.province} onChange={handleInputChange} className="form-input" />
            </div>
            <div className="field">
              <label className="field-label">Postal Code *</label>
              <input name="postalCode" placeholder="Postal code" value={formData.postalCode} onChange={handleInputChange} className="form-input" />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Shipping */}
      {currentStep === 2 && (
        <div className="step-card">
          <div className="step-card-header">
            <h3>Shipping Method</h3>
            <p className="step-card-sub">Choose how you'd like your order delivered.</p>
          </div>
          <div className="shipping-list">
            {shippingMethods.map((method) => (
              <label key={method.id} className={`shipping-option ${selectedShipping.id === method.id ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="shipping"
                  checked={selectedShipping.id === method.id}
                  onChange={() => onShippingChange(method)}
                />
                <div className="shipping-radio">
                  {selectedShipping.id === method.id && <div className="radio-dot" />}
                </div>
                <div className="shipping-info">
                  <span className="shipping-name">{method.name}</span>
                  <span className="shipping-days">{method.estimatedDays}</span>
                </div>
                <span className="shipping-price">₱{method.price.toFixed(2)}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Payment */}
      {currentStep === 3 && (
        <div className="step-card">
          <div className="step-card-header">
            <h3>Payment Details</h3>
            <p className="step-card-sub">Your payment information is secure and encrypted.</p>
          </div>
          <div className="stripe-card-wrapper">
            <label className="field-label">Card Information</label>
            <div className="stripe-card-element">
              <CardElement options={stripeElementOptions} />
            </div>
            <div className="secure-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>256-bit SSL encryption — your card details are never stored</span>
            </div>
          </div>
          <div className="field" style={{ marginTop: "20px" }}>
            <label className="field-label">Order Notes <span className="optional-label">(optional)</span></label>
            <textarea
              name="notes"
              placeholder="Any special instructions or requests…"
              value={formData.notes}
              onChange={handleInputChange}
              className="form-input notes-input"
            />
          </div>
        </div>
      )}

      {error && (
        <div className="error-banner">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      <div className="step-actions">
        {currentStep > 1 && (
          <button type="button" onClick={handlePrevStep} className="btn-back" disabled={isProcessing}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        )}
        <div className="btn-right">
          {currentStep < 3 ? (
            <button type="button" onClick={handleNextStep} className="btn-primary">
              Continue
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button type="submit" disabled={!stripe || loading || isProcessing} className="btn-primary btn-pay">
              {loading ? (
                <>
                  <span className="spinner-small" />
                  Processing…
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                  Pay ₱{total.toFixed(2)}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [subtotal, setSubtotal] = useState(0);
  const [userData, setUserData] = useState<any>(null);
  const [selectedShipping, setSelectedShipping] = useState<ShippingMethod>(shippingMethods[0]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single();
    if (profile) setUserData(profile);

    const cartData = await getCartWithDetails(user.id);
    const hasItems = cartData?.items && cartData.items.length > 0;

    if (hasItems) {
      const items = cartData.items.map((item: any) => ({
        id: item.id,
        product_id: item.product_id,
        name: item.product.name,
        price: item.price_at_add,
        quantity: item.quantity,
        selected_size: item.selected_size,
        selected_color: item.selected_color,
        image_url: item.product.image_url,
      }));
      setCartItems(items);
      setSubtotal(cartData.subtotal || 0);
    } else {
      router.push("/cart");
      return;
    }
    setLoading(false);
  };

  const handleSuccess = () => router.push("/checkout/success");

  const shippingCost = selectedShipping.price;
  const total = subtotal + shippingCost;
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading checkout…</p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <div className="checkout-page">
        <div className="checkout-container">

          {/* Page Header */}
          <div className="page-header">
            <Link href="/cart" className="back-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Cart
            </Link>
            <h1>Checkout</h1>
          </div>

          <div className="checkout-grid">
            {/* Left — Form */}
            <div className="checkout-form-col">
              <CheckoutForm
                cartItems={cartItems}
                subtotal={subtotal}
                onSuccess={handleSuccess}
                userData={userData}
                selectedShipping={selectedShipping}
                onShippingChange={setSelectedShipping}
              />
            </div>

            {/* Right — Order Summary */}
            <aside className="order-summary">
              <h3 className="summary-heading">Order Summary</h3>

              <div className="summary-items">
                {cartItems.map((item) => (
                  <div key={item.id} className="summary-item">
                    <div className="summary-img-wrap">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="summary-img" />
                      ) : (
                        <div className="summary-img placeholder-img" />
                      )}
                      <span className="qty-badge">{item.quantity}</span>
                    </div>
                    <div className="summary-item-info">
                      <span className="summary-item-name">{item.name}</span>
                      <div className="summary-item-meta">
                        {item.selected_size && item.selected_size !== "One Size" && (
                          <span>Size: {item.selected_size}</span>
                        )}
                        {item.selected_color && <span>{item.selected_color}</span>}
                      </div>
                    </div>
                    <span className="summary-item-price">₱{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="summary-divider" />

              <div className="summary-totals">
                <div className="summary-row">
                  <span>Subtotal <span className="item-count">({itemCount} {itemCount === 1 ? "item" : "items"})</span></span>
                  <span>₱{subtotal.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping ({selectedShipping.name})</span>
                  <span>₱{shippingCost.toFixed(2)}</span>
                </div>
              </div>

              <div className="summary-total-row">
                <span>Total</span>
                <span className="total-value">₱{total.toFixed(2)}</span>
              </div>

              <div className="payment-methods">
                <div className="payment-icons">
                  {["Visa", "Mastercard", "Amex", "Discover"].map((brand) => (
                    <span key={brand} className="payment-badge">{brand}</span>
                  ))}
                </div>
                <p className="payment-note">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Secure, encrypted checkout
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        .checkout-page {
          min-height: 100vh;
          background: #fafaf9;
          padding: 0 0 80px;
          font-family: 'DM Sans', sans-serif;
          color: #111110;
        }

        .checkout-container {
          max-width: 1160px;
          margin: 0 auto;
          padding: 0 32px;
        }

        /* ── Page Header ── */
        .page-header {
          padding: 36px 0 40px;
          border-bottom: 1px solid #ebebea;
          margin-bottom: 40px;
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #9ca3af;
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          transition: color 0.15s;
          white-space: nowrap;
        }

        .back-link:hover { color: #f97316; }

        .page-header h1 {
          font-size: 32px;
          font-weight: 600;
          font-family: 'Playfair Display', serif;
          color: #111110;
          margin: 0;
          line-height: 1;
        }

        /* ── Grid ── */
        .checkout-grid {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 40px;
          align-items: start;
        }

        .checkout-form-col { min-width: 0; }

        /* ── Step Indicator ── */
        .steps-indicator {
          display: flex;
          align-items: center;
          margin-bottom: 24px;
          background: white;
          border: 1px solid #f0f0ee;
          border-radius: 16px;
          padding: 18px 28px;
        }

        .step-indicator-item {
          display: flex;
          align-items: center;
          flex: 1;
        }

        .step-indicator-item:last-child { flex: none; }

        .step-circle {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
          color: #9ca3af;
          flex-shrink: 0;
          transition: all 0.25s;
          border: 1.5px solid transparent;
        }

        .step-circle.active {
          background: #fff7ed;
          color: #f97316;
          border-color: #f97316;
        }

        .step-circle.done {
          background: #f97316;
          color: white;
          border-color: #f97316;
        }

        .step-indicator-label {
          font-size: 13px;
          font-weight: 500;
          color: #9ca3af;
          margin-left: 8px;
          transition: color 0.2s;
          white-space: nowrap;
        }

        .step-indicator-label.active { color: #f97316; font-weight: 600; }
        .step-indicator-label.done { color: #111110; }

        .step-connector {
          flex: 1;
          height: 1.5px;
          background: #e5e7eb;
          margin: 0 16px;
          transition: background 0.3s;
        }

        .step-connector.done { background: #f97316; }

        /* ── Step Card ── */
        .step-card {
          background: white;
          border-radius: 20px;
          padding: 32px;
          border: 1px solid #f0f0ee;
          margin-bottom: 16px;
        }

        .step-card-header {
          margin-bottom: 28px;
          padding-bottom: 20px;
          border-bottom: 1px solid #f5f5f4;
        }

        .step-card h3 {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 600;
          color: #111110;
          margin: 0 0 6px;
        }

        .step-card-sub {
          font-size: 13px;
          color: #9ca3af;
          margin: 0;
        }

        /* ── Fields ── */
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .field-label {
          font-size: 13px;
          font-weight: 500;
          color: #374151;
        }

        .optional-label {
          font-weight: 400;
          color: #9ca3af;
        }

        .form-input {
          padding: 11px 14px;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          background: white;
          color: #111110;
          transition: all 0.2s;
          width: 100%;
          -webkit-appearance: none;
        }

        .form-input:focus {
          outline: none;
          border-color: #f97316;
          box-shadow: 0 0 0 3px rgba(249,115,22,0.08);
        }

        .form-input::placeholder { color: #9ca3af; }

        .notes-input {
          resize: vertical;
          min-height: 90px;
          line-height: 1.5;
        }

        .full-width { grid-column: span 2; }

        /* ── Shipping ── */
        .shipping-list { display: flex; flex-direction: column; gap: 10px; }

        .shipping-option {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 18px;
          border: 1.5px solid #e5e7eb;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          background: white;
        }

        .shipping-option:hover { border-color: #f97316; background: #fff7ed; }
        .shipping-option.selected { border-color: #f97316; background: #fff7ed; }

        .shipping-option input[type="radio"] { display: none; }

        .shipping-radio {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid #d1d5db;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: border-color 0.2s;
          background: white;
        }

        .shipping-option.selected .shipping-radio { border-color: #f97316; }

        .radio-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #f97316;
        }

        .shipping-info { flex: 1; display: flex; flex-direction: column; gap: 3px; }

        .shipping-name { font-size: 14px; font-weight: 500; color: #111110; }
        .shipping-days { font-size: 12px; color: #9ca3af; }
        .shipping-price { font-size: 14px; font-weight: 600; color: #f97316; }

        /* ── Stripe ── */
        .stripe-card-wrapper { margin-bottom: 4px; }

        .stripe-card-element {
          padding: 13px 14px;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          background: white;
          margin-top: 7px;
          transition: all 0.2s;
        }

        .stripe-card-element:focus-within {
          border-color: #f97316;
          box-shadow: 0 0 0 3px rgba(249,115,22,0.08);
        }

        .secure-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 10px;
          font-size: 11px;
          color: #9ca3af;
        }

        .secure-badge svg { color: #22c55e; flex-shrink: 0; }

        /* ── Error ── */
        .error-banner {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          background: #fef2f2;
          color: #dc2626;
          padding: 13px 16px;
          border-radius: 10px;
          font-size: 13px;
          margin: 0 0 16px;
          border: 1px solid #fecaca;
          line-height: 1.4;
        }

        .error-banner svg { flex-shrink: 0; margin-top: 1px; }

        /* ── Actions ── */
        .step-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 4px;
        }

        .btn-right { margin-left: auto; }

        .btn-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          color: #6b7280;
          font-size: 13px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          padding: 10px 0;
          transition: color 0.15s;
        }

        .btn-back:hover:not(:disabled) { color: #111110; }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 13px 28px;
          background: #f97316;
          color: white;
          border: none;
          border-radius: 100px;
          font-size: 14px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 12px rgba(249,115,22,0.25);
        }

        .btn-primary:hover:not(:disabled) {
          background: #ea6d10;
          transform: translateY(-1px);
          box-shadow: 0 4px 18px rgba(249,115,22,0.35);
        }

        .btn-primary:active:not(:disabled) { transform: translateY(0); }
        .btn-primary:disabled { opacity: 0.55; cursor: not-allowed; box-shadow: none; }

        .btn-pay { padding: 13px 32px; font-size: 15px; }

        .spinner-small {
          width: 15px;
          height: 15px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }

        /* ── Order Summary ── */
        .order-summary {
          background: white;
          border-radius: 20px;
          padding: 28px;
          border: 1px solid #f0f0ee;
          position: sticky;
          top: 32px;
        }

        .summary-heading {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 600;
          color: #111110;
          margin: 0 0 22px;
        }

        .summary-items {
          display: flex;
          flex-direction: column;
          max-height: 380px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #e5e7eb transparent;
        }

        .summary-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 0;
          border-bottom: 1px solid #f5f5f4;
        }

        .summary-item:last-child { border-bottom: none; }

        .summary-img-wrap { position: relative; flex-shrink: 0; }

        .summary-img,
        .placeholder-img {
          width: 54px;
          height: 54px;
          border-radius: 10px;
          object-fit: cover;
          background: #f3f4f6;
          display: block;
        }

        .qty-badge {
          position: absolute;
          top: -6px;
          right: -6px;
          width: 19px;
          height: 19px;
          background: #111110;
          color: white;
          border-radius: 50%;
          font-size: 10px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
        }

        .summary-item-info { flex: 1; min-width: 0; }

        .summary-item-name {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: #111110;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 4px;
        }

        .summary-item-meta { display: flex; gap: 6px; flex-wrap: wrap; }

        .summary-item-meta span {
          font-size: 11px;
          color: #6b7280;
          background: #f5f5f4;
          padding: 2px 8px;
          border-radius: 20px;
        }

        .summary-item-price {
          font-size: 13px;
          font-weight: 600;
          color: #f97316;
          flex-shrink: 0;
        }

        .summary-divider {
          height: 1px;
          background: #f0f0ee;
          margin: 18px 0;
        }

        .summary-totals { display: flex; flex-direction: column; gap: 2px; }

        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 7px 0;
          font-size: 13px;
          color: #6b7280;
        }

        .item-count { font-size: 12px; color: #9ca3af; }

        .summary-total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0 0;
          margin-top: 10px;
          border-top: 1.5px solid #f0f0ee;
        }

        .summary-total-row span:first-child {
          font-size: 15px;
          font-weight: 600;
          color: #111110;
        }

        .total-value {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 700;
          color: #111110;
        }

        .payment-methods {
          margin-top: 20px;
          padding-top: 18px;
          border-top: 1px solid #f5f5f4;
        }

        .payment-icons { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }

        .payment-badge {
          font-size: 10px;
          font-weight: 600;
          color: #6b7280;
          background: #f5f5f4;
          padding: 4px 10px;
          border-radius: 20px;
        }

        .payment-note {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          color: #9ca3af;
          margin: 0;
        }

        .payment-note svg { color: #22c55e; flex-shrink: 0; }

        /* ── Loading ── */
        .loading-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          gap: 16px;
          background: #fafaf9;
          font-family: 'DM Sans', sans-serif;
          color: #9ca3af;
          font-size: 14px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #f0f0ee;
          border-top-color: #f97316;
          border-radius: 50%;
          animation: spin 0.9s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Responsive ── */
        @media (max-width: 920px) {
          .checkout-grid { grid-template-columns: 1fr; }
          .order-summary { position: static; order: -1; }
          .summary-items { max-height: 200px; }
        }

        @media (max-width: 580px) {
          .checkout-container { padding: 0 16px; }
          .page-header { padding: 24px 0 28px; gap: 14px; }
          .page-header h1 { font-size: 26px; }
          .form-grid { grid-template-columns: 1fr; }
          .full-width { grid-column: span 1; }
          .step-card { padding: 24px 20px; }
          .steps-indicator { padding: 14px 18px; }
          .step-indicator-label { display: none; }
          .step-connector { margin: 0 10px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .spinner, .spinner-small { animation: none; }
          .btn-primary, .step-connector, .step-circle, .form-input { transition: none; }
        }
      `}</style>
    </Elements>
  );
}