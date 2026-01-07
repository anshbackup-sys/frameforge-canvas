import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Sun, Droplets, Shield } from "lucide-react";

const CareInstructions = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      <section className="py-16 bg-gradient-to-br from-cosmic-black via-background to-cosmic-gray">
        <div className="container-wide text-center">
          <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">Care Instructions</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Keep your frames looking beautiful for years to come
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-wide">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Cleaning Your Frame
                </h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li>• Use a soft, dry microfiber cloth for regular dusting</li>
                  <li>• For glass cleaning, use a non-ammonia glass cleaner</li>
                  <li>• Spray cleaner on the cloth, not directly on the glass</li>
                  <li>• Avoid harsh chemicals on wooden frames</li>
                  <li>• Clean metal frames with a slightly damp cloth</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Sun className="h-5 w-5 text-primary" />
                  Protecting from Light
                </h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li>• Avoid placing frames in direct sunlight</li>
                  <li>• UV rays can fade photos and artwork over time</li>
                  <li>• Consider UV-protective glass for valuable pieces</li>
                  <li>• Rotate displayed items periodically</li>
                  <li>• Use window treatments to reduce sun exposure</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-primary" />
                  Humidity Control
                </h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li>• Keep frames away from bathrooms and kitchens</li>
                  <li>• Avoid extreme temperature changes</li>
                  <li>• Maintain 40-60% relative humidity</li>
                  <li>• Wooden frames may warp in high humidity</li>
                  <li>• Use dehumidifiers in damp environments</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Handling & Storage
                </h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li>• Always handle frames with clean, dry hands</li>
                  <li>• Support the frame from the bottom when carrying</li>
                  <li>• Store flat or upright, never stacked</li>
                  <li>• Use acid-free materials for long-term storage</li>
                  <li>• Wrap in soft cloth before storing</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Material-Specific Care</h2>
            <div className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-2">Wooden Frames</h4>
                  <p className="text-muted-foreground">
                    Apply furniture polish occasionally to maintain luster. Avoid water 
                    exposure and keep away from heat sources like radiators.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-2">Metal Frames</h4>
                  <p className="text-muted-foreground">
                    Wipe with a dry cloth regularly. For tarnished spots, use appropriate 
                    metal polish. Avoid abrasive materials that may scratch the surface.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-2">Acrylic Glazing</h4>
                  <p className="text-muted-foreground">
                    Never use ammonia-based cleaners. Use plastic-safe cleaning solutions 
                    and soft cloths to prevent scratching.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CareInstructions;