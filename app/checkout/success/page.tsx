"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/account/orders");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="success-page">
      <div className="success-card text-black">
        <div className="success-icon">✓</div>
        <h1>Payment Successful!</h1>
        <p>Thank you for your purchase. Your order has been confirmed.</p>
        <div className="button-group">
          <Link href="/account/orders" className="btn-primary">View My Orders</Link>
          <Link href="/products" className="btn-secondary">Continue Shopping</Link>
        </div>
        <p className="redirect">Redirecting to orders in {countdown} seconds...</p>
      </div>

      <style>{`
        .success-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fafaf9;
          padding: 24px;
        }
        .success-card {
          background: white;
          border-radius: 24px;
          padding: 48px;
          text-align: center;
          max-width: 500px;
        }
        .success-icon {
          width: 80px;
          height: 80px;
          background: #22c55e;
          color: white;
          font-size: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
        }
        h1 {
          font-size: 28px;
          margin: 0 0 12px;
        }
        p {
          color: #6b7280;
          margin: 8px 0;
        }
        .button-group {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin-top: 32px;
        }
        .btn-primary, .btn-secondary {
          padding: 12px 24px;
          border-radius: 100px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
        }
        .btn-primary {
          background: #f97316;
          color: white;
        }
        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
        }
        .redirect {
          font-size: 12px;
          margin-top: 24px;
        }
      `}</style>
    </div>
  );
}