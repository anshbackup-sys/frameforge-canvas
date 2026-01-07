import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RazorpayOrderRequest {
  amount: number; // in INR
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!keyId || !keySecret) {
      throw new Error("Razorpay credentials not configured");
    }

    const { amount, currency = "INR", receipt, notes }: RazorpayOrderRequest = await req.json();

    console.log(`Creating Razorpay order for amount: ${amount} ${currency}`);

    // Razorpay expects amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(amount * 100);

    // Create order via Razorpay API
    const auth = btoa(`${keyId}:${keySecret}`);
    
    const orderResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency,
        receipt: receipt || `receipt_${Date.now()}`,
        notes: notes || {},
      }),
    });

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      console.error("Razorpay API error:", errorText);
      throw new Error(`Razorpay API error: ${orderResponse.status}`);
    }

    const order = await orderResponse.json();
    console.log("Razorpay order created:", order.id);

    return new Response(
      JSON.stringify({
        success: true,
        order: {
          id: order.id,
          amount: order.amount,
          currency: order.currency,
          receipt: order.receipt,
        },
        keyId, // Send public key to frontend
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
