// app/api/create-refund/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  
export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId, amount } = await request.json();

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "Payment Intent ID required" },
        { status: 400 }
      );
    }

    // Create refund
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount, // amount in cents
    });

    return NextResponse.json({
      success: true,
      refundId: refund.id,
      status: refund.status,
    });
  } catch (error: any) {
    console.error("Refund error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process refund" },
      { status: 500 }
    );
  }
}