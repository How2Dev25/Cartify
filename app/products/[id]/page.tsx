"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { routes } from "@/app/routes";

// ─── Data ────────────────────────────────────────────────────────────────────

const allProducts = [
  {
    id: 1,
    name: "Classic White Sneakers",
    price: 89.99,
    originalPrice: 129.99,
    discount: 30,
    rating: 4.5,
    reviews: 128,
    category: "Footwear",
    inStock: true,
    isNew: false,
    description:
      "Timeless white sneakers crafted from premium canvas with a vulcanised rubber sole. Versatile enough for any casual occasion — pair with denim, joggers, or a summer dress.",
    details: ["Premium canvas upper", "Vulcanised rubber sole", "Cushioned insole", "Reinforced toe cap", "Unisex fit"],
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&h=700&fit=crop",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=700&h=700&fit=crop",
      "https://images.unsplash.com/photo-1607522370275-f6fd0642f4e2?w=700&h=700&fit=crop",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=700&h=700&fit=crop",
    ],
    sizes: ["36", "37", "38", "39", "40", "41", "42", "43", "44"],
    colors: ["#f5f5f0", "#1a1a18", "#b45309"],
    colorNames: ["White", "Black", "Tan"],
  },
  {
    id: 2,
    name: "Premium Leather Watch",
    price: 199.99,
    originalPrice: 299.99,
    discount: 33,
    rating: 4.8,
    reviews: 89,
    category: "Accessories",
    inStock: true,
    isNew: true,
    description:
      "A refined timepiece featuring a genuine leather strap and mineral crystal glass. The slim 8mm case sits flush on the wrist for an understated, elegant look that transitions seamlessly from boardroom to weekend.",
    details: ["Japanese quartz movement", "Genuine leather strap", "Mineral crystal glass", "Water resistant 30m", "36mm case diameter"],
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&h=700&fit=crop",
      "https://images.unsplash.com/photo-1526045431048-f857369baa09?w=700&h=700&fit=crop",
      "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=700&h=700&fit=crop",
      "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=700&h=700&fit=crop",
    ],
    sizes: ["One Size"],
    colors: ["#92400e", "#1a1a18", "#6b7280"],
    colorNames: ["Tan", "Black", "Silver"],
  },
  {
    id: 3,
    name: "Designer Handbag",
    price: 149.99,
    originalPrice: 249.99,
    discount: 40,
    rating: 4.7,
    reviews: 234,
    category: "Bags",
    inStock: true,
    isNew: false,
    description:
      "Structured top-handle bag in pebbled vegan leather. Spacious enough for daily essentials with an internal zipped pocket and card slots. The gold-tone hardware adds a luxe finish.",
    details: ["Pebbled vegan leather", "Gold-tone hardware", "Top handle + detachable strap", "Internal zip pocket + 2 card slots", "Dimensions: 28 × 20 × 10 cm"],
    images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=700&h=700&fit=crop",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=700&h=700&fit=crop",
      "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=700&h=700&fit=crop",
      "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=700&h=700&fit=crop",
    ],
    sizes: ["One Size"],
    colors: ["#92400e", "#1a1a18", "#be185d"],
    colorNames: ["Tan", "Black", "Berry"],
  },
  {
    id: 4,
    name: "Wireless Headphones",
    price: 79.99,
    originalPrice: 129.99,
    discount: 38,
    rating: 4.6,
    reviews: 567,
    category: "Electronics",
    inStock: true,
    isNew: true,
    description:
      "Studio-quality sound in an over-ear design. 40-hour battery, active noise cancellation, and a foldable frame make these the perfect travel companion. Connects to two devices simultaneously.",
    details: ["40-hour battery life", "Active noise cancellation", "Bluetooth 5.2", "Dual-device pairing", "Foldable, travel-ready design"],
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&h=700&fit=crop",
      "https://images.unsplash.com/photo-1545127398-14699f92334b?w=700&h=700&fit=crop",
      "https://images.unsplash.com/photo-1577174881658-0f30ed549adc?w=700&h=700&fit=crop",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=700&h=700&fit=crop",
    ],
    sizes: ["One Size"],
    colors: ["#1a1a18", "#f5f5f0", "#dc2626"],
    colorNames: ["Black", "White", "Red"],
  },
  {
    id: 5,
    name: "Sunglasses Collection",
    price: 59.99,
    originalPrice: 99.99,
    discount: 40,
    rating: 4.4,
    reviews: 45,
    category: "Accessories",
    inStock: true,
    isNew: false,
    description: "UV400 polarised lenses in a lightweight acetate frame. Designed for all-day wear with a spring-hinge for a comfortable, secure fit.",
    details: ["UV400 polarised lenses", "Acetate frame", "Spring-hinge temples", "Includes hard case & cloth", "Unisex style"],
    images: [
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=700&h=700&fit=crop",
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=700&h=700&fit=crop",
      "https://images.unsplash.com/photo-1473496169904-658ba7574b0d?w=700&h=700&fit=crop",
      "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=700&h=700&fit=crop",
    ],
    sizes: ["One Size"],
    colors: ["#1a1a18", "#92400e", "#065f46"],
    colorNames: ["Black", "Tortoise", "Olive"],
  },
  {
    id: 6,
    name: "Running Shoes",
    price: 119.99,
    originalPrice: 159.99,
    discount: 25,
    rating: 4.9,
    reviews: 312,
    category: "Footwear",
    inStock: true,
    isNew: true,
    description: "Engineered mesh upper with responsive foam cushioning for long-distance comfort. The breathable construction keeps feet cool mile after mile.",
    details: ["Engineered mesh upper", "Responsive foam midsole", "Rubber outsole grip", "Breathable lining", "Reflective details"],
    images: [
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=700&h=700&fit=crop",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&h=700&fit=crop",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=700&h=700&fit=crop",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=700&h=700&fit=crop",
    ],
    sizes: ["36", "37", "38", "39", "40", "41", "42", "43", "44"],
    colors: ["#f97316", "#1a1a18", "#3b82f6"],
    colorNames: ["Orange", "Black", "Blue"],
  },
  {
    id: 7,
    name: "Smart Watch",
    price: 249.99,
    originalPrice: 349.99,
    discount: 28,
    rating: 4.7,
    reviews: 178,
    category: "Electronics",
    inStock: false,
    isNew: false,
    description: "Track your health, fitness and notifications from your wrist. Features heart-rate monitoring, GPS, sleep tracking and 7-day battery life in a scratch-resistant case.",
    details: ["Heart-rate & SpO2 monitoring", "Built-in GPS", "7-day battery life", "Sapphire crystal glass", "Water resistant 50m"],
    images: [
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=700&h=700&fit=crop",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&h=700&fit=crop",
      "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=700&h=700&fit=crop",
      "https://images.unsplash.com/photo-1526045431048-f857369baa09?w=700&h=700&fit=crop",
    ],
    sizes: ["One Size"],
    colors: ["#1a1a18", "#f5f5f0", "#f97316"],
    colorNames: ["Black", "Silver", "Orange"],
  },
  {
    id: 8,
    name: "Leather Backpack",
    price: 89.99,
    originalPrice: 129.99,
    discount: 30,
    rating: 4.5,
    reviews: 98,
    category: "Bags",
    inStock: true,
    isNew: false,
    description: "Full-grain leather backpack with a padded 15\" laptop sleeve and multiple organisational pockets. Ages beautifully — the more you use it, the better it looks.",
    details: ["Full-grain leather", "Padded 15\" laptop sleeve", "Multiple interior pockets", "Adjustable padded straps", "Capacity: 22L"],
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=700&h=700&fit=crop",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=700&h=700&fit=crop",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=700&h=700&fit=crop",
      "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=700&h=700&fit=crop",
    ],
    sizes: ["One Size"],
    colors: ["#92400e", "#1a1a18"],
    colorNames: ["Tan", "Black"],
  },
];

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

function RelatedCard({ product }: { product: typeof allProducts[0] }) {
  const router = useRouter();
  return (
    <div
      className="related-card"
      onClick={() => router.push(routes.productDetail(product.id))}
      style={{ cursor: "pointer" }}
    >
      <div style={{ aspectRatio: "1/1", overflow: "hidden", borderRadius: 12, background: "#f8f8f7", marginBottom: 12 }}>
        <img src={product.images[0]} alt={product.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
          className="related-img" />
      </div>
      <p style={{ fontSize: 11, color: "#f97316", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 3px" }}>{product.category}</p>
      <p style={{ fontSize: 14, fontWeight: 500, color: "#111110", margin: "0 0 4px", lineHeight: 1.3 }}>{product.name}</p>
      <p style={{ fontSize: 15, fontWeight: 600, color: "#f97316", margin: 0 }}>${product.price}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);
  const product = allProducts.find((p) => p.id === id) ?? allProducts[0];

  const [activeImg, setActiveImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState(0);
  const [qty, setQty] = useState(1);
  const [wished, setWished] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "details" | "reviews">("description");

  const related = allProducts.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4);
  const otherRelated = allProducts.filter((p) => p.id !== product.id && p.category !== product.category).slice(0, 4 - related.length);
  const relatedProducts = [...related, ...otherRelated].slice(0, 4);

  const handleAddToCart = () => {
    if (!product.inStock) return;
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2200);
  };

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
      `}</style>

      <div className="pdp-root">
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 80px" }}>

          {/* Breadcrumb */}
          <nav className="breadcrumb" style={{ marginBottom: 32 }}>
            <Link href={routes.home} className="breadcrumb a">Home</Link>
            <span className="breadcrumb-sep">›</span>
            <Link href={routes.products} className="breadcrumb a">Products</Link>
            <span className="breadcrumb-sep">›</span>
            <Link href={`${routes.products}?cat=${product.category.toLowerCase()}`} className="breadcrumb a">{product.category}</Link>
            <span className="breadcrumb-sep">›</span>
            <span className="breadcrumb-current">{product.name}</span>
          </nav>

          {/* Main layout */}
          <div className="pdp-grid" style={{ display: "flex", gap: 56, alignItems: "flex-start" }}>

            {/* ── Gallery ── */}
            <div style={{ flex: "0 0 52%", display: "flex", gap: 14 }}>

              {/* Thumbnails */}
              <div className="gallery-thumbs" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {product.images.map((img, i) => (
                  <img key={i} src={img} alt={`${product.name} view ${i + 1}`}
                    className={`thumb${activeImg === i ? " active" : ""}`}
                    onClick={() => setActiveImg(i)} />
                ))}
              </div>

              {/* Main image */}
              <div style={{ flex: 1, borderRadius: 20, overflow: "hidden", background: "#f8f8f7", position: "relative", aspectRatio: "1/1" }}>
                <img
                  src={product.images[activeImg]}
                  alt={product.name}
                  className="main-img"
                />
                {/* Badges */}
                <div style={{ position: "absolute", top: 16, left: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                  {product.isNew && (
                    <span style={{ background: "#111110", color: "#fff", fontSize: 10, fontWeight: 600, padding: "4px 10px", borderRadius: 100, letterSpacing: "0.08em", textTransform: "uppercase" }}>New</span>
                  )}
                  {product.discount > 0 && (
                    <span style={{ background: "#f97316", color: "#fff", fontSize: 10, fontWeight: 600, padding: "4px 10px", borderRadius: 100 }}>-{product.discount}%</span>
                  )}
                  {!product.inStock && (
                    <span style={{ background: "#f3f4f6", color: "#6b7280", fontSize: 10, fontWeight: 500, padding: "4px 10px", borderRadius: 100 }}>Out of Stock</span>
                  )}
                </div>

                {/* Nav arrows */}
                {product.images.length > 1 && (
                  <>
                    <button onClick={() => setActiveImg((i) => (i - 1 + product.images.length) % product.images.length)}
                      style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.88)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
                    </button>
                    <button onClick={() => setActiveImg((i) => (i + 1) % product.images.length)}
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

              {/* Rating */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <Stars rating={product.rating} size={15} />
                <span style={{ fontSize: 14, fontWeight: 500, color: "#374151" }}>{product.rating}</span>
                <span style={{ fontSize: 13, color: "#9ca3af" }}>({product.reviews} reviews)</span>
                {product.inStock
                  ? <span style={{ fontSize: 12, fontWeight: 500, color: "#16a34a", background: "#f0fdf4", padding: "3px 10px", borderRadius: 100 }}>● In Stock</span>
                  : <span style={{ fontSize: 12, fontWeight: 500, color: "#dc2626", background: "#fef2f2", padding: "3px 10px", borderRadius: 100 }}>● Out of Stock</span>
                }
              </div>

              {/* Price */}
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 28 }}>
                <span style={{ fontSize: 32, fontWeight: 700, color: "#f97316", letterSpacing: "-0.02em" }}>${product.price}</span>
                {product.originalPrice && (
                  <span style={{ fontSize: 18, color: "#d1d5db", textDecoration: "line-through" }}>${product.originalPrice}</span>
                )}
                {product.discount > 0 && (
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#f97316", background: "#fff3ed", padding: "3px 10px", borderRadius: 100 }}>Save {product.discount}%</span>
                )}
              </div>

              {/* Color selector */}
              {product.colors.length > 1 && (
                <div style={{ marginBottom: 24 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 10 }}>
                    Color — <span style={{ color: "#111110", fontWeight: 600 }}>{product.colorNames[selectedColor]}</span>
                  </p>
                  <div style={{ display: "flex", gap: 10 }}>
                    {product.colors.map((c, i) => (
                      <button
                        key={i}
                        className={`color-swatch${selectedColor === i ? " active" : ""}`}
                        style={{ background: c }}
                        onClick={() => setSelectedColor(i)}
                        aria-label={product.colorNames[i]}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Size selector */}
              {product.sizes[0] !== "One Size" && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "#374151", margin: 0 }}>
                      Size {selectedSize && <span style={{ color: "#111110", fontWeight: 600 }}>— EU {selectedSize}</span>}
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
                  <button className="qty-btn" style={{ border: "none", background: "none" }} onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                  <span style={{ fontSize: 15, fontWeight: 600, minWidth: 20, textAlign: "center" }}>{qty}</span>
                  <button className="qty-btn" style={{ border: "none", background: "none" }} onClick={() => setQty((q) => q + 1)}>+</button>
                </div>

                {/* Add to cart */}
                <button
                  className={`btn-cart${addedToCart ? " added" : ""}`}
                  disabled={!product.inStock}
                  onClick={handleAddToCart}
                >
                  {addedToCart ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                      Added to Cart
                    </>
                  ) : product.inStock ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                      Add to Cart
                    </>
                  ) : "Out of Stock"}
                </button>

                {/* Wishlist */}
                <button className={`btn-wish${wished ? " wished" : ""}`} onClick={() => setWished((v) => !v)} aria-label="Wishlist">
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
                  {tab === "reviews" && <span style={{ marginLeft: 6, fontSize: 12, color: "#9ca3af" }}>({product.reviews})</span>}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: "32px 0 0", maxWidth: 680 }}>
            {activeTab === "description" && (
              <p style={{ fontSize: 15, lineHeight: 1.8, color: "#4b5563", fontWeight: 300 }}>{product.description}</p>
            )}
            {activeTab === "details" && (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {product.details.map((d) => (
                  <li key={d} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid #f3f4f6", fontSize: 14, color: "#374151" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                    {d}
                  </li>
                ))}
              </ul>
            )}
            {activeTab === "reviews" && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "24px", background: "#fff", borderRadius: 16, border: "1px solid #f0f0ee", marginBottom: 24 }}>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 48, fontWeight: 700, color: "#111110", margin: 0, lineHeight: 1 }}>{product.rating}</p>
                    <Stars rating={product.rating} size={16} />
                    <p style={{ fontSize: 12, color: "#9ca3af", margin: "6px 0 0" }}>{product.reviews} reviews</p>
                  </div>
                  <div style={{ flex: 1 }}>
                    {[5,4,3,2,1].map((star) => {
                      const pct = star === 5 ? 62 : star === 4 ? 24 : star === 3 ? 9 : star === 2 ? 3 : 2;
                      return (
                        <div key={star} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                          <span style={{ fontSize: 12, color: "#9ca3af", width: 8 }}>{star}</span>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="#f97316" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                          <div style={{ flex: 1, height: 6, background: "#f3f4f6", borderRadius: 100, overflow: "hidden" }}>
                            <div style={{ width: `${pct}%`, height: "100%", background: "#f97316", borderRadius: 100 }} />
                          </div>
                          <span style={{ fontSize: 12, color: "#9ca3af", width: 28 }}>{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <p style={{ fontSize: 14, color: "#9ca3af", textAlign: "center" }}>Detailed reviews coming soon.</p>
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
