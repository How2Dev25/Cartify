"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { routes } from "@/app/routes";
import { supabase } from "@/app/lib/supabase";
import { addToCart, getCartItemCount } from "@/app/lib/cart";
import {
  Review,
  ReviewStats,
  fetchProductReviews,
  computeReviewStats,
  createReview,
  updateReview,
  deleteReview,
} from "@/app/lib/reviews";

interface Product {
  id: string;
  product_id: string;
  name: string;
  description: string;
  price: number;
  original_price: number;
  discount: number;
  stock: number;
  status: string;
  category: string;
  image_url: string | null;
  is_new: boolean;
  is_featured: boolean;
  created_at: string;
  images: string[];
  details: string[];
  sizes: string[];
  colors: string[];
  color_names: string[];
}

// ─── Star Rating ──────────────────────────────────────────────────────────────

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

// ─── Related product mini-card ────────────────────────────────────────────────

function RelatedCard({ product }: { product: Product }) {
  const router = useRouter();
  const displayImage = product.image_url || (product.images && product.images[0]) || "https://placehold.co/400x400?text=No+Image";
  
  return (
    <div
      className="related-card"
      onClick={() => router.push(routes.productDetail(product.id))}
      style={{ cursor: "pointer" }}
    >
      <div style={{ aspectRatio: "1/1", overflow: "hidden", borderRadius: 12, background: "#f8f8f7", marginBottom: 12 }}>
        <img src={displayImage} alt={product.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
          className="related-img" />
      </div>
      <p style={{ fontSize: 11, color: "#f97316", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 3px" }}>{product.category}</p>
      <p style={{ fontSize: 14, fontWeight: 500, color: "#111110", margin: "0 0 4px", lineHeight: 1.3 }}>{product.name}</p>
      <p style={{ fontSize: 15, fontWeight: 600, color: "#f97316", margin: 0 }}>₱{product.price.toFixed(2)}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartError, setCartError] = useState("");

  const [activeImg, setActiveImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState(0);
  const [qty, setQty] = useState(1);
  const [wished, setWished] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "details" | "reviews">("description");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats>({ average: 0, total: 0, breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newVideoFile, setNewVideoFile] = useState<File | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const productId = params?.id as string;

        // Fetch current product
        const { data: productData, error: productError } = await supabase
          .from("products")
          .select("*")
          .eq("id", productId)
          .single();

        if (productError) throw productError;
        if (!productData) throw new Error("Product not found");

        setProduct(productData);

        // Fetch related products (same category, excluding current)
        const { data: relatedData, error: relatedError } = await supabase
          .from("products")
          .select("*")
          .eq("category", productData.category)
          .neq("id", productData.id)
          .limit(4);

        if (!relatedError && relatedData && relatedData.length > 0) {
          setRelatedProducts(relatedData);
        } else {
          // Fallback: fetch any other products if no same-category products
          const { data: otherData, error: otherError } = await supabase
            .from("products")
            .select("*")
            .neq("id", productData.id)
            .limit(4);

          if (!otherError && otherData) {
            setRelatedProducts(otherData);
          }
        }
      } catch (err: any) {
        console.error("Error fetching product:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) {
      fetchProduct();
    }
  }, [params?.id]);

  // Load cart count on mount
  useEffect(() => {
    const loadCartCount = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const count = await getCartItemCount(user.id);
        setCartCount(count);
      }
    };
    loadCartCount();
  }, []);

  // Load reviews
  useEffect(() => {
    const loadReviews = async () => {
      if (!params?.id) return;
      setReviewLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      const data = await fetchProductReviews(params.id as string);
      setReviews(data);
      setReviewStats(computeReviewStats(data));
      if (user) {
        setCurrentUserId(user.id);
      }
      setReviewLoading(false);
    };
    loadReviews();
  }, [params?.id]);

  const handleSubmitReview = async () => {
    if (!params?.id || newRating === 0) return;
    setSubmittingReview(true);
    setReviewError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push(`/auth/login?redirect=${routes.productDetail(params.id as string)}`);
      setSubmittingReview(false);
      return;
    }

    // Upload new images
    const imageUrls: string[] = editingReview?.images?.filter(Boolean) || [];
    for (const file of newImageFiles) {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload/review", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) imageUrls.push(data.url);
    }

    // Upload video
    let videoUrl = editingReview?.video || "";
    if (newVideoFile) {
      const formData = new FormData();
      formData.append("file", newVideoFile);
      const res = await fetch("/api/upload/review", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) videoUrl = data.url;
    }

    let result;
    if (editingReview) {
      result = await updateReview(editingReview.id, user.id, newRating, newComment || undefined, imageUrls.length ? imageUrls : undefined, videoUrl || undefined);
    } else {
      result = await createReview(params.id as string, user.id, newRating, newComment || undefined, imageUrls.length ? imageUrls : undefined, videoUrl || undefined);
    }
    if (result.success) {
      setShowReviewForm(false);
      setEditingReview(null);
      setNewRating(0);
      setNewComment("");
      setNewImageFiles([]);
      setNewVideoFile(null);
      const updated = await fetchProductReviews(params.id as string);
      setReviews(updated);
      setReviewStats(computeReviewStats(updated));
    } else {
      setReviewError(result.error || "Failed to submit review");
    }
    setSubmittingReview(false);
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setNewRating(review.rating);
    setNewComment(review.comment || "");
    setNewImageFiles([]);
    setNewVideoFile(null);
    setShowReviewForm(true);
  };

  const handleDeleteReview = async (reviewId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const result = await deleteReview(reviewId, user.id);
    if (result.success) {
      setDeletingReviewId(null);
      const updated = await fetchProductReviews(params.id as string);
      setReviews(updated);
      setReviewStats(computeReviewStats(updated));
    }
  };

  // Get images array (use images JSON or fallback to single image_url)
  const getProductImages = () => {
    if (!product) return [];
    if (product.images && product.images.length > 0) {
      return product.images;
    }
    if (product.image_url) {
      return [product.image_url];
    }
    return ["https://placehold.co/700x700?text=No+Image"];
  };

  const productImages = getProductImages();
  const inStock = product?.stock ? product.stock > 0 : false;

  const handleAddToCart = async () => {
    if (!inStock) return;
    if (!product) return;
    
    setIsAddingToCart(true);
    setCartError("");

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        // Redirect to login if not authenticated
        router.push(`/auth/login?redirect=${routes.productDetail(product.id)}`);
        return;
      }

      // Add to cart using the cart function
      const result = await addToCart(
        user.id,
        product.id,
        qty,
        product.price,
        selectedSize || undefined,
        product.colors?.[selectedColor],
        product.color_names?.[selectedColor]
      );

      if (result.success) {
        setAddedToCart(true);
        // Update cart count
        const newCount = await getCartItemCount(user.id);
        setCartCount(newCount);
        
        // Show success message and reset after delay
        setTimeout(() => {
          setAddedToCart(false);
        }, 2200);
      } else {
        setCartError(result.message);
        // Shake animation on error
        const btn = document.querySelector('.btn-cart');
        if (btn) {
          btn.animate([
            { transform: 'translateX(0px)' },
            { transform: 'translateX(-10px)' },
            { transform: 'translateX(10px)' },
            { transform: 'translateX(-5px)' },
            { transform: 'translateX(5px)' },
            { transform: 'translateX(0px)' }
          ], {
            duration: 300,
            iterations: 1
          });
        }
      }
    } catch (err: any) {
      console.error('Error adding to cart:', err);
      setCartError(err.message || 'Failed to add item to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#fafaf9", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 48, height: 48, border: "4px solid #f3f4f6", borderTopColor: "#f97316", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#9ca3af" }}>Loading product...</p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ minHeight: "100vh", background: "#fafaf9", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.5" style={{ margin: "0 auto 16px" }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p style={{ fontSize: 18, fontWeight: 500, color: "#374151", marginBottom: 8 }}>Product not found</p>
          <p style={{ fontSize: 14, color: "#9ca3af", marginBottom: 24 }}>{error || "The product you're looking for doesn't exist."}</p>
          <Link href={routes.products} style={{ padding: "10px 24px", background: "#f97316", color: "#fff", borderRadius: 100, textDecoration: "none", fontSize: 14, fontWeight: 500 }}>
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; }

        .pdp-root {
          min-height: 100vh;
          background: #fafaf9;
          font-family: 'DM Sans', sans-serif;
          color: #111110;
        }

        /* Breadcrumb */
        .breadcrumb { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .breadcrumb a { font-size: 13px; color: #9ca3af; text-decoration: none; transition: color 0.2s; }
        .breadcrumb a:hover { color: #f97316; }
        .breadcrumb-sep { color: #d1d5db; font-size: 12px; }
        .breadcrumb-current { font-size: 13px; color: #374151; font-weight: 500; }

        /* Gallery */
        .thumb {
          width: 72px; height: 72px; border-radius: 10px;
          object-fit: cover; cursor: pointer;
          border: 2px solid transparent;
          transition: border-color 0.2s, opacity 0.2s;
          opacity: 0.65;
          flex-shrink: 0;
        }
        .thumb:hover { opacity: 1; }
        .thumb.active { border-color: #f97316; opacity: 1; }

        .main-img {
          width: 100%; height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease, opacity 0.3s ease;
        }
        .main-img:hover { transform: scale(1.03); }

        /* Sizes */
        .size-btn {
          min-width: 44px; height: 44px; padding: 0 12px;
          border-radius: 10px;
          border: 1.5px solid #e5e7eb;
          background: #fff;
          font-size: 13px; font-weight: 500;
          color: #374151;
          cursor: pointer;
          transition: all 0.18s;
          font-family: 'DM Sans', sans-serif;
        }
        .size-btn:hover { border-color: #f97316; color: #f97316; }
        .size-btn.active { background: #f97316; border-color: #f97316; color: #fff; }

        /* Color swatches */
        .color-swatch {
          width: 28px; height: 28px; border-radius: 50%;
          cursor: pointer;
          border: 2px solid transparent;
          transition: transform 0.15s, box-shadow 0.15s;
          outline: none;
        }
        .color-swatch:hover { transform: scale(1.12); }
        .color-swatch.active { box-shadow: 0 0 0 3px #fff, 0 0 0 5px #f97316; }

        /* Qty */
        .qty-btn {
          width: 36px; height: 36px; border-radius: 8px;
          border: 1px solid #e5e7eb; background: #fff;
          font-size: 18px; font-weight: 400; color: #374151;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: border-color 0.2s, color 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .qty-btn:hover { border-color: #f97316; color: #f97316; }

        /* CTA */
        .btn-cart {
          flex: 1;
          padding: 15px 0;
          border-radius: 100px;
          background: #f97316;
          color: #fff;
          font-size: 15px; font-weight: 600;
          border: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 18px rgba(249,115,22,0.3);
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .btn-cart:hover:not(:disabled) { background: #ea6d10; transform: translateY(-1px); box-shadow: 0 6px 24px rgba(249,115,22,0.4); }
        .btn-cart:disabled { background: #d1d5db; box-shadow: none; cursor: not-allowed; }
        .btn-cart.added { background: #16a34a; box-shadow: 0 4px 18px rgba(22,163,74,0.3); }

        .btn-wish {
          width: 52px; height: 52px;
          border-radius: 100px;
          border: 1.5px solid #e5e7eb;
          background: #fff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          color: #9ca3af;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .btn-wish:hover, .btn-wish.wished { border-color: #f97316; color: #f97316; background: #fff3ed; }

        /* Perks strip */
        .perk {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 0;
          border-bottom: 1px solid #f3f4f6;
          font-size: 13px; color: #6b7280;
        }
        .perk:last-child { border-bottom: none; }
        .perk-icon { color: #f97316; flex-shrink: 0; }

        /* Tabs */
        .tab-btn {
          padding: 10px 0;
          font-size: 14px; font-weight: 500;
          color: #9ca3af;
          background: none; border: none; border-bottom: 2px solid transparent;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: color 0.2s, border-color 0.2s;
        }
        .tab-btn.active { color: #111110; border-color: #f97316; }
        .tab-btn:hover { color: #374151; }

        /* Related */
        .related-card {
          transition: transform 0.2s ease;
        }
        .related-card:hover { transform: translateY(-3px); }
        .related-card:hover .related-img { transform: scale(1.05); }

        /* Responsive */
        @media (max-width: 768px) {
          .pdp-grid { flex-direction: column !important; }
          .gallery-thumbs { flex-direction: row !important; overflow-x: auto; }
          .thumb { width: 60px !important; height: 60px !important; }
          .related-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }

        /* Error message */
        .cart-error {
          color: #dc2626;
          font-size: 12px;
          margin-top: 8px;
          text-align: center;
          animation: shake 0.3s ease-in-out;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .star-picker .star-btn svg { transition: opacity 0.15s; }
      `}</style>

      <div className="pdp-root">
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 80px" }}>

          {/* Breadcrumb */}
          <nav className="breadcrumb" style={{ marginBottom: 32 }}>
            <Link href={routes.home} className="breadcrumb a">Home</Link>
            <span className="breadcrumb-sep">›</span>
            <Link href={routes.products} className="breadcrumb a">Products</Link>
            <span className="breadcrumb-sep">›</span>
            <Link href={`${routes.products}?cat=${product.category}`} className="breadcrumb a">{product.category}</Link>
            <span className="breadcrumb-sep">›</span>
            <span className="breadcrumb-current">{product.name}</span>
          </nav>

          {/* Cart Error Display */}
          {cartError && (
            <div className="cart-error mb-4">
              {cartError}
            </div>
          )}

          {/* Main layout */}
          <div className="pdp-grid" style={{ display: "flex", gap: 56, alignItems: "flex-start" }}>

            {/* ── Gallery ── */}
            <div style={{ flex: "0 0 52%", display: "flex", gap: 14 }}>

              {/* Thumbnails */}
              <div className="gallery-thumbs" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {productImages.map((img, i) => (
                  <img key={i} src={img} alt={`${product.name} view ${i + 1}`}
                    className={`thumb${activeImg === i ? " active" : ""}`}
                    onClick={() => setActiveImg(i)} />
                ))}
              </div>

              {/* Main image */}
              <div style={{ flex: 1, borderRadius: 20, overflow: "hidden", background: "#f8f8f7", position: "relative", aspectRatio: "1/1" }}>
                <img
                  src={productImages[activeImg]}
                  alt={product.name}
                  className="main-img"
                />
                {/* Badges */}
                <div style={{ position: "absolute", top: 16, left: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                  {product.is_new && (
                    <span style={{ background: "#111110", color: "#fff", fontSize: 10, fontWeight: 600, padding: "4px 10px", borderRadius: 100, letterSpacing: "0.08em", textTransform: "uppercase" }}>New</span>
                  )}
                  {product.discount > 0 && (
                    <span style={{ background: "#f97316", color: "#fff", fontSize: 10, fontWeight: 600, padding: "4px 10px", borderRadius: 100 }}>-{product.discount}%</span>
                  )}
                  {!inStock && (
                    <span style={{ background: "#f3f4f6", color: "#6b7280", fontSize: 10, fontWeight: 500, padding: "4px 10px", borderRadius: 100 }}>Out of Stock</span>
                  )}
                </div>

                {/* Nav arrows */}
                {productImages.length > 1 && (
                  <>
                    <button onClick={() => setActiveImg((i) => (i - 1 + productImages.length) % productImages.length)}
                      style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.88)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
                    </button>
                    <button onClick={() => setActiveImg((i) => (i + 1) % productImages.length)}
                      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.88)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* ── Info ── */}
            <div style={{ flex: 1, minWidth: 0 }}>

              {/* Category + title */}
              <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: "#f97316", margin: "0 0 10px" }}>{product.category}</p>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(26px,4vw,38px)", fontWeight: 600, lineHeight: 1.15, letterSpacing: "-0.02em", margin: "0 0 16px", color: "#111110" }}>
                {product.name}
              </h1>

              {/* Stock Status */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                {inStock
                  ? <span style={{ fontSize: 12, fontWeight: 500, color: "#16a34a", background: "#f0fdf4", padding: "3px 10px", borderRadius: 100 }}>● In Stock ({product.stock} units)</span>
                  : <span style={{ fontSize: 12, fontWeight: 500, color: "#dc2626", background: "#fef2f2", padding: "3px 10px", borderRadius: 100 }}>● Out of Stock</span>
                }
              </div>

              {/* Price */}
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 28 }}>
                <span style={{ fontSize: 32, fontWeight: 700, color: "#f97316", letterSpacing: "-0.02em" }}>₱{product.price.toFixed(2)}</span>
                {product.original_price > 0 && (
                  <span style={{ fontSize: 18, color: "#d1d5db", textDecoration: "line-through" }}>₱{product.original_price.toFixed(2)}</span>
                )}
                {product.discount > 0 && (
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#f97316", background: "#fff3ed", padding: "3px 10px", borderRadius: 100 }}>Save {product.discount}%</span>
                )}
              </div>

              {/* Color selector */}
              {product.colors && product.colors.length > 1 && (
                <div style={{ marginBottom: 24 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 10 }}>
                    Color — <span style={{ color: "#111110", fontWeight: 600 }}>{product.color_names?.[selectedColor] || "Default"}</span>
                  </p>
                  <div style={{ display: "flex", gap: 10 }}>
                    {product.colors.map((c, i) => (
                      <button
                        key={i}
                        className={`color-swatch${selectedColor === i ? " active" : ""}`}
                        style={{ background: c }}
                        onClick={() => setSelectedColor(i)}
                        aria-label={product.color_names?.[i]}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Size selector */}
              {product.sizes && product.sizes.length > 0 && product.sizes[0] !== "One Size" && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "#374151", margin: 0 }}>
                      Size {selectedSize && <span style={{ color: "#111110", fontWeight: 600 }}>— {selectedSize}</span>}
                    </p>
                    <Link href={routes.sizing} style={{ fontSize: 12, color: "#f97316", textDecoration: "underline", textUnderlineOffset: 3 }}>Size guide</Link>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {product.sizes.map((s) => (
                      <button key={s} className={`size-btn${selectedSize === s ? " active" : ""}`} onClick={() => setSelectedSize(s)}>{s}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Qty + CTA */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
                {/* Quantity */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 100, padding: "6px 14px" }}>
                  <button 
                    className="qty-btn" 
                    style={{ border: "none", background: "none" }} 
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={isAddingToCart}
                  >−</button>
                  <span style={{ fontSize: 15, fontWeight: 600, minWidth: 20, textAlign: "center" }}>{qty}</span>
                  <button 
                    className="qty-btn" 
                    style={{ border: "none", background: "none" }} 
                    onClick={() => setQty((q) => Math.min(product.stock, q + 1))} 
                    disabled={!inStock || qty >= product.stock || isAddingToCart}
                  >+</button>
                </div>

                {/* Add to cart */}
                <button
                  className={`btn-cart${addedToCart ? " added" : ""}`}
                  disabled={!inStock || isAddingToCart}
                  onClick={handleAddToCart}
                >
                  {isAddingToCart ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="32" />
                        <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" fill="none" />
                      </svg>
                      Adding...
                    </>
                  ) : addedToCart ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                      Added to Cart
                    </>
                  ) : inStock ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                      Add to Cart
                    </>
                  ) : "Out of Stock"}
                </button>

                {/* Wishlist */}
                <button 
                  className={`btn-wish${wished ? " wished" : ""}`} 
                  onClick={() => setWished((v) => !v)} 
                  aria-label="Wishlist"
                  disabled={isAddingToCart}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={wished ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                  </svg>
                </button>
              </div>

              {/* Perks */}
              <div style={{ borderTop: "1px solid #f3f4f6", borderBottom: "1px solid #f3f4f6", marginBottom: 28 }}>
                {[
                  { icon: "🚚", text: "Free shipping on orders over ₱1,500" },
                  { icon: "↩️", text: "30-day hassle-free returns" },
                  { icon: "🔒", text: "Secure checkout — SSL encrypted" },
                  { icon: "✅", text: "Authenticity guaranteed" },
                ].map((p) => (
                  <div key={p.text} className="perk">
                    <span className="perk-icon" style={{ fontSize: 15 }}>{p.icon}</span>
                    <span>{p.text}</span>
                  </div>
                ))}
              </div>

              {/* Share */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 13, color: "#9ca3af" }}>Share:</span>
                {["Facebook", "Twitter", "Pinterest"].map((s) => (
                  <a key={s} href="#" style={{ fontSize: 12, fontWeight: 500, color: "#6b7280", textDecoration: "none", padding: "5px 12px", borderRadius: 100, border: "1px solid #e5e7eb", transition: "color 0.2s, border-color 0.2s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#f97316"; (e.currentTarget as HTMLElement).style.borderColor = "#f97316"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#6b7280"; (e.currentTarget as HTMLElement).style.borderColor = "#e5e7eb"; }}>
                    {s}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div style={{ marginTop: 64, borderBottom: "1px solid #f0f0ee" }}>
            <div style={{ display: "flex", gap: 32 }}>
              {(["description", "details", "reviews"] as const).map((tab) => (
                <button key={tab} className={`tab-btn${activeTab === tab ? " active" : ""}`} onClick={() => setActiveTab(tab)}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: "32px 0 0", maxWidth: 680 }}>
            {activeTab === "description" && (
              <p style={{ fontSize: 15, lineHeight: 1.8, color: "#4b5563", fontWeight: 300 }}>
                {product.description || "No description available for this product."}
              </p>
            )}
            {activeTab === "details" && (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {(product.details && product.details.length > 0 ? product.details : [
                  `Product ID: ${product.product_id}`,
                  `Category: ${product.category}`,
                  `Stock: ${product.stock} units available`,
                  product.is_new ? "New Arrival" : null,
                  product.is_featured ? "Featured Product" : null,
                ].filter(Boolean) as string[]).map((d) => (
                  <li key={d} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid #f3f4f6", fontSize: 14, color: "#374151" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                    {d}
                  </li>
                ))}
              </ul>
            )}
            {activeTab === "reviews" && (
              <div>
                {/* Stats summary */}
                <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "24px", background: "#fff", borderRadius: 16, border: "1px solid #f0f0ee", marginBottom: 24 }}>
                  <div style={{ textAlign: "center", minWidth: 100 }}>
                    <p style={{ fontSize: 48, fontWeight: 700, color: "#111110", margin: 0, lineHeight: 1 }}>{reviewStats.average}</p>
                    <Stars rating={reviewStats.average} size={16} />
                    <p style={{ fontSize: 12, color: "#9ca3af", margin: "6px 0 0" }}>{reviewStats.total} {reviewStats.total === 1 ? "review" : "reviews"}</p>
                  </div>
                  <div style={{ flex: 1 }}>
                    {[5,4,3,2,1].map((star) => {
                      const count = reviewStats.breakdown[star] || 0;
                      const pct = reviewStats.total > 0 ? (count / reviewStats.total) * 100 : 0;
                      return (
                        <div key={star} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                          <span style={{ fontSize: 12, color: "#9ca3af", width: 8 }}>{star}</span>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="#f97316" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                          <div style={{ flex: 1, height: 6, background: "#f3f4f6", borderRadius: 100, overflow: "hidden" }}>
                            <div style={{ width: `${pct}%`, height: "100%", background: "#f97316", borderRadius: 100 }} />
                          </div>
                          <span style={{ fontSize: 12, color: "#9ca3af", width: 28 }}>{Math.round(pct)}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Review form trigger / form */}
                {!showReviewForm ? (
                  <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <button
                      onClick={async () => {
                        const { data: { user } } = await supabase.auth.getUser();
                        if (!user) {
                          router.push(`/auth/login?redirect=${routes.productDetail(product.id)}`);
                          return;
                        }
                        setShowReviewForm(true);
                        setEditingReview(null);
                        setNewRating(0);
                        setNewComment("");
                        setNewImageFiles([]);
                        setNewVideoFile(null);
                        setReviewError("");
                      }}
                      style={{ padding: "10px 28px", background: "#f97316", color: "#fff", borderRadius: 100, border: "none", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
                    >
                      Write a Review
                    </button>
                  </div>
                ) : (
                  <div style={{ padding: "24px", background: "#fff", borderRadius: 16, border: "1px solid #f0f0ee", marginBottom: 32 }}>
                    <p style={{ fontSize: 15, fontWeight: 600, color: "#111110", marginBottom: 16 }}>
                      {editingReview ? "Edit Your Review" : "Write Your Review"}
                    </p>
                    {/* Star selector */}
                    <div className="star-picker-inner" style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                      {[1, 2, 3, 4, 5].map((s) => {
                        const isFilled = s <= newRating;
                        return (
                          <button
                            key={s}
                            onClick={() => setNewRating(s)}
                            onMouseEnter={(e) => {
                              const parent = e.currentTarget.parentElement;
                              if (!parent) return;
                              Array.from(parent.children).forEach((child, i) => {
                                const svg = child.querySelector("svg");
                                if (svg) {
                                  svg.style.opacity = i < s ? "1" : "0.3";
                                  svg.style.fill = i < s ? "#f97316" : "none";
                                }
                              });
                            }}
                            onMouseLeave={() => {
                              const parent = document.querySelector(".star-picker-inner");
                              if (!parent) return;
                              Array.from(parent.children).forEach((child, i) => {
                                const svg = child.querySelector("svg");
                                if (svg) {
                                  svg.style.opacity = i < newRating ? "1" : "0.3";
                                  svg.style.fill = i < newRating ? "#f97316" : "none";
                                }
                              });
                            }}
                            style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                          >
                            <svg width="28" height="28" viewBox="0 0 24 24"
                              fill={isFilled ? "#f97316" : "none"}
                              stroke="#f97316" strokeWidth="1.8"
                              style={{ opacity: isFilled ? 1 : 0.3, transition: "opacity 0.15s" }}>
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                          </button>
                        );
                      })}
                    </div>
                    <textarea
                      placeholder="Share your thoughts about this product..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={4}
                      style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 14, fontFamily: "'DM Sans', sans-serif", resize: "vertical", outline: "none", boxSizing: "border-box" }}
                    />
                    {/* Image uploads */}
                    <div style={{ marginTop: 12 }}>
                      <p style={{ fontSize: 12, fontWeight: 500, color: "#374151", marginBottom: 6 }}>Photos (max 5MB each)</p>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        multiple
                        onChange={(e) => setNewImageFiles(Array.from(e.target.files || []))}
                        style={{ width: "100%", padding: 8, borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box" }}
                      />
                      {newImageFiles.length > 0 && (
                        <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                          {newImageFiles.map((f, i) => (
                            <div key={i} style={{ position: "relative" }}>
                              <img src={URL.createObjectURL(f)} alt={`Preview ${i + 1}`}
                                style={{ width: 64, height: 64, borderRadius: 8, objectFit: "cover", border: "1px solid #f0f0ee" }} />
                              <button onClick={() => setNewImageFiles((prev) => prev.filter((_, j) => j !== i))}
                                style={{ position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: "50%", background: "#dc2626", color: "#fff", border: "none", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {editingReview && editingReview.images && editingReview.images.length > 0 && (
                        <div style={{ marginTop: 8 }}>
                          <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 4 }}>Current images:</p>
                          <div style={{ display: "flex", gap: 6 }}>
                            {editingReview.images.map((url, i) => (
                              <img key={i} src={url} alt={`Current ${i + 1}`}
                                style={{ width: 48, height: 48, borderRadius: 6, objectFit: "cover", border: "1px solid #f0f0ee" }} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Video upload */}
                    <div style={{ marginTop: 8 }}>
                      <p style={{ fontSize: 12, fontWeight: 500, color: "#374151", marginBottom: 6 }}>Video (optional, max 50MB)</p>
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/ogg"
                        onChange={(e) => setNewVideoFile(e.target.files?.[0] || null)}
                        style={{ width: "100%", padding: 8, borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box" }}
                      />
                      {newVideoFile && (
                        <p style={{ fontSize: 11, color: "#16a34a", marginTop: 4 }}>{newVideoFile.name} selected</p>
                      )}
                      {editingReview && editingReview.video && !newVideoFile && (
                        <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>Current video: {editingReview.video}</p>
                      )}
                    </div>
                    {reviewError && <p style={{ color: "#dc2626", fontSize: 12, marginTop: 8 }}>{reviewError}</p>}
                    <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                      <button
                        onClick={handleSubmitReview}
                        disabled={submittingReview || newRating === 0}
                        style={{ padding: "10px 28px", background: newRating === 0 ? "#d1d5db" : "#f97316", color: "#fff", borderRadius: 100, border: "none", fontSize: 14, fontWeight: 500, cursor: newRating === 0 ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif" }}
                      >
                        {submittingReview ? "Submitting..." : editingReview ? "Update Review" : "Submit Review"}
                      </button>
                      <button
                        onClick={() => { setShowReviewForm(false); setEditingReview(null); setNewRating(0); setNewComment(""); setNewImageFiles([]); setNewVideoFile(null); setReviewError(""); }}
                        style={{ padding: "10px 28px", background: "#fff", color: "#6b7280", borderRadius: 100, border: "1px solid #e5e7eb", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Review list */}
                {reviewLoading ? (
                  <p style={{ fontSize: 14, color: "#9ca3af", textAlign: "center" }}>Loading reviews...</p>
                ) : reviews.length === 0 ? (
                  <p style={{ fontSize: 14, color: "#9ca3af", textAlign: "center" }}>Be the first to review this product!</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {reviews.map((review) => (
                      <div key={review.id} style={{ padding: "20px", background: "#fff", borderRadius: 16, border: "1px solid #f0f0ee" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, color: "#6b7280", overflow: "hidden" }}>
                            {review.user?.avatar_url ? (
                              <img src={review.user.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              ((review.user?.first_name?.[0] || "U") + (review.user?.last_name?.[0] || "")).toUpperCase()
                            )}
                          </div>
                          <div>
                            <p style={{ fontSize: 14, fontWeight: 600, color: "#111110", margin: 0 }}>
                              {review.user ? `${review.user.first_name} ${review.user.last_name}` : "Anonymous"}
                            </p>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <Stars rating={review.rating} size={12} />
                              <span style={{ fontSize: 11, color: "#9ca3af" }}>
                                {new Date(review.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                              </span>
                            </div>
                          </div>
                        </div>
                        {review.comment && (
                          <p style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.6, margin: 0, fontWeight: 300 }}>{review.comment}</p>
                        )}
                        {review.images && review.images.length > 0 && (
                          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                            {review.images.map((url, i) => (
                              <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                                <img src={url} alt={`Review photo ${i + 1}`}
                                  style={{ width: 80, height: 80, borderRadius: 10, objectFit: "cover", border: "1px solid #f0f0ee" }} />
                              </a>
                            ))}
                          </div>
                        )}
                        {review.video && (
                          <div style={{ marginTop: 12 }}>
                            <a href={review.video} target="_blank" rel="noopener noreferrer"
                              style={{ fontSize: 13, color: "#f97316", textDecoration: "underline", textUnderlineOffset: 3 }}>
                              ▶ Watch Video
                            </a>
                          </div>
                        )}
                        {currentUserId === review.user_id && (
                          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12, paddingTop: 12, borderTop: "1px solid #f3f4f6" }}>
                            <button onClick={() => handleEditReview(review)}
                              style={{ padding: "6px 16px", background: "#fff", color: "#f97316", borderRadius: 100, border: "1px solid #f97316", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                              Edit
                            </button>
                            {deletingReviewId === review.id ? (
                              <span style={{ fontSize: 12, color: "#6b7280", display: "flex", alignItems: "center", gap: 8 }}>
                                Delete?
                                <button onClick={() => handleDeleteReview(review.id)}
                                  style={{ padding: "4px 12px", background: "#dc2626", color: "#fff", borderRadius: 100, border: "none", fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                                  Yes
                                </button>
                                <button onClick={() => setDeletingReviewId(null)}
                                  style={{ padding: "4px 12px", background: "#fff", color: "#6b7280", borderRadius: 100, border: "1px solid #d1d5db", fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                                  No
                                </button>
                              </span>
                            ) : (
                              <button onClick={() => setDeletingReviewId(review.id)}
                                style={{ padding: "6px 16px", background: "#fff", color: "#dc2626", borderRadius: 100, border: "1px solid #e5e7eb", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                                Delete
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Related Products ── */}
          {relatedProducts.length > 0 && (
            <div style={{ marginTop: 72 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: "#f97316", margin: "0 0 6px" }}>Discover more</p>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 600, margin: 0, letterSpacing: "-0.02em" }}>You May Also Like</h2>
                </div>
                <Link href={routes.products} style={{ fontSize: 13, fontWeight: 500, color: "#f97316", textDecoration: "none", display: "flex", alignItems: "center", gap: 4, border: "1.5px solid #f97316", padding: "8px 18px", borderRadius: 100, transition: "background 0.2s, color 0.2s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#f97316"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#f97316"; }}>
                  View All →
                </Link>
              </div>
              <div className="related-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
                {relatedProducts.map((p) => <RelatedCard key={p.id} product={p} />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}