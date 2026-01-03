import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { 
  Package, Truck, CheckCircle, XCircle, Clock, ArrowLeft,
  MapPin, CreditCard, Copy, ExternalLink, PackageCheck, Calendar,
  Phone, Mail
} from "lucide-react";
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

  const copyTrackingNumber = () => {
    if (order?.tracking_number) {
      navigator.clipboard.writeText(order.tracking_number);
      toast.success("Tracking number copied!");
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; bgColor: string; icon: React.ReactNode; label: string }> = {
      pending: { color: "text-amber-700", bgColor: "bg-amber-50 border-amber-200", icon: <Clock className="w-5 h-5" />, label: "Order Placed" },
      processing: { color: "text-blue-700", bgColor: "bg-blue-50 border-blue-200", icon: <Package className="w-5 h-5" />, label: "Processing" },
      shipped: { color: "text-purple-700", bgColor: "bg-purple-50 border-purple-200", icon: <Truck className="w-5 h-5" />, label: "Shipped" },
      out_for_delivery: { color: "text-indigo-700", bgColor: "bg-indigo-50 border-indigo-200", icon: <Truck className="w-5 h-5" />, label: "Out for Delivery" },
      delivered: { color: "text-green-700", bgColor: "bg-green-50 border-green-200", icon: <PackageCheck className="w-5 h-5" />, label: "Delivered" },
      cancelled: { color: "text-red-700", bgColor: "bg-red-50 border-red-200", icon: <XCircle className="w-5 h-5" />, label: "Cancelled" },
    };
    return configs[status] || configs.pending;
  };

  const orderSteps = [
    { key: 'pending', label: 'Order Placed', icon: Clock },
    { key: 'processing', label: 'Processing', icon: Package },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle },
  ];

  const getCurrentStepIndex = (status: string) => {
    if (status === 'cancelled') return -1;
    return orderSteps.findIndex(step => step.key === status);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 text-center">
          <div className="max-w-md mx-auto py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <Package className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-3">Order Not Found</h1>
            <p className="text-muted-foreground mb-6">We couldn't find this order in your account.</p>
            <Button onClick={() => navigate("/profile")}>View All Orders</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.status);
  const currentStep = getCurrentStepIndex(order.status);
  const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          <Link to="/profile" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>

          {/* Order Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground">Order #{order.order_number}</h1>
              <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}</span>
              </div>
            </div>
            <Badge className={`${statusConfig.bgColor} ${statusConfig.color} border gap-2 px-4 py-2 text-sm`}>
              {statusConfig.icon}
              {statusConfig.label}
            </Badge>
          </div>

          {/* Order Progress */}
          {order.status !== 'cancelled' && (
            <Card className="mb-6 border-border overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border">
                <CardTitle className="text-lg">Order Progress</CardTitle>
              </CardHeader>
              <CardContent className="pt-8 pb-6">
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted">
                    <div 
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${((currentStep + 1) / orderSteps.length) * 100}%` }}
                    />
                  </div>
                  
                  {/* Steps */}
                  <div className="relative flex justify-between">
                    {orderSteps.map((step, index) => {
                      const StepIcon = step.icon;
                      const isCompleted = index <= currentStep;
                      const isCurrent = index === currentStep;
                      
                      return (
                        <div key={step.key} className="flex flex-col items-center">
                          <div 
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                              isCompleted 
                                ? 'bg-primary text-primary-foreground shadow-md' 
                                : 'bg-muted text-muted-foreground'
                            } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}
                          >
                            <StepIcon className="w-5 h-5" />
                          </div>
                          <span className={`mt-3 text-xs font-medium text-center max-w-[80px] ${
                            isCompleted ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tracking Info */}
          {order.tracking_number && (
            <Card className="mb-6 border-primary/20 bg-primary/5">
              <CardContent className="py-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Truck className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tracking Number</p>
                      <p className="font-mono font-semibold text-foreground">{order.tracking_number}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyTrackingNumber}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button size="sm" asChild>
                      <a href={`https://www.google.com/search?q=${order.tracking_number}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Track Package
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Order Items */}
            <div className="lg:col-span-2">
              <Card className="border-border">
                <CardHeader className="border-b border-border">
                  <CardTitle className="text-lg">Order Items ({order.items.length})</CardTitle>
                </CardHeader>
                <CardContent className="divide-y divide-border">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4 py-4 first:pt-6 last:pb-6">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {item.products.image_url ? (
                          <img
                            src={item.products.image_url}
                            alt={item.products.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground truncate">{item.products.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Order Timeline */}
              {order.statusHistory.length > 0 && (
                <Card className="mt-6 border-border">
                  <CardHeader className="border-b border-border">
                    <CardTitle className="text-lg">Order Timeline</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      {order.statusHistory.map((history, index) => {
                        const config = getStatusConfig(history.status);
                        return (
                          <div key={index} className="flex gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${config.bgColor} ${config.color}`}>
                              {config.icon}
                            </div>
                            <div className="flex-1 pb-6 border-l-2 border-muted -ml-5 pl-8 last:border-0">
                              <p className="font-semibold text-foreground">{config.label}</p>
                              {history.notes && (
                                <p className="text-sm text-muted-foreground mt-1">{history.notes}</p>
                              )}
                              <p className="text-xs text-muted-foreground mt-2">
                                {new Date(history.created_at).toLocaleString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="space-y-6">
              {/* Shipping Address */}
              <Card className="border-border">
                <CardHeader className="border-b border-border pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="text-sm space-y-1">
                    <p className="font-semibold text-foreground">{order.shipping_address?.label || 'Delivery Address'}</p>
                    <p className="text-muted-foreground">{order.shipping_address?.street}</p>
                    <p className="text-muted-foreground">
                      {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.postal_code}
                    </p>
                    <p className="text-muted-foreground">{order.shipping_address?.country}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Info */}
              <Card className="border-border">
                <CardHeader className="border-b border-border pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Payment
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Method</span>
                    <span className="font-medium capitalize">{order.payment_method || 'COD'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'} className="capitalize">
                      {order.payment_status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card className="border-border">
                <CardHeader className="border-b border-border pb-4">
                  <CardTitle className="text-base">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{order.total.toLocaleString('en-IN')}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="space-y-3">
                {(order.status === "pending" || order.status === "processing") && (
                  <Button
                    variant="destructive"
                    onClick={handleCancelOrder}
                    disabled={cancelling}
                    className="w-full"
                  >
                    {cancelling ? "Cancelling..." : "Cancel Order"}
                  </Button>
                )}
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/shop">Continue Shopping</Link>
                </Button>
              </div>

              {/* Need Help */}
              <Card className="border-border bg-muted/30">
                <CardContent className="pt-4 pb-4">
                  <h4 className="font-semibold text-sm mb-3">Need Help?</h4>
                  <div className="space-y-2 text-sm">
                    <a href="mailto:support@kaiga.com" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                      <Mail className="w-4 h-4" />
                      support@kaiga.com
                    </a>
                    <a href="tel:+911234567890" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                      <Phone className="w-4 h-4" />
                      +91 123 456 7890
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderDetail;