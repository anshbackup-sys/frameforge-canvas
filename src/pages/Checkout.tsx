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
import { Loader2, Plus } from "lucide-react";
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

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);
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
  }, [user, items, navigate]);

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

  const handlePlaceOrder = async () => {
    if (!user || !selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    setLoading(true);

    try {
      const address = addresses.find(a => a.id === selectedAddress);
      if (!address) throw new Error("Address not found");

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([{
          user_id: user.id,
          total: subtotal + shipping + tax,
          status: "pending",
          payment_method: paymentMethod,
          payment_status: paymentMethod === "cod" ? "pending" : "paid",
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
        price: item.product?.price || 0,
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

      // Clear cart
      await clearCart();

      toast.success("Order placed successfully!");
      navigate(`/order-confirmation/${order.id}`);
    } catch (error: any) {
      console.error("Order creation error:", error);
      toast.error(error.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  const subtotal = items.reduce((sum, item) => 
    sum + (item.product?.price || 0) * item.quantity, 0
  );
  const shipping = subtotal > 1000 ? 0 : 100;
  const tax = subtotal * 0.18; // 18% GST

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
                      <div key={address.id} className="flex items-start space-x-3 p-4 border rounded-lg mb-3">
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
                            <div className="font-medium">{item.product?.name}</div>
                            <div className="text-sm text-muted-foreground">Qty: {item.quantity}</div>
                          </div>
                          <div className="font-semibold">
                            ₹{((item.product?.price || 0) * item.quantity).toFixed(2)}
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
                    <div className="flex items-center space-x-3 p-4 border rounded-lg mb-3">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="flex-1 cursor-pointer">
                        <div className="font-semibold">Cash on Delivery</div>
                        <div className="text-sm text-muted-foreground">Pay when you receive</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border rounded-lg mb-3">
                      <RadioGroupItem value="upi" id="upi" />
                      <Label htmlFor="upi" className="flex-1 cursor-pointer">
                        <div className="font-semibold">UPI</div>
                        <div className="text-sm text-muted-foreground">Pay using UPI apps</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border rounded-lg">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex-1 cursor-pointer">
                        <div className="font-semibold">Credit/Debit Card</div>
                        <div className="text-sm text-muted-foreground">Pay securely with card</div>
                      </Label>
                    </div>
                  </RadioGroup>

                  <div className="flex gap-4 mt-6">
                    <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                      Back
                    </Button>
                    <Button 
                      onClick={handlePlaceOrder} 
                      className="flex-1"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Placing Order...
                        </>
                      ) : (
                        "Place Order"
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
                      <span>₹{(subtotal + shipping + tax).toFixed(2)}</span>
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
