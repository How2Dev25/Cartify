"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/app/lib/supabase";
import { isAdmin } from "@/app/lib/auth";
import { useRouter } from "next/navigation";
import gsap from "gsap";

interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  images: string[] | null;
  video: string | null;
  created_at: string;
  updated_at: string;
}

interface ReviewWithDetails extends Review {
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    images: string[];
    product_id: string;
  } | null;
  user_profile: {
    first_name: string;
    last_name: string;
    email: string;
    avatar_url: string | null;
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

const ratingOptions = [
  { value: "all", label: "All Ratings" },
  { value: "5", label: "★★★★★ (5)" },
  { value: "4", label: "★★★★ (4)" },
  { value: "3", label: "★★★ (3)" },
  { value: "2", label: "★★ (2)" },
  { value: "1", label: "★ (1)" },
];

export default function AdminReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<ReviewWithDetails[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<ReviewWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRating, setSelectedRating] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedReview, setSelectedReview] = useState<ReviewWithDetails | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const detailModalContentRef = useRef<HTMLDivElement>(null);
  const deleteModalContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      const admin = await isAdmin();
      if (!admin) router.push("/");
    };
    checkAdmin();
    fetchReviews();
  }, []);

  useEffect(() => {
    filterAndSortReviews();
  }, [reviews, searchQuery, selectedRating, sortBy]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) {
        setReviews([]);
        return;
      }

      const productIds = [...new Set(data.map((r) => r.product_id))];
      const userIds = [...new Set(data.map((r) => r.user_id))];

      const [{ data: products }, { data: users }] = await Promise.all([
        supabase.from("products").select("id, name, price, image_url, images, product_id").in("id", productIds),
        supabase.from("users").select("id, first_name, last_name, email, avatar_url").in("id", userIds),
      ]);

      const productMap = Object.fromEntries((products || []).map((p) => [p.id, p]));
      const userMap = Object.fromEntries((users || []).map((u) => [u.id, u]));

      setReviews(
        (data as Review[]).map((r) => ({
          ...r,
          product: productMap[r.product_id] || null,
          user_profile: userMap[r.user_id] || null,
        }))
      );
    } catch (err: any) {
      console.error("Error fetching reviews:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortReviews = () => {
    let filtered = [...reviews];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.comment?.toLowerCase().includes(q) ||
          r.product?.name.toLowerCase().includes(q) ||
          r.user_profile?.first_name.toLowerCase().includes(q) ||
          r.user_profile?.last_name.toLowerCase().includes(q)
      );
    }

    if (selectedRating !== "all") {
      filtered = filtered.filter((r) => r.rating === parseInt(selectedRating));
    }

    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case "highest":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "lowest":
        filtered.sort((a, b) => a.rating - b.rating);
        break;
    }

    setFilteredReviews(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1);
  };

  const getCurrentPageItems = () => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredReviews.slice(start, start + itemsPerPage);
  };

  const paginate = (page: number) => {
    setCurrentPage(page);
    document.getElementById("reviews-table")?.scrollIntoView({ behavior: "smooth" });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedRating("all");
    setSortBy("newest");
  };

  const openDetailModal = (review: ReviewWithDetails) => {
    setSelectedReview(review);
    setShowDetailModal(true);
    setTimeout(() => {
      if (detailModalContentRef.current) {
        gsap.fromTo(detailModalContentRef.current,
          { scale: 0.9, opacity: 0, y: 30 },
          { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "back.out(0.4)" }
        );
      }
    }, 0);
  };

  const closeDetailModal = () => {
    if (detailModalContentRef.current) {
      gsap.to(detailModalContentRef.current, {
        scale: 0.9, opacity: 0, y: 30, duration: 0.3, ease: "power2.in",
        onComplete: () => { setShowDetailModal(false); setSelectedReview(null); }
      });
    } else {
      setShowDetailModal(false);
      setSelectedReview(null);
    }
  };

  const openDeleteConfirm = (reviewId: string) => {
    setDeleteConfirm(reviewId);
    setTimeout(() => {
      if (deleteModalContentRef.current) {
        gsap.fromTo(deleteModalContentRef.current,
          { scale: 0.9, opacity: 0, y: 30 },
          { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "back.out(0.4)" }
        );
      }
    }, 0);
  };

  const closeDeleteConfirm = () => {
    if (deleteModalContentRef.current) {
      gsap.to(deleteModalContentRef.current, {
        scale: 0.9, opacity: 0, y: 30, duration: 0.3, ease: "power2.in",
        onComplete: () => setDeleteConfirm(null)
      });
    } else {
      setDeleteConfirm(null);
    }
  };

  const deleteReview = async (reviewId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from("reviews")
        .delete()
        .eq("id", reviewId);

      if (deleteError) throw deleteError;

      setSuccess("Review deleted successfully!");
      closeDeleteConfirm();
      await fetchReviews();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("Error deleting review:", err);
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading reviews...</p>
        </div>
      </div>
    );
  }

  const currentReviews = getCurrentPageItems();
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, filteredReviews.length);

  return (
    <>
      <div className="space-y-6">
        {success && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {success}
            </div>
          </div>
        )}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Reviews Management</h3>
                <p className="text-sm text-gray-500 mt-1">View and moderate customer reviews</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by product, user, or comment..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 text-black pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                  />
                </div>
              </div>

              <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
                className="px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
              >
                {ratingOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 whitespace-nowrap">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 px-3 py-2 border text-black border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest">Highest Rated</option>
                  <option value="lowest">Lowest Rated</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500">
                Showing {filteredReviews.length > 0 ? startIndex : 0} to {endIndex} of {filteredReviews.length} reviews
              </div>
              {(searchQuery || selectedRating !== "all") && (
                <button onClick={clearFilters} className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                  Clear all filters
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto" id="reviews-table">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                          {review.product?.image_url ? (
                            <img src={review.product.image_url} alt={review.product.name} className="w-full h-full object-cover" />
                          ) : (
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{review.product?.name || "Unknown Product"}</p>
                          <p className="text-xs text-gray-500">ID: {review.product?.product_id || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          {review.user_profile?.avatar_url ? (
                            <img src={review.user_profile.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-semibold text-gray-500">
                              {((review.user_profile?.first_name?.[0] || "U") + (review.user_profile?.last_name?.[0] || "")).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {review.user_profile ? `${review.user_profile.first_name} ${review.user_profile.last_name}` : "Anonymous"}
                          </p>
                          <p className="text-xs text-gray-500">{review.user_profile?.email || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Stars rating={review.rating} size={14} />
                      <span className="text-xs text-gray-500 ml-2">({review.rating}/5)</span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-sm text-gray-600 truncate">{review.comment || "—"}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {new Date(review.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => openDetailModal(review)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium transition px-2 py-1 rounded hover:bg-blue-50">
                          View
                        </button>
                        <button onClick={() => openDeleteConfirm(review.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium transition px-2 py-1 rounded hover:bg-red-50">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Previous
              </button>
              <div className="flex gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => paginate(pageNum)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition ${currentPage === pageNum ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Next
              </button>
            </div>
          )}

          {filteredReviews.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No reviews found matching your filters</p>
              <button onClick={clearFilters} className="mt-4 text-orange-500 hover:text-orange-600 font-medium">Clear all filters</button>
            </div>
          )}
        </div>
      </div>

      {/* Review Detail Modal */}
      {showDetailModal && selectedReview && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={(e) => { if (e.target === e.currentTarget) closeDetailModal(); }}>
          <div ref={detailModalContentRef} className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-orange-50 to-white p-6 border-b border-gray-200 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Review Details</h3>
                  <p className="text-sm text-gray-500 mt-1">Full review information</p>
                </div>
                <button onClick={closeDetailModal} className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 18" /></svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Product Info */}
              {selectedReview.product && (
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                    <img
                      src={selectedReview.product.image_url || (selectedReview.product.images?.[0]) || "https://placehold.co/200x200?text=No+Image"}
                      alt={selectedReview.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-base">{selectedReview.product.name}</p>
                    <p className="text-sm text-gray-500">ID: {selectedReview.product.product_id}</p>
                    <p className="text-sm font-medium text-orange-600">₱{selectedReview.product.price.toFixed(2)}</p>
                  </div>
                </div>
              )}

              {/* Customer Info */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Customer</h4>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {selectedReview.user_profile?.avatar_url ? (
                      <img src={selectedReview.user_profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-gray-500">
                        {((selectedReview.user_profile?.first_name?.[0] || "U") + (selectedReview.user_profile?.last_name?.[0] || "")).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {selectedReview.user_profile ? `${selectedReview.user_profile.first_name} ${selectedReview.user_profile.last_name}` : "Anonymous"}
                    </p>
                    <p className="text-sm text-gray-500">{selectedReview.user_profile?.email || "—"}</p>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Rating</h4>
                <div className="flex items-center gap-3">
                  <Stars rating={selectedReview.rating} size={22} />
                  <span className="text-lg font-semibold text-gray-900">{selectedReview.rating}/5</span>
                </div>
              </div>

              {/* Comment */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Comment</h4>
                <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-4 rounded-xl">
                  {selectedReview.comment || "No comment provided."}
                </p>
              </div>

              {/* Images */}
              {selectedReview.images && selectedReview.images.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Photos ({selectedReview.images.length})</h4>
                  <div className="flex flex-wrap gap-3">
                    {selectedReview.images.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                        <img src={url} alt={`Review photo ${i + 1}`}
                          className="w-24 h-24 rounded-xl object-cover border border-gray-200 hover:opacity-90 transition" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Video */}
              {selectedReview.video && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Video</h4>
                  <a href={selectedReview.video} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition font-medium text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    Watch Video
                  </a>
                </div>
              )}

              {/* Date */}
              <div className="flex gap-6 text-sm text-gray-500 pt-2 border-t border-gray-100">
                <span>Reviewed: {new Date(selectedReview.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                {selectedReview.updated_at !== selectedReview.created_at && (
                  <span>Updated: {new Date(selectedReview.updated_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 p-6 border-t border-gray-200 rounded-b-2xl flex justify-end gap-3">
              <button onClick={closeDetailModal}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                Close
              </button>
              <button onClick={() => { closeDetailModal(); setTimeout(() => openDeleteConfirm(selectedReview.id), 300); }}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-colors font-medium shadow-md">
                Delete Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={(e) => { if (e.target === e.currentTarget) closeDeleteConfirm(); }}>
          <div ref={deleteModalContentRef} className="bg-white rounded-2xl shadow-2xl max-w-sm w-full">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Delete Review</h3>
              <p className="text-sm text-gray-500 text-center mb-6">Are you sure you want to delete this review? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={closeDeleteConfirm}
                  className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  Cancel
                </button>
                <button onClick={() => deleteReview(deleteConfirm)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-colors font-medium shadow-md">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
