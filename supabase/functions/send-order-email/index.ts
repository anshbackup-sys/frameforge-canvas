import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderEmailRequest {
  orderId: string;
  emailType: "confirmation" | "shipped" | "delivered" | "cancelled";
  trackingNumber?: string;
  carrierName?: string;
}

const getEmailContent = (
  emailType: string,
  orderNumber: string,
  customerName: string,
  orderTotal: number,
  trackingNumber?: string,
  carrierName?: string
) => {
  const baseStyles = `
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
    .header { background: #1a1a1a; color: white; padding: 24px; text-align: center; }
    .content { padding: 32px 24px; }
    .footer { background: #f5f5f5; padding: 16px 24px; text-align: center; font-size: 12px; color: #666; }
    .order-number { font-size: 14px; color: #888; margin-bottom: 8px; }
    .title { font-size: 24px; font-weight: bold; margin-bottom: 16px; }
    .message { color: #555; line-height: 1.6; margin-bottom: 24px; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .total { font-size: 20px; font-weight: bold; color: #1a1a1a; }
    .btn { display: inline-block; background: #1a1a1a; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px; }
    .tracking { background: #f0f7ff; border: 1px solid #cce5ff; border-radius: 6px; padding: 16px; margin: 16px 0; }
  `;

  const templates: Record<string, { subject: string; html: string }> = {
    confirmation: {
      subject: `Order Confirmed - ${orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><style>${baseStyles}</style></head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin:0;">Kaiga</h1>
            </div>
            <div class="content">
              <p class="order-number">Order ${orderNumber}</p>
              <h2 class="title">Thank you for your order, ${customerName}!</h2>
              <p class="message">We've received your order and are getting it ready. We'll notify you when it ships.</p>
              <div class="detail-row">
                <span>Order Total</span>
                <span class="total">₹${orderTotal.toLocaleString()}</span>
              </div>
              <a href="https://kaiga.lovable.app/orders" class="btn">View Order</a>
            </div>
            <div class="footer">
              <p>Questions? Contact us at support@kaiga.com</p>
            </div>
          </div>
        </body>
        </html>
      `
    },
    shipped: {
      subject: `Your Order is On Its Way - ${orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><style>${baseStyles}</style></head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin:0;">Kaiga</h1>
            </div>
            <div class="content">
              <p class="order-number">Order ${orderNumber}</p>
              <h2 class="title">Good news, ${customerName}! Your order is on its way!</h2>
              <p class="message">Your order has been shipped and is on its way to you.</p>
              ${trackingNumber ? `
                <div class="tracking">
                  <strong>Tracking Information</strong><br>
                  <span>Carrier: ${carrierName || 'Standard Shipping'}</span><br>
                  <span>Tracking Number: ${trackingNumber}</span>
                </div>
              ` : ''}
              <a href="https://kaiga.lovable.app/orders" class="btn">Track Your Order</a>
            </div>
            <div class="footer">
              <p>Questions? Contact us at support@kaiga.com</p>
            </div>
          </div>
        </body>
        </html>
      `
    },
    delivered: {
      subject: `Your Order Has Been Delivered - ${orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><style>${baseStyles}</style></head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin:0;">Kaiga</h1>
            </div>
            <div class="content">
              <p class="order-number">Order ${orderNumber}</p>
              <h2 class="title">Your order has been delivered!</h2>
              <p class="message">Hi ${customerName}, your order has been successfully delivered. We hope you love your new frame!</p>
              <p class="message">If you have any issues with your order, please don't hesitate to reach out.</p>
              <a href="https://kaiga.lovable.app/orders" class="btn">Leave a Review</a>
            </div>
            <div class="footer">
              <p>Questions? Contact us at support@kaiga.com</p>
            </div>
          </div>
        </body>
        </html>
      `
    },
    cancelled: {
      subject: `Order Cancelled - ${orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><style>${baseStyles}</style></head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin:0;">Kaiga</h1>
            </div>
            <div class="content">
              <p class="order-number">Order ${orderNumber}</p>
              <h2 class="title">Your order has been cancelled</h2>
              <p class="message">Hi ${customerName}, your order has been cancelled as requested. If you paid online, your refund will be processed within 5-7 business days.</p>
              <p class="message">If you didn't request this cancellation, please contact us immediately.</p>
              <a href="https://kaiga.lovable.app/shop" class="btn">Continue Shopping</a>
            </div>
            <div class="footer">
              <p>Questions? Contact us at support@kaiga.com</p>
            </div>
          </div>
        </body>
        </html>
      `
    }
  };

  return templates[emailType] || templates.confirmation;
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, emailType, trackingNumber, carrierName }: OrderEmailRequest = await req.json();

    console.log(`Sending ${emailType} email for order ${orderId}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, profiles!orders_user_id_fkey(full_name)")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("Order fetch error:", orderError);
      throw new Error("Order not found");
    }

    // Get user email from auth
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(order.user_id);
    
    if (userError || !userData.user?.email) {
      console.error("User fetch error:", userError);
      throw new Error("User email not found");
    }

    const customerEmail = userData.user.email;
    const customerName = order.profiles?.full_name || customerEmail.split("@")[0];
    const orderNumber = order.order_number || order.id.slice(0, 8).toUpperCase();
    const orderTotal = order.total || 0;

    const emailContent = getEmailContent(
      emailType,
      orderNumber,
      customerName,
      orderTotal,
      trackingNumber,
      carrierName
    );

    // Send email
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "Kaiga <orders@resend.dev>",
      to: [customerEmail],
      subject: emailContent.subject,
      html: emailContent.html,
    });

    if (emailError) {
      console.error("Email send error:", emailError);
      throw emailError;
    }

    console.log("Email sent successfully:", emailData);

    return new Response(JSON.stringify({ success: true, emailId: emailData?.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-order-email function:", error);
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
