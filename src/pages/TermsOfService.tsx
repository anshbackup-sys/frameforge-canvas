import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

const TermsOfService = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      <section className="py-16 bg-gradient-to-br from-cosmic-black via-background to-cosmic-gray">
        <div className="container-wide text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: January 2025</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-wide max-w-4xl">
          <div className="space-y-8">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground">
                  By accessing and using Kaiga's website and services, you accept and agree 
                  to be bound by the terms and provisions of this agreement. If you do not 
                  agree to these terms, please do not use our services.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">2. Products and Services</h2>
                <p className="text-muted-foreground mb-4">
                  Kaiga provides custom and standard picture frames and related accessories. 
                  Product descriptions and images are as accurate as possible, but we cannot 
                  guarantee that colors displayed on your screen will be exact.
                </p>
                <p className="text-muted-foreground">
                  Prices are subject to change without notice. We reserve the right to 
                  discontinue any product at any time.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">3. Orders and Payment</h2>
                <p className="text-muted-foreground mb-4">
                  By placing an order, you represent that you are legally capable of entering 
                  into binding contracts. All orders are subject to acceptance and availability.
                </p>
                <p className="text-muted-foreground">
                  Payment must be made at the time of order. We accept major credit cards, 
                  UPI, and cash on delivery (for eligible orders).
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">4. Intellectual Property</h2>
                <p className="text-muted-foreground">
                  All content on this website, including text, images, logos, and designs, 
                  is the property of Kaiga and is protected by copyright and trademark laws. 
                  You may not use, reproduce, or distribute any content without our written permission.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">5. User Content</h2>
                <p className="text-muted-foreground">
                  When you upload images for custom frames, you represent that you own or have 
                  the right to use those images. You grant Kaiga a limited license to use, 
                  process, and store these images solely for the purpose of fulfilling your order.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">6. Limitation of Liability</h2>
                <p className="text-muted-foreground">
                  Kaiga shall not be liable for any indirect, incidental, special, or 
                  consequential damages arising out of or in connection with the use of 
                  our products or services. Our total liability shall not exceed the 
                  amount paid for the specific product or service at issue.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">7. Governing Law</h2>
                <p className="text-muted-foreground">
                  These terms shall be governed by and construed in accordance with the 
                  laws of India. Any disputes shall be subject to the exclusive jurisdiction 
                  of the courts in Mumbai, Maharashtra.
                </p>
              </CardContent>
            </Card>

            <div className="p-6 bg-muted/30 rounded-lg">
              <h3 className="font-bold mb-2">Questions About Terms?</h3>
              <p className="text-muted-foreground">
                Contact us at{" "}
                <a href="mailto:legal@kaiga.com" className="text-primary hover:underline">
                  legal@kaiga.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TermsOfService;