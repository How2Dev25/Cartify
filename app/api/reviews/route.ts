import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("product_id");

    if (!productId) {
      return NextResponse.json(
        { error: "product_id is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const userIds = [...new Set((data || []).map((r) => r.user_id))];
    const { data: users } = await supabase
      .from("users")
      .select("id, first_name, last_name, avatar_url")
      .in("id", userIds);

    const userMap = Object.fromEntries(
      (users || []).map((u) => [u.id, { first_name: u.first_name, last_name: u.last_name, avatar_url: u.avatar_url }])
    );

    const reviews = (data || []).map((r) => ({
      ...r,
      user: userMap[r.user_id] || null,
    }));

    const total = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const average = total > 0 ? Math.round((sum / total) * 10) / 10 : 0;
    const breakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      breakdown[r.rating] = (breakdown[r.rating] || 0) + 1;
    });

    return NextResponse.json({ reviews, stats: { average, total, breakdown } });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "You must be logged in to submit a review" },
        { status: 401 }
      );
    }

    const { product_id, rating, comment, images, video } = await request.json();

    if (!product_id) {
      return NextResponse.json(
        { error: "product_id is required" },
        { status: 400 }
      );
    }

    const { error: insertError } = await supabase.from("reviews").insert({
      product_id,
      user_id: user.id,
      rating,
      comment: comment || null,
      images: images || null,
      video: video || null,
    });

    if (insertError) throw insertError;

    return NextResponse.json({ success: true, message: "Review submitted successfully" });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "You must be logged in to update a review" },
        { status: 401 }
      );
    }

    const { review_id, rating, comment, images, video } = await request.json();

    if (!review_id) {
      return NextResponse.json(
        { error: "review_id is required" },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabase
      .from("reviews")
      .update({
        rating,
        comment: comment || null,
        images: images || null,
        video: video || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", review_id)
      .eq("user_id", user.id);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, message: "Review updated successfully" });
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "You must be logged in to delete a review" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get("review_id");

    if (!reviewId) {
      return NextResponse.json(
        { error: "review_id is required" },
        { status: 400 }
      );
    }

    const { error: deleteError } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId)
      .eq("user_id", user.id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    );
  }
}
