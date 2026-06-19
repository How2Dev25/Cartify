"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { routes } from "@/app/routes";
import { supabase } from "@/app/lib/supabase";
import { ReviewStats, fetchProductsWithRatings } from "@/app/lib/reviews";

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

const categories = [
  { key: "all", label: "All" },
  { key: "footwear", label: "Footwear" },
  { key: "accessories", label: "Accessories" },
  { key: "bags", label: "Bags" },
  { key: "electronics", label: "Electronics" },
  { key: "clothing", label: "Clothing" },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill={star <= Math.round(rating) ? "#f97316" : "none"}
          stroke="#f97316"
          strokeWidth="2"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

function ProductCard({ product, rating }: { product: Product; rating?: ReviewStats }) {
  const [wished, setWished] = useState(false);
  const router = useRouter();
  const inStock = product.stock > 0;
  const displayImage = product.image_url || "https://placehold.co/400x400?text=No+Image";

  return (
    <div
      className="product-card"
      style={{ cursor: "pointer" }}
      onClick={() => router.push(routes.productDetail(product.id))}
    >
      {/* Image */}
      <div className="product-img-wrap">
        <img src={displayImage} alt={product.name} className="product-img" />

        {/* Badges */}
        <div style={{ position: "absolute", top: 12, left: 12, display: "flex", flexDirection: "column", gap: 6 }}>
          {product.is_new && (
            <span className="badge-new">New</span>
          )}
          {product.discount > 0 && (
            <span className="badge-discount">-{product.discount}%</span>
          )}
          {!inStock && (
            <span className="badge-oos">Out of Stock</span>
          )}
        </div>

        {/* Wishlist */}
        <button
          className={`wish-btn${wished ? " wished" : ""}`}
          onClick={(e) => { e.stopPropagation(); setWished((v) => !v); }}
          aria-label="Wishlist"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={wished ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </button>

        {/* Quick Shop overlay */}
        <div className="quick-shop-overlay" onClick={(e) => e.stopPropagation()}>
          <Link
            href={routes.productDetail(product.id)}
            className="quick-shop-btn"
            onClick={(e) => e.stopPropagation()}
          >
            View Product
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="product-info">
        <p className="product-category">
          {categories.find(c => c.key === product.category)?.label || product.category || "General"}
        </p>
        <h3 className="product-name">{product.name}</h3>

        {rating && rating.total > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
            <StarRating rating={rating.average} />
            <span style={{ fontSize: 11, color: "#9ca3af" }}>({rating.total})</span>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span className="product-price">₱{product.price.toFixed(2)}</span>
            {product.original_price > 0 && (
              <span className="product-original">₱{product.original_price.toFixed(2)}</span>
            )}
          </div>

        
        </div>
      </div>
    </div>
  );
}

export default function ProductSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("featured");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [productRatings, setProductRatings] = useState<Record<string, ReviewStats>>({});

  // Fetch products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProducts(data || []);
        // Fetch ratings for all products
        if (data && data.length > 0) {
          const ids = data.map((p) => p.id);
          const ratings = await fetchProductsWithRatings(ids);
          setProductRatings(ratings);
        }
      } catch (error: any) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const getFilteredAndSortedProducts = () => {
    let filtered = products;

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        return [...filtered].sort((a, b) => a.price - b.price);
      case "price-high":
        return [...filtered].sort((a, b) => b.price - a.price);
      case "rating":
        return [...filtered].sort((a, b) => {
          const aRating = productRatings[a.id]?.average || 0;
          const bRating = productRatings[b.id]?.average || 0;
          if (bRating !== aRating) return bRating - aRating;
          const aCount = productRatings[a.id]?.total || 0;
          const bCount = productRatings[b.id]?.total || 0;
          return bCount - aCount;
        });
      default:
        // Featured: show is_featured first, then by creation date
        return [...filtered].sort((a, b) => {
          if (a.is_featured === b.is_featured) {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          }
          return a.is_featured ? -1 : 1;
        });
    }
  };

  const filteredProducts = getFilteredAndSortedProducts();

  if (loading) {
    return (
      <section className="products-section">
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 48, height: 48, border: "4px solid #f3f4f6", borderTopColor: "#f97316", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }}></div>
              <p style={{ color: "#9ca3af" }}>Loading products...</p>
            </div>
          </div>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </section>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');

        .products-section {
          background: #fafaf9;
          padding: 72px 0;
          font-family: 'DM Sans', sans-serif;
        }

        .section-eyebrow {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #f97316;
          margin-bottom: 8px;
        }
        .section-title {
          font-size: clamp(26px, 4vw, 36px);
          font-weight: 600;
          color: #111110;
          letter-spacing: -0.03em;
          line-height: 1.15;
        }
        .section-title span { color: #f97316; }
        .section-sub {
          font-size: 14px;
          color: #9ca3af;
          font-weight: 300;
          margin-top: 6px;
        }

        /* Search Bar */
        .search-wrapper {
          position: relative;
          width: 100%;
          max-width: 320px;
        }
        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: #9ca3af;
        }
        .search-input {
          width: 100%;
          padding: 10px 16px 10px 40px;
          border: 1px solid #e5e7eb;
          border-radius: 100px;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          background: #fff;
          transition: all 0.2s;
          outline: none;
        }
        .search-input:focus {
          border-color: #f97316;
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
        }
        .search-input::placeholder {
          color: #d1d5db;
        }
        .clear-search {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #9ca3af;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          border-radius: 50%;
          transition: background 0.2s;
        }
        .clear-search:hover {
          background: #f3f4f6;
          color: #6b7280;
        }

        /* Sort select */
        .sort-select {
          appearance: none;
          background: #fff url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239ca3af' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right 14px center;
          border: 1px solid #e5e7eb;
          border-radius: 100px;
          padding: 9px 38px 9px 16px;
          font-size: 13px;
          font-weight: 500;
          color: #374151;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          outline: none;
          transition: border-color 0.2s;
          min-width: 180px;
        }
        .sort-select:focus { border-color: #f97316; }

        /* Category pills */
        .cat-pill {
          padding: 8px 18px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 500;
          white-space: nowrap;
          cursor: pointer;
          border: 1px solid #e5e7eb;
          background: #fff;
          color: #6b7280;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
        }
        .cat-pill:hover { border-color: #f97316; color: #f97316; }
        .cat-pill.active {
          background: #f97316;
          border-color: #f97316;
          color: #fff;
        }

        /* Product card */
        .product-card {
          background: #fff;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #f0f0ee;
          transition: box-shadow 0.25s ease, transform 0.25s ease;
        }
        .product-card:hover {
          box-shadow: 0 12px 40px rgba(0,0,0,0.10);
          transform: translateY(-3px);
        }

        .product-img-wrap {
          position: relative;
          overflow: hidden;
          background: #f8f8f7;
          aspect-ratio: 1 / 1;
        }
        .product-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s cubic-bezier(0.4,0,0.2,1);
        }
        .product-card:hover .product-img { transform: scale(1.06); }

        /* Badges */
        .badge-new {
          background: #111110; color: #fff;
          font-size: 10px; font-weight: 600;
          padding: 3px 9px; border-radius: 100px;
          letter-spacing: 0.06em; text-transform: uppercase;
          font-family: 'DM Sans', sans-serif;
        }
        .badge-discount {
          background: #f97316; color: #fff;
          font-size: 10px; font-weight: 600;
          padding: 3px 9px; border-radius: 100px;
          letter-spacing: 0.04em;
          font-family: 'DM Sans', sans-serif;
        }
        .badge-oos {
          background: #f3f4f6; color: #6b7280;
          font-size: 10px; font-weight: 500;
          padding: 3px 9px; border-radius: 100px;
          font-family: 'DM Sans', sans-serif;
        }

        /* Wishlist button */
        .wish-btn {
          position: absolute; top: 12px; right: 12px;
          width: 34px; height: 34px;
          border-radius: 50%;
          background: rgba(255,255,255,0.9);
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: #d1d5db;
          backdrop-filter: blur(4px);
          transition: color 0.2s, background 0.2s, transform 0.15s;
        }
        .wish-btn:hover, .wish-btn.wished {
          color: #f97316;
          background: #fff3ed;
          transform: scale(1.1);
        }

        /* Quick shop */
        .quick-shop-overlay {
          position: absolute; bottom: 0; left: 0; right: 0;
          padding: 12px;
          transform: translateY(100%);
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .product-card:hover .quick-shop-overlay { transform: translateY(0); }

        .quick-shop-btn {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          width: 100%;
          background: rgba(17,17,16,0.88);
          color: #fff;
          border-radius: 10px;
          padding: 11px 0;
          font-size: 13px; font-weight: 500;
          text-decoration: none;
          backdrop-filter: blur(8px);
          transition: background 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .quick-shop-btn:hover { background: rgba(249,115,22,0.92); }

        /* Product info */
        .product-info { padding: 16px; }

        .product-category {
          font-size: 11px; font-weight: 500;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #f97316; margin: 0 0 4px;
        }
        .product-name {
          font-size: 15px; font-weight: 500;
          color: #111110; margin: 0 0 8px;
          line-height: 1.3;
        }
        .product-price {
          font-size: 18px; font-weight: 600;
          color: #f97316;
        }
        .product-original {
          font-size: 13px; color: #d1d5db;
          text-decoration: line-through;
        }

        /* Add to cart */
        .add-cart-btn {
          width: 36px; height: 36px;
          border-radius: 10px;
          background: #fff3ed;
          border: 1px solid #ffe4d1;
          color: #f97316;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, transform 0.15s;
          flex-shrink: 0;
        }
        .add-cart-btn:hover {
          background: #f97316; color: #fff;
          border-color: #f97316;
          transform: scale(1.08);
        }
        .add-cart-btn.disabled {
          background: #f3f4f6; border-color: #e5e7eb;
          color: #d1d5db; cursor: not-allowed;
          transform: none;
        }

        /* Empty state */
        .empty-state {
          text-align: center; padding: 60px 20px;
          color: #9ca3af;
        }

        /* View all */
        .view-all-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 13px 32px;
          border-radius: 100px;
          border: 1.5px solid #f97316;
          color: #f97316;
          font-size: 14px; font-weight: 500;
          text-decoration: none;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.2s, color 0.2s, transform 0.15s;
        }
        .view-all-btn:hover {
          background: #f97316; color: #fff;
          transform: translateY(-1px);
        }
      `}</style>

      <section className="products-section">
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>

          {/* Header */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 32 }}>
            <div>
              <p className="section-eyebrow">Curated for you</p>
              <h2 className="section-title">
                Featured <span>Products</span>
              </h2>
              <p className="section-sub">{filteredProducts.length} items available</p>
            </div>

            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              {/* Search Bar */}
              <div className="search-wrapper">
                <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    className="clear-search"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {/* Category pills */}
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 32 }}>
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`cat-pill${selectedCategory === cat.key ? " active" : ""}`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Grid */}
          {filteredProducts.length === 0 ? (
            <div className="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: "0 auto 16px", color: "#d1d5db" }}>
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <p style={{ fontSize: 16, fontWeight: 500, color: "#374151", marginBottom: 6 }}>No products found</p>
              <p style={{ fontSize: 14 }}>Try adjusting your search or category filter</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                style={{
                  marginTop: 20,
                  padding: "8px 20px",
                  background: "#f97316",
                  color: "#fff",
                  border: "none",
                  borderRadius: "100px",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} rating={productRatings[product.id]} />
              ))}
            </div>
          )}

          {/* View all */}
          <div style={{ textAlign: "center", marginTop: 52 }}>
            <Link href={routes.products} className="view-all-btn">
              View All Products
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}