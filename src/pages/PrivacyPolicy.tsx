import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Eye, Lock, UserCheck, AlertCircle } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      <section className="py-16 bg-gradient-to-br from-cosmic-black via-background to-cosmic-gray">
        <div className="container-wide text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: January 2025</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-wide max-w-4xl">
          <div className="prose prose-gray max-w-none">
            <Card className="mb-8">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  Information We Collect
                </h2>
                <p className="text-muted-foreground mb-4">
                  We collect information you provide directly to us, including:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Name, email address, and contact information</li>
                  <li>Shipping and billing addresses</li>
                  <li>Order history and preferences</li>
                  <li>Photos uploaded for custom frames</li>
                  <li>Communications with our support team</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  How We Use Your Information
                </h2>
                <p className="text-muted-foreground mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Process and fulfill your orders</li>
                  <li>Send order confirmations and shipping updates</li>
                  <li>Respond to your inquiries and provide customer support</li>
                  <li>Send marketing communications (with your consent)</li>
                  <li>Improve our products and services</li>
                  <li>Detect and prevent fraud</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-primary" />
                  Information Sharing
                </h2>
                <p className="text-muted-foreground mb-4">
                  We do not sell your personal information. We may share your information with:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Shipping carriers to deliver your orders</li>
                  <li>Payment processors to handle transactions securely</li>
                  <li>Service providers who help us operate our business</li>
                  <li>Legal authorities when required by law</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  Your Rights
                </h2>
                <p className="text-muted-foreground mb-4">
                  You have the right to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Access and receive a copy of your personal data</li>
                  <li>Request correction of inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Opt out of marketing communications</li>
                  <li>Lodge a complaint with a supervisory authority</li>
                </ul>
              </CardContent>
            </Card>

            <div className="p-6 bg-muted/30 rounded-lg">
              <h3 className="font-bold mb-2">Questions About Privacy?</h3>
              <p className="text-muted-foreground">
                Contact our Data Protection Officer at{" "}
                <a href="mailto:privacy@kaiga.com" className="text-primary hover:underline">
                  privacy@kaiga.com
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

export default PrivacyPolicy;