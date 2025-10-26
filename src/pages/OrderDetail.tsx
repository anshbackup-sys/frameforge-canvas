import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Truck, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface OrderDetails {
  id: string;
  order_number: string;
  status: string;
  total: number;
  payment_method: string;
  payment_status: string;
  tracking_number: string | null;
  shipping_address: any;
  created_at: string;
  updated_at: string;
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
  statusHistory: Array<{
    status: string;
    notes: string;
    created_at: string;
  }>;
}

const OrderDetail = () => {
  const { orderId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (user && orderId) {
      fetchOrderDetails();
    } else if (!user) {
      navigate("/login");
    }
  }, [user, orderId, navigate]);

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

      const { data: historyData } = await supabase
        .from("order_status_history")
        .select("*")
        .eq("order_id", orderId)
        .order("created_at", { ascending: true });

      setOrder({
        ...orderData,
        items: orderData.order_items || [],
        statusHistory: historyData || []
      });
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order || !user) return;

    setCancelling(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", order.id)
        .eq("user_id", user.id);

      if (error) throw error;

      await supabase
        .from("order_status_history")
        .insert([{
          order_id: order.id,
          status: "cancelled",
          notes: "Order cancelled by customer"
        }]);

      toast.success("Order cancelled successfully");
      fetchOrderDetails();
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Package className="w-5 h-5" />;
      case "processing":
        return <Package className="w-5 h-5 text-blue-500" />;
      case "shipped":
        return <Truck className="w-5 h-5 text-purple-500" />;
      case "delivered":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Skeleton className="h-96 w-full" />
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
          <Button onClick={() => navigate("/profile")}>View All Orders</Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Order Details</h1>
              <p className="text-muted-foreground">Order #{order.order_number}</p>
            </div>
            <Badge className={getStatusColor(order.status)}>
              {order.status.toUpperCase()}
            </Badge>
          </div>

          {/* Order Timeline */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.statusHistory.map((history, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="mt-1">{getStatusIcon(history.status)}</div>
                    <div className="flex-1">
                      <div className="font-semibold capitalize">{history.status}</div>
                      <div className="text-sm text-muted-foreground">{history.notes}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(history.created_at).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Shipping Address */}
            <Card>
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

            {/* Payment Info */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Method</span>
                    <span className="font-semibold capitalize">{order.payment_method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Status</span>
                    <span className="font-semibold capitalize">{order.payment_status}</span>
                  </div>
                  {order.tracking_number && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tracking Number</span>
                      <span className="font-semibold">{order.tracking_number}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Items */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 pb-4 border-b last:border-0">
                    <img
                      src={item.products.image_url}
                      alt={item.products.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <div className="font-semibold">{item.products.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Quantity: {item.quantity} × ₹{item.price.toFixed(2)}
                      </div>
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

          {/* Actions */}
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate("/profile")}
              className="flex-1"
            >
              Back to Orders
            </Button>
            {(order.status === "pending" || order.status === "processing") && (
              <Button
                variant="destructive"
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="flex-1"
              >
                {cancelling ? "Cancelling..." : "Cancel Order"}
              </Button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderDetail;
