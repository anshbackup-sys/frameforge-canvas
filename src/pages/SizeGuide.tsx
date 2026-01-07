import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Ruler, Info, HelpCircle } from "lucide-react";

const SizeGuide = () => {
  const frameSizes = [
    { name: "4x6", inches: '4" x 6"', cm: "10 x 15 cm", ideal: "Standard photos, wallet prints" },
    { name: "5x7", inches: '5" x 7"', cm: "13 x 18 cm", ideal: "Portrait photos, small art prints" },
    { name: "8x10", inches: '8" x 10"', cm: "20 x 25 cm", ideal: "Family portraits, certificates" },
    { name: "11x14", inches: '11" x 14"', cm: "28 x 36 cm", ideal: "Medium art prints, diplomas" },
    { name: "16x20", inches: '16" x 20"', cm: "41 x 51 cm", ideal: "Large posters, statement pieces" },
    { name: "18x24", inches: '18" x 24"', cm: "46 x 61 cm", ideal: "Posters, gallery prints" },
    { name: "24x36", inches: '24" x 36"', cm: "61 x 91 cm", ideal: "Movie posters, large art" },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      <section className="py-16 bg-gradient-to-br from-cosmic-black via-background to-cosmic-gray">
        <div className="container-wide text-center">
          <Ruler className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">Size Guide</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find the perfect frame size for your photos and artwork
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-wide">
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Standard Frame Sizes</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-4 px-4 font-semibold">Size Name</th>
                    <th className="text-left py-4 px-4 font-semibold">Dimensions (inches)</th>
                    <th className="text-left py-4 px-4 font-semibold">Dimensions (cm)</th>
                    <th className="text-left py-4 px-4 font-semibold">Ideal For</th>
                  </tr>
                </thead>
                <tbody>
                  {frameSizes.map((size) => (
                    <tr key={size.name} className="border-b hover:bg-muted/50">
                      <td className="py-4 px-4 font-medium">{size.name}</td>
                      <td className="py-4 px-4">{size.inches}</td>
                      <td className="py-4 px-4">{size.cm}</td>
                      <td className="py-4 px-4 text-muted-foreground">{size.ideal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  How to Measure
                </h3>
                <ol className="space-y-3 text-muted-foreground">
                  <li>1. Measure the width of your artwork from edge to edge</li>
                  <li>2. Measure the height from top to bottom</li>
                  <li>3. Add 2-3 inches to each dimension for mat border</li>
                  <li>4. Choose the closest standard size or go custom</li>
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  Tips for Choosing
                </h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li>• Consider the wall space where you'll hang the frame</li>
                  <li>• Larger mats make artwork appear more elegant</li>
                  <li>• Group smaller frames for gallery wall displays</li>
                  <li>• When in doubt, go one size larger</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SizeGuide;