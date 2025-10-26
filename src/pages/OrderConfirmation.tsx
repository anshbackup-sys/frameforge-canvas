import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface OrderDetails {
  id: string;
  order_number: string;
  status: string;
  total: number;
  payment_method: string;
  payment_status: string;
  shipping_address: any;
  created_at: string;
  items: Array<{
    id: string;
    product_id: string;
    quantity: number;
    price: number;
    products: {
      name: string;
      image_url: string;
    };
  }>;
}

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && orderId) {
      fetchOrderDetails();
    }
  }, [user, orderId]);

  const fetchOrderDetails = async () => {
    if (!orderId || !user) return;

    try {
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            id,
            product_id,
            quantity,
            price,
            products (
              name,
              image_url
            )
          )
        `)
        .eq("id", orderId)
        .eq("user_id", user.id)
        .single();

      if (orderError) throw orderError;

      setOrder({
        ...orderData,
        items: orderData.order_items || []
      });
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  const estimatedDelivery = order 
    ? new Date(new Date(order.created_at).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : "";

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Skeleton className="h-64 w-full" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <Link to="/shop">
            <Button>Continue Shopping</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-muted-foreground">
              Thank you for your order. We've received it and will process it shortly.
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-muted-foreground">Order Number</div>
                  <div className="font-semibold">{order.order_number}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Order Date</div>
                  <div className="font-semibold">
                    {new Date(order.created_at).toLocaleDateString('en-IN')}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Payment Method</div>
                  <div className="font-semibold capitalize">{order.payment_method}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Payment Status</div>
                  <div className="font-semibold capitalize">{order.payment_status}</div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="text-sm text-muted-foreground mb-2">Estimated Delivery</div>
                <div className="flex items-center text-primary font-semibold">
                  <Package className="w-4 h-4 mr-2" />
                  {estimatedDelivery}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <div className="font-semibold">{order.shipping_address.label}</div>
                <div>{order.shipping_address.street}</div>
                <div>
                  {order.shipping_address.city}, {order.shipping_address.state}{" "}
                  {order.shipping_address.postal_code}
                </div>
                <div>{order.shipping_address.country}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <img
                      src={item.products.image_url}
                      alt={item.products.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <div className="font-semibold">{item.products.name}</div>
                      <div className="text-sm text-muted-foreground">Qty: {item.quantity}</div>
                    </div>
                    <div className="font-semibold">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t mt-4 pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{order.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Link to="/profile" className="flex-1">
              <Button variant="outline" className="w-full">
                View All Orders
              </Button>
            </Link>
            <Link to="/shop" className="flex-1">
              <Button className="w-full">Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderConfirmation;
