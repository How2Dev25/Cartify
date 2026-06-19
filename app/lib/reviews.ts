import { supabase } from "./supabase";

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  images: string[] | null;
  video: string | null;
  created_at: string;
  updated_at: string;
  user: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  } | null;
}

export interface ReviewStats {
  average: number;
  total: number;
  breakdown: { [star: number]: number };
}

export const fetchProductReviews = async (productId: string): Promise<Review[]> => {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return [];

    const userIds = [...new Set(data.map((r) => r.user_id))];
    const { data: users, error: userError } = await supabase
      .from("users")
      .select("id, first_name, last_name, avatar_url")
      .in("id", userIds);

    if (userError) throw userError;

    const userMap = Object.fromEntries(
      (users || []).map((u) => [u.id, { first_name: u.first_name, last_name: u.last_name, avatar_url: u.avatar_url }])
    );

    return (data as Review[]).map((r) => ({
      ...r,
      user: userMap[r.user_id] || null,
    }));
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
};

export const computeReviewStats = (reviews: Review[]): ReviewStats => {
  if (reviews.length === 0) {
    return { average: 0, total: 0, breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
  }

  const total = reviews.length;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const breakdown: { [star: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  reviews.forEach((r) => {
    breakdown[r.rating] = (breakdown[r.rating] || 0) + 1;
  });

  return {
    average: Math.round((sum / total) * 10) / 10,
    total,
    breakdown,
  };
};

export const fetchProductReviewStats = async (productId: string): Promise<ReviewStats> => {
  const reviews = await fetchProductReviews(productId);
  return computeReviewStats(reviews);
};

export const hasUserReviewed = async (productId: string, userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("id")
      .eq("product_id", productId)
      .eq("user_id", userId)
      .single();

    if (error) return false;
    return !!data;
  } catch {
    return false;
  }
};

export const createReview = async (
  productId: string,
  userId: string,
  rating: number,
  comment?: string,
  images?: string[],
  video?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.from("reviews").insert({
      product_id: productId,
      user_id: userId,
      rating,
      comment: comment || null,
      images: images || null,
      video: video || null,
    });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Error creating review:", error);
    return { success: false, error: error.message || "Failed to submit review" };
  }
};

export const updateReview = async (
  reviewId: string,
  userId: string,
  rating: number,
  comment?: string,
  images?: string[],
  video?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from("reviews")
      .update({
        rating,
        comment: comment || null,
        images: images || null,
        video: video || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", reviewId)
      .eq("user_id", userId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Error updating review:", error);
    return { success: false, error: error.message || "Failed to update review" };
  }
};

export const deleteReview = async (
  reviewId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId)
      .eq("user_id", userId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting review:", error);
    return { success: false, error: error.message || "Failed to delete review" };
  }
};

export const fetchProductsWithRatings = async (
  productIds: string[]
): Promise<Record<string, ReviewStats>> => {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("product_id, rating")
      .in("product_id", productIds);

    if (error) throw error;
    if (!data || data.length === 0) return {};

    const map: Record<string, number[]> = {};
    data.forEach((r) => {
      if (!map[r.product_id]) map[r.product_id] = [];
      map[r.product_id].push(r.rating);
    });

    const result: Record<string, ReviewStats> = {};
    Object.entries(map).forEach(([pid, ratings]) => {
      const sum = ratings.reduce((a, b) => a + b, 0);
      const breakdown: { [star: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      ratings.forEach((r) => {
        breakdown[r] = (breakdown[r] || 0) + 1;
      });
      result[pid] = {
        average: Math.round((sum / ratings.length) * 10) / 10,
        total: ratings.length,
        breakdown,
      };
    });

    return result;
  } catch (error) {
    console.error("Error fetching product ratings:", error);
    return {};
  }
};
