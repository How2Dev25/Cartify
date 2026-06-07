"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { routes } from "@/app/routes";

const products = [
  {
    id: 1,
    name: "Classic White Sneakers",
    price: 89.99,
    originalPrice: 129.99,
    discount: 30,
    rating: 4.5,
    reviews: 128,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
    category: "footwear",
    inStock: true,
    isNew: false,
    isFeatured: true,
  },
  {
    id: 2,
    name: "Premium Leather Watch",
    price: 199.99,
    originalPrice: 299.99,
    discount: 33,
    rating: 4.8,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
    category: "accessories",
    inStock: true,
    isNew: true,
    isFeatured: true,
  },
  {
    id: 3,
    name: "Designer Handbag",
    price: 149.99,
    originalPrice: 249.99,
    discount: 40,
    rating: 4.7,
    reviews: 234,
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop",
    category: "bags",
    inStock: true,
    isNew: false,
    isFeatured: true,
  },
  {
    id: 4,
    name: "Wireless Headphones",
    price: 79.99,
    originalPrice: 129.99,
    discount: 38,
    rating: 4.6,
    reviews: 567,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    category: "electronics",
    inStock: true,
    isNew: true,
    isFeatured: true,
  },
  {
    id: 5,
    name: "Sunglasses Collection",
    price: 59.99,
    originalPrice: 99.99,
    discount: 40,
    rating: 4.4,
    reviews: 45,
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop",
    category: "accessories",
    inStock: true,
    isNew: false,
    isFeatured: false,
  },
  {
    id: 6,
    name: "Running Shoes",
    price: 119.99,
    originalPrice: 159.99,
    discount: 25,
    rating: 4.9,
    reviews: 312,
    image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop",
    category: "footwear",
    inStock: true,
    isNew: true,
    isFeatured: false,
  },
  {
    id: 7,
    name: "Smart Watch",
    price: 249.99,
    originalPrice: 349.99,
    discount: 28,
    rating: 4.7,
    reviews: 178,
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&h=400&fit=crop",
    category: "electronics",
    inStock: false,
    isNew: false,
    isFeatured: false,
  },
  {
    id: 8,
    name: "Leather Backpack",
    price: 89.99,
    originalPrice: 129.99,
    discount: 30,
    rating: 4.5,
    reviews: 98,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
    category: "bags",
    inStock: true,
    isNew: false,
    isFeatured: false,
  },
];

const categories = [
  { key: "all", label: "All" },
  { key: "footwear", label: "Footwear" },
  { key: "accessories", label: "Accessories" },
  { key: "bags", label: "Bags" },
  { key: "electronics", label: "Electronics" },
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

function ProductCard({ product }: { product: typeof products[0] }) {
  const [wished, setWished] = useState(false);
  const router = useRouter();

  return (
    <div
      className="product-card"
      style={{ cursor: "pointer" }}
      onClick={() => router.push(routes.productDetail(product.id))}
    >
      {/* Image */}
      <div className="product-img-wrap">
        <img src={product.image} alt={product.name} className="product-img" />

        {/* Badges */}
        <div style={{ position: "absolute", top: 12, left: 12, display: "flex", flexDirection: "column", gap: 6 }}>
          {product.isNew && (
            <span className="badge-new">New</span>
          )}
          {product.discount > 0 && (
            <span className="badge-discount">-{product.discount}%</span>
          )}
          {!product.inStock && (
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
        <p className="product-category">{product.category}</p>
        <h3 className="product-name">{product.name}</h3>

        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
          <StarRating rating={product.rating} />
          <span style={{ fontSize: 12, color: "#9ca3af" }}>({product.reviews})</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span className="product-price">₱{product.price}</span>
            {product.originalPrice && (
              <span className="product-original">${product.originalPrice}</span>
            )}
          </div>

          <button
            className={`add-cart-btn${!product.inStock ? " disabled" : ""}`}
            disabled={!product.inStock}
            onClick={(e) => e.stopPropagation()}
            aria-label="Add to cart"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductSection() {
  const [sortBy, setSortBy] = useState("featured");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const getSortedProducts = () => {
    let filtered =
      selectedCategory === "all"
        ? products
        : products.filter((p) => p.category === selectedCategory);

    switch (sortBy) {
      case "price-low":
        return [...filtered].sort((a, b) => a.price - b.price);
      case "price-high":
        return [...filtered].sort((a, b) => b.price - a.price);
      case "rating":
        return [...filtered].sort((a, b) => b.rating - a.rating);
      default:
        return filtered;
    }
  };

  const sorted = getSortedProducts();

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
              <p className="section-sub">{sorted.length} items available</p>
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
          {sorted.length === 0 ? (
            <div className="empty-state">
              <p style={{ fontSize: 16, fontWeight: 500, color: "#374151", marginBottom: 6 }}>No products found</p>
              <p style={{ fontSize: 14 }}>Try a different category</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
              {sorted.map((product) => (
                <ProductCard key={product.id} product={product} />
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