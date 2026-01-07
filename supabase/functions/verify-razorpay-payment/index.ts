import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  orderId: string;
}

async function verifySignature(body: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBytes = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  const expectedSignature = Array.from(new Uint8Array(signatureBytes))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return expectedSignature === signature;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!keySecret) throw new Error("Razorpay secret not configured");

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId }: VerifyPaymentRequest = await req.json();
    console.log(`Verifying payment for order: ${orderId}`);

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const isValid = await verifySignature(body, razorpay_signature, keySecret);

    if (!isValid) throw new Error("Invalid payment signature");
    console.log("Payment signature verified successfully");

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    await supabase.from("orders").update({ payment_status: "paid", status: "processing" }).eq("id", orderId);
    await supabase.from("order_status_history").insert([{ order_id: orderId, status: "processing", notes: `Payment received. ID: ${razorpay_payment_id}` }]);

    return new Response(JSON.stringify({ success: true, paymentId: razorpay_payment_id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
