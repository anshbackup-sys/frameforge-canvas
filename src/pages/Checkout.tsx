import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Plus, CreditCard, Wallet, Banknote } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: "",
    street: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (items.length === 0) {
      navigate("/cart");
      return;
    }
    fetchAddresses();
    loadRazorpayScript();
  }, [user, items, navigate]);

  const loadRazorpayScript = () => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);
  };

  const fetchAddresses = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false });

    if (error) {
      toast.error("Failed to load addresses");
      return;
    }

    setAddresses(data || []);
    if (data && data.length > 0) {
      const defaultAddr = data.find(a => a.is_default);
      setSelectedAddress(defaultAddr?.id || data[0].id);
    }
  };

  const handleAddAddress = async () => {
    if (!user) return;
    if (!newAddress.label || !newAddress.street || !newAddress.city || 
        !newAddress.state || !newAddress.postal_code) {
      toast.error("Please fill all address fields");
      return;
    }

    const { data, error } = await supabase
      .from("addresses")
      .insert([{ ...newAddress, user_id: user.id }])
      .select()
      .single();

    if (error) {
      toast.error("Failed to add address");
      return;
    }

    toast.success("Address added successfully");
    setAddresses([...addresses, data]);
    setSelectedAddress(data.id);
    setShowAddAddress(false);
    setNewAddress({
      label: "",
      street: "",
      city: "",
      state: "",
      postal_code: "",
      country: "India",
    });
  };

  const getItemPrice = (item: any) => {
    if (item.custom_frame_order) {
      return item.custom_frame_order.total_price;
    }
    return item.product?.price || 0;
  };

  const subtotal = items.reduce((sum, item) => 
    sum + getItemPrice(item) * item.quantity, 0
  );
  const shipping = subtotal > 1000 ? 0 : 100;
  const tax = subtotal * 0.18;
  const total = subtotal + shipping + tax;

  const createOrder = async (paymentStatus: string = 'pending') => {
    const address = addresses.find(a => a.id === selectedAddress);
    if (!address) throw new Error("Address not found");

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([{
        user_id: user!.id,
        total: total,
        status: "pending",
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        shipping_address: {
          label: address.label,
          street: address.street,
          city: address.city,
          state: address.state,
          postal_code: address.postal_code,
          country: address.country,
        }
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: getItemPrice(item),
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Create order status history
    await supabase
      .from("order_status_history")
      .insert([{
        order_id: order.id,
        status: "pending",
        notes: "Order placed successfully"
      }]);

    return order;
  };

  const sendOrderConfirmationEmail = async (orderId: string) => {
    try {
      const address = addresses.find(a => a.id === selectedAddress);
      await supabase.functions.invoke('send-order-email', {
        body: {
          orderId,
          email: user?.email,
          customerName: user?.user_metadata?.full_name || 'Customer',
          orderTotal: total,
          shippingAddress: address,
          emailType: 'confirmation'
        }
      });
    } catch (error) {
      console.error('Error sending confirmation email:', error);
    }
  };

  const handleRazorpayPayment = async () => {
    if (!razorpayLoaded) {
      toast.error("Payment gateway is loading. Please wait.");
      return;
    }

    setLoading(true);

    try {
      // Create Razorpay order
      const { data: razorpayOrder, error: razorpayError } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          amount: Math.round(total * 100), // Amount in paise
          currency: 'INR',
          receipt: `order_${Date.now()}`
        }
      });

      if (razorpayError || !razorpayOrder?.id) {
        throw new Error('Failed to create payment order');
      }

      // Create order in database with pending payment
      const order = await createOrder('pending');

      // Open Razorpay checkout
      const options = {
        key: razorpayOrder.key_id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Kaiga',
        description: 'Order Payment',
        order_id: razorpayOrder.id,
        handler: async (response: any) => {
          try {
            // Verify payment
            const { data: verifyResult, error: verifyError } = await supabase.functions.invoke('verify-razorpay-payment', {
              body: {
                orderId: order.id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              }
            });

            if (verifyError || !verifyResult?.success) {
              throw new Error('Payment verification failed');
            }

            // Clear cart and navigate
            await clearCart();
            await sendOrderConfirmationEmail(order.id);
            toast.success("Payment successful! Order placed.");
            navigate(`/order-confirmation/${order.id}`);
          } catch (error: any) {
            console.error('Payment verification error:', error);
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          email: user?.email,
          name: user?.user_metadata?.full_name || ''
        },
        theme: {
          color: '#1a1a1a'
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.error("Payment cancelled");
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || "Failed to initiate payment");
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!user || !selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    if (paymentMethod !== 'cod') {
      await handleRazorpayPayment();
      return;
    }

    setLoading(true);

    try {
      const order = await createOrder('pending');
      await clearCart();
      await sendOrderConfirmationEmail(order.id);
      toast.success("Order placed successfully!");
      navigate(`/order-confirmation/${order.id}`);
    } catch (error: any) {
      console.error("Order creation error:", error);
      toast.error(error.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  const getItemName = (item: any) => {
    if (item.custom_frame_order) {
      const config = item.custom_frame_order.frame_config;
      return `Custom Frame - ${config?.size || 'Custom Size'}`;
    }
    return item.product?.name || 'Unknown Product';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>1</div>
              <span className="ml-2">Shipping</span>
            </div>
            <div className="w-16 h-px bg-border" />
            <div className={`flex items-center ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>2</div>
              <span className="ml-2">Review</span>
            </div>
            <div className="w-16 h-px bg-border" />
            <div className={`flex items-center ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>3</div>
              <span className="ml-2">Payment</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Step 1: Shipping Address */}
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
                    {addresses.map((address) => (
                      <div key={address.id} className="flex items-start space-x-3 p-4 border rounded-lg mb-3 hover:border-primary transition-colors">
                        <RadioGroupItem value={address.id} id={address.id} />
                        <Label htmlFor={address.id} className="flex-1 cursor-pointer">
                          <div className="font-semibold">{address.label}</div>
                          <div className="text-sm text-muted-foreground">
                            {address.street}, {address.city}, {address.state} {address.postal_code}
                          </div>
                          {address.is_default && (
                            <span className="text-xs text-primary">Default</span>
                          )}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>

                  <Dialog open={showAddAddress} onOpenChange={setShowAddAddress}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full mt-4">
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Address
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Address</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Label (e.g., Home, Office)</Label>
                          <Input
                            value={newAddress.label}
                            onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Street Address</Label>
                          <Input
                            value={newAddress.street}
                            onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>City</Label>
                            <Input
                              value={newAddress.city}
                              onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>State</Label>
                            <Input
                              value={newAddress.state}
                              onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Postal Code</Label>
                            <Input
                              value={newAddress.postal_code}
                              onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>Country</Label>
                            <Input
                              value={newAddress.country}
                              onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                            />
                          </div>
                        </div>
                        <Button onClick={handleAddAddress} className="w-full">
                          Save Address
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button 
                    onClick={() => setStep(2)} 
                    className="w-full mt-6"
                    disabled={!selectedAddress}
                  >
                    Continue to Review
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Review Order */}
            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Review Your Order</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Shipping Address</h3>
                      {addresses.find(a => a.id === selectedAddress) && (
                        <div className="text-sm text-muted-foreground p-3 bg-muted rounded">
                          <div className="font-medium">{addresses.find(a => a.id === selectedAddress)?.label}</div>
                          <div>{addresses.find(a => a.id === selectedAddress)?.street}</div>
                          <div>
                            {addresses.find(a => a.id === selectedAddress)?.city}, {addresses.find(a => a.id === selectedAddress)?.state} {addresses.find(a => a.id === selectedAddress)?.postal_code}
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Order Items ({items.length})</h3>
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center py-2 border-b">
                          <div className="flex-1">
                            <div className="font-medium">{getItemName(item)}</div>
                            <div className="text-sm text-muted-foreground">Qty: {item.quantity}</div>
                          </div>
                          <div className="font-semibold">
                            ₹{(getItemPrice(item) * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 mt-6">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                      Back
                    </Button>
                    <Button onClick={() => setStep(3)} className="flex-1">
                      Continue to Payment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className={`flex items-center space-x-3 p-4 border rounded-lg mb-3 cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}>
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="flex-1 cursor-pointer flex items-center gap-3">
                        <Banknote className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-semibold">Cash on Delivery</div>
                          <div className="text-sm text-muted-foreground">Pay when you receive</div>
                        </div>
                      </Label>
                    </div>
                    <div className={`flex items-center space-x-3 p-4 border rounded-lg mb-3 cursor-pointer transition-colors ${paymentMethod === 'upi' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}>
                      <RadioGroupItem value="upi" id="upi" />
                      <Label htmlFor="upi" className="flex-1 cursor-pointer flex items-center gap-3">
                        <Wallet className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-semibold">UPI / Wallet</div>
                          <div className="text-sm text-muted-foreground">Pay using UPI, Paytm, PhonePe, etc.</div>
                        </div>
                      </Label>
                    </div>
                    <div className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}>
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex-1 cursor-pointer flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-semibold">Credit/Debit Card</div>
                          <div className="text-sm text-muted-foreground">Pay securely with card</div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>

                  <div className="flex gap-4 mt-6">
                    <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                      Back
                    </Button>
                    <Button 
                      onClick={handlePlaceOrder} 
                      className="flex-1 btn-hero"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : paymentMethod === 'cod' ? (
                        "Place Order"
                      ) : (
                        "Pay Now"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (GST 18%)</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;