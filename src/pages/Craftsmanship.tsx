import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Hammer, Eye, Gem, Shield, CheckCircle } from "lucide-react";

const Craftsmanship = () => {
  const processes = [
    {
      step: 1,
      title: "Material Selection",
      description: "We source only the finest materials—premium hardwoods, museum-quality glass, and archival-grade mats from trusted suppliers worldwide.",
      icon: Gem,
    },
    {
      step: 2,
      title: "Precision Cutting",
      description: "Using state-of-the-art CNC machines combined with hand-finishing, we achieve tolerances within 0.5mm for perfect fits every time.",
      icon: Eye,
    },
    {
      step: 3,
      title: "Hand Assembly",
      description: "Each frame is assembled by skilled artisans who bring decades of experience to every joint, corner, and finish detail.",
      icon: Hammer,
    },
    {
      step: 4,
      title: "Quality Control",
      description: "Every frame undergoes a 15-point inspection before shipping, ensuring it meets our exacting cosmic standards.",
      icon: CheckCircle,
    },
  ];

  const materials = [
    { name: "Premium Hardwoods", description: "Oak, walnut, and mahogany sourced from sustainable forests" },
    { name: "Museum Glass", description: "UV-filtering, anti-reflective glass that protects and enhances" },
    { name: "Archival Mats", description: "Acid-free, lignin-free mats that preserve your artwork for generations" },
    { name: "Conservation Backing", description: "Archival-quality backing boards that prevent degradation" },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      <section className="py-16 bg-gradient-to-br from-cosmic-black via-background to-cosmic-gray">
        <div className="container-wide text-center">
          <Hammer className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">Our Craftsmanship</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Where traditional artistry meets cosmic precision
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">The Making of a Cosmic Frame</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every Kaiga frame is the result of meticulous attention to detail and 
              time-honored techniques refined over 15 years
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {processes.map((process) => {
              const Icon = process.icon;
              return (
                <Card key={process.step} className="relative overflow-hidden">
                  <CardContent className="p-6">
                    <div className="absolute top-2 right-2 text-6xl font-bold text-muted/20">
                      {process.step}
                    </div>
                    <Icon className="h-10 w-10 text-primary mb-4" />
                    <h3 className="font-bold text-lg mb-2">{process.title}</h3>
                    <p className="text-sm text-muted-foreground">{process.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-3xl font-bold mb-6">Premium Materials</h2>
              <p className="text-muted-foreground mb-6">
                The foundation of exceptional framing lies in exceptional materials. 
                We partner with suppliers who share our commitment to quality and 
                sustainability.
              </p>
              <div className="space-y-4">
                {materials.map((material) => (
                  <div key={material.name} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <div className="font-medium">{material.name}</div>
                      <p className="text-sm text-muted-foreground">{material.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img 
                src="/placeholder.svg" 
                alt="Craftsmanship detail"
                className="rounded-lg shadow-lg w-full h-80 object-cover"
              />
            </div>
          </div>

          <div className="bg-primary text-primary-foreground rounded-2xl p-8 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-4">Our Quality Promise</h3>
            <p className="max-w-2xl mx-auto opacity-90">
              Every frame comes with our Lifetime Craftsmanship Guarantee. If any 
              manufacturing defect appears, we'll repair or replace your frame free 
              of charge. That's our cosmic commitment to you.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Craftsmanship;