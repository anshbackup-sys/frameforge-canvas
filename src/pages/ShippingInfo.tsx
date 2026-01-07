import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Truck, Clock, MapPin, Package } from "lucide-react";

const ShippingInfo = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      <section className="py-16 bg-gradient-to-br from-cosmic-black via-background to-cosmic-gray">
        <div className="container-wide text-center">
          <Truck className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">Shipping Information</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about how we deliver your frames
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-wide">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="text-center">
              <CardContent className="p-6">
                <Truck className="h-10 w-10 mx-auto mb-4 text-primary" />
                <h3 className="font-bold mb-2">Free Shipping</h3>
                <p className="text-sm text-muted-foreground">On orders above ₹3,000</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <Clock className="h-10 w-10 mx-auto mb-4 text-primary" />
                <h3 className="font-bold mb-2">3-5 Business Days</h3>
                <p className="text-sm text-muted-foreground">Standard delivery time</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <MapPin className="h-10 w-10 mx-auto mb-4 text-primary" />
                <h3 className="font-bold mb-2">Pan India</h3>
                <p className="text-sm text-muted-foreground">We deliver nationwide</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <Package className="h-10 w-10 mx-auto mb-4 text-primary" />
                <h3 className="font-bold mb-2">Secure Packaging</h3>
                <p className="text-sm text-muted-foreground">Premium protection</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">Delivery Rates</h2>
              <Card>
                <CardContent className="p-6">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3">Order Value</th>
                        <th className="text-left py-3">Shipping Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3">Below ₹1,000</td>
                        <td className="py-3">₹149</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3">₹1,000 - ₹2,999</td>
                        <td className="py-3">₹99</td>
                      </tr>
                      <tr>
                        <td className="py-3">₹3,000 and above</td>
                        <td className="py-3 text-green-600 font-medium">FREE</td>
                      </tr>
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">Processing Time</h2>
              <p className="text-muted-foreground mb-4">
                Orders are processed within 1-2 business days. Custom frame orders may take 
                3-5 additional business days for crafting before shipping.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">Tracking Your Order</h2>
              <p className="text-muted-foreground">
                Once your order ships, you'll receive an email with tracking information. 
                You can also track your order in your account dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ShippingInfo;