import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { RotateCcw, CheckCircle, XCircle, Clock } from "lucide-react";

const Returns = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      <section className="py-16 bg-gradient-to-br from-cosmic-black via-background to-cosmic-gray">
        <div className="container-wide text-center">
          <RotateCcw className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">Returns & Exchanges</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We want you to love your frames. If you don't, we'll make it right.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-wide">
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center border-green-200 bg-green-50/50">
              <CardContent className="p-6">
                <CheckCircle className="h-10 w-10 mx-auto mb-4 text-green-600" />
                <h3 className="font-bold mb-2">30-Day Returns</h3>
                <p className="text-sm text-muted-foreground">
                  Return any standard frame within 30 days of delivery
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <RotateCcw className="h-10 w-10 mx-auto mb-4 text-primary" />
                <h3 className="font-bold mb-2">Free Exchanges</h3>
                <p className="text-sm text-muted-foreground">
                  Exchange for a different size or style at no extra cost
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <Clock className="h-10 w-10 mx-auto mb-4 text-primary" />
                <h3 className="font-bold mb-2">Quick Processing</h3>
                <p className="text-sm text-muted-foreground">
                  Refunds processed within 5-7 business days
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">Return Policy</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We accept returns on standard (non-custom) frames within 30 days of delivery. 
                  Items must be unused, in original packaging, and in resalable condition.
                </p>
                <p>
                  To initiate a return, please contact our customer service team with your 
                  order number. We'll provide you with a prepaid return label.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">Non-Returnable Items</h2>
              <Card>
                <CardContent className="p-6">
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      Custom frames made to your specifications
                    </li>
                    <li className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      Frames with personalized engravings
                    </li>
                    <li className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      Items returned after 30 days
                    </li>
                    <li className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      Damaged items due to customer mishandling
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">Damaged or Defective Items</h2>
              <p className="text-muted-foreground">
                If your order arrives damaged or defective, please contact us within 48 hours 
                with photos of the damage. We'll arrange for a free replacement or full refund.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Returns;