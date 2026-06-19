"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { Review, deleteReview } from "@/app/lib/reviews";
import { routes } from "@/app/routes";

interface ReviewWithProduct extends Review {
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    images: string[];
  } | null;
}

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width={size} height={size} viewBox="0 0 24 24"
          fill={s <= Math.round(rating) ? "#f97316" : "none"}
          stroke="#f97316" strokeWidth="1.8">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
}

export default function MyReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<ReviewWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push(routes.login); return; }

        const { data, error } = await supabase
          .from("reviews")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (!data || data.length === 0) {
          setReviews([]);
          return;
        }

        const productIds = [...new Set(data.map((r) => r.product_id))];
        const { data: products } = await supabase
          .from("products")
          .select("id, name, price, image_url, images")
          .in("id", productIds);

        const productMap = Object.fromEntries(
          (products || []).map((p) => [p.id, p])
        );

        setReviews(
          (data as Review[]).map((r) => ({
            ...r,
            product: productMap[r.product_id] || null,
          }))
        );
      } catch (err: any) {
        console.error("Error fetching reviews:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [router]);

  const handleDelete = async (reviewId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const result = await deleteReview(reviewId, user.id);
    if (result.success) {
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      setDeletingId(null);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        .page-root { min-height: 100vh; background: #fafaf9; font-family: 'DM Sans', sans-serif; }
        .page-inner { max-width: 900px; margin: 0 auto; padding: 40px 24px 80px; }
        .page-title { font-size: 28px; font-weight: 600; color: #111110; margin: 0 0 8px; letter-spacing: -0.02em; }
        .page-sub { font-size: 14px; color: #9ca3af; margin: 0 0 32px; font-weight: 300; }
      `}</style>

      <div className="page-root">
        <div className="page-inner">
          <h1 className="page-title">My Reviews</h1>
          <p className="page-sub">All the products you&apos;ve reviewed</p>

          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ width: 48, height: 48, border: "4px solid #f3f4f6", borderTopColor: "#f97316", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
              <p style={{ color: "#9ca3af", fontSize: 14 }}>Loading your reviews...</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : error ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <p style={{ color: "#dc2626", fontSize: 14 }}>{error}</p>
            </div>
          ) : reviews.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: 16, border: "1px solid #f0f0ee" }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" style={{ margin: "0 auto 16px" }}>
                <path d="M12 20l-1.5-1.5L9 20l-3-1.5v-3h-1a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9"/>
                <rect x="3" y="9" width="18" height="12" rx="2"/>
                <circle cx="12" cy="14" r="1.5"/>
              </svg>
              <p style={{ fontSize: 16, fontWeight: 500, color: "#374151", marginBottom: 6 }}>No reviews yet</p>
              <p style={{ fontSize: 14, color: "#9ca3af", marginBottom: 24 }}>You haven&apos;t reviewed any products yet.</p>
              <Link href={routes.products} style={{ padding: "10px 28px", background: "#f97316", color: "#fff", borderRadius: 100, textDecoration: "none", fontSize: 14, fontWeight: 500, display: "inline-block" }}>
                Browse Products
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {reviews.map((review) => (
                <div key={review.id} style={{ padding: 20, background: "#fff", borderRadius: 16, border: "1px solid #f0f0ee", display: "flex", gap: 16 }}>
                  {/* Product Image */}
                  <Link href={routes.productDetail(review.product_id)} style={{ flexShrink: 0, width: 100, height: 100, borderRadius: 12, overflow: "hidden", background: "#f8f8f7", display: "block" }}>
                    <img
                      src={review.product?.image_url || (review.product?.images?.[0]) || "https://placehold.co/200x200?text=No+Image"}
                      alt={review.product?.name || "Product"}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </Link>

                  {/* Review Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                      <div>
                        <Link href={routes.productDetail(review.product_id)}
                          style={{ fontSize: 15, fontWeight: 600, color: "#111110", textDecoration: "none", lineHeight: 1.3, display: "block", marginBottom: 2 }}>
                          {review.product?.name || "Unknown Product"}
                        </Link>
                        {review.product && (
                          <p style={{ fontSize: 13, fontWeight: 500, color: "#f97316", margin: "0 0 6px" }}>₱{review.product.price.toFixed(2)}</p>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                        {deletingId === review.id ? (
                          <span style={{ fontSize: 12, color: "#6b7280", display: "flex", alignItems: "center", gap: 6 }}>
                            Delete?
                            <button onClick={() => handleDelete(review.id)}
                              style={{ padding: "4px 12px", background: "#dc2626", color: "#fff", borderRadius: 100, border: "none", fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                              Yes
                            </button>
                            <button onClick={() => setDeletingId(null)}
                              style={{ padding: "4px 12px", background: "#fff", color: "#6b7280", borderRadius: 100, border: "1px solid #d1d5db", fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                              No
                            </button>
                          </span>
                        ) : (
                          <button onClick={() => setDeletingId(review.id)}
                            style={{ padding: "6px 16px", background: "#fff", color: "#dc2626", borderRadius: 100, border: "1px solid #e5e7eb", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                            Delete
                          </button>
                        )}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <Stars rating={review.rating} size={12} />
                      <span style={{ fontSize: 11, color: "#9ca3af" }}>
                        {new Date(review.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                      </span>
                    </div>

                    {review.comment && (
                      <p style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.6, margin: 0, fontWeight: 300 }}>{review.comment}</p>
                    )}

                    {review.images && review.images.length > 0 && (
                      <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                        {review.images.map((url, i) => (
                          <img key={i} src={url} alt={`Review photo ${i + 1}`}
                            style={{ width: 64, height: 64, borderRadius: 8, objectFit: "cover", border: "1px solid #f0f0ee" }} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
