import { useState, useRef } from "react";
import { Upload, Download, Share2, Save, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const CustomBuilder = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [frameConfig, setFrameConfig] = useState({
    material: "wood",
    color: "oak",
    size: "8x10",
    matting: "white",
    matWidth: 2,
    glazing: "glass",
    mounting: "foam",
    engraving: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setCurrentStep(2);
      };
      reader.readAsDataURL(file);
    }
  };

  const calculatePrice = () => {
    let basePrice = 1299; // Base price for standard frame
    
    // Material multiplier
    const materialMultipliers = {
      wood: 1.0,
      metal: 0.8,
      acrylic: 1.2,
    };
    
    // Size multiplier
    const sizeMultipliers = {
      "5x7": 0.7,
      "8x10": 1.0,
      "11x14": 1.4,
      "16x20": 2.0,
      "custom": 2.5,
    };

    basePrice *= materialMultipliers[frameConfig.material as keyof typeof materialMultipliers];
    basePrice *= sizeMultipliers[frameConfig.size as keyof typeof sizeMultipliers];
    
    // Add-ons
    if (frameConfig.matting !== "none") basePrice += 299;
    if (frameConfig.glazing === "anti-glare") basePrice += 199;
    if (frameConfig.engraving) basePrice += 399;

    return Math.round(basePrice);
  };

  const steps = [
    { id: 1, title: "Upload Image", description: "Add your photo" },
    { id: 2, title: "Choose Frame", description: "Select material & style" },
    { id: 3, title: "Customize", description: "Mat, glass & extras" },
    { id: 4, title: "Review", description: "Final preview & order" },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Breadcrumb */}
      <div className="bg-muted/30 py-4">
        <div className="container-wide">
          <nav className="text-sm text-muted-foreground">
            Home › Custom Frame Builder
          </nav>
        </div>
      </div>

      <div className="container-wide py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            Custom Frame Builder
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Design your perfect frame with real-time preview. Upload your photo and see it come to life.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-center">
            <div className="flex items-center space-x-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                      currentStep >= step.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step.id}
                  </div>
                  <div className="ml-2 hidden sm:block">
                    <div className="text-sm font-medium">{step.title}</div>
                    <div className="text-xs text-muted-foreground">{step.description}</div>
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight className="mx-4 h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Preview Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Frame Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="frame-preview aspect-square bg-muted/20 flex items-center justify-center">
                  {uploadedImage ? (
                    <div className="relative">
                      <img
                        src={uploadedImage}
                        alt="Your photo"
                        className="max-w-full max-h-80 object-contain"
                        style={{
                          border: `${frameConfig.matWidth * 4}px solid white`,
                          boxShadow: `0 0 0 12px ${
                            frameConfig.material === "wood" ? "#8B4513" : 
                            frameConfig.material === "metal" ? "#2D2D2D" : "#E0E0E0"
                          }`,
                        }}
                      />
                    </div>
                  ) : (
                    <div className="text-center p-8">
                      <Upload className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Upload an image to see your frame preview</p>
                    </div>
                  )}
                </div>

                {/* Frame Info */}
                {uploadedImage && (
                  <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Material:</span> {frameConfig.material}
                      </div>
                      <div>
                        <span className="font-medium">Size:</span> {frameConfig.size}
                      </div>
                      <div>
                        <span className="font-medium">Matting:</span> {frameConfig.matting}
                      </div>
                      <div>
                        <span className="font-medium">Glazing:</span> {frameConfig.glazing}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Price Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Price Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Base Frame</span>
                    <span>₹1,299</span>
                  </div>
                  {frameConfig.matting !== "none" && (
                    <div className="flex justify-between">
                      <span>Matting</span>
                      <span>₹299</span>
                    </div>
                  )}
                  {frameConfig.glazing === "anti-glare" && (
                    <div className="flex justify-between">
                      <span>Anti-glare Glass</span>
                      <span>₹199</span>
                    </div>
                  )}
                  {frameConfig.engraving && (
                    <div className="flex justify-between">
                      <span>Custom Engraving</span>
                      <span>₹399</span>
                    </div>
                  )}
                  <hr className="my-2" />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{calculatePrice().toLocaleString()}</span>
                  </div>
                </div>
                
                <Button className="w-full mt-4 btn-hero" size="lg">
                  Add to Cart - ₹{calculatePrice().toLocaleString()}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Configuration Panel */}
          <div className="space-y-6">
            {/* Step 1: Upload Image */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Upload Your Photo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">Upload your photo</p>
                    <p className="text-muted-foreground text-sm">
                      JPG or PNG up to 20MB. For best quality, choose 2000px on the longest side.
                    </p>
                    <Button className="mt-4">Choose File</Button>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  <div className="text-xs text-muted-foreground">
                    <p>• Supported formats: JPG, PNG, HEIC</p>
                    <p>• Colors may vary slightly due to screen differences</p>
                    <p>• We'll crop to fit your chosen frame size</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2 & 3: Frame Configuration */}
            {currentStep >= 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Customize Your Frame</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="frame" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="frame">Frame</TabsTrigger>
                      <TabsTrigger value="matting">Matting</TabsTrigger>
                      <TabsTrigger value="extras">Extras</TabsTrigger>
                    </TabsList>

                    <TabsContent value="frame" className="space-y-4">
                      {/* Frame Material */}
                      <div>
                        <Label className="text-base font-medium">Frame Material</Label>
                        <div className="grid grid-cols-3 gap-3 mt-2">
                          {["wood", "metal", "acrylic"].map((material) => (
                            <button
                              key={material}
                              onClick={() => setFrameConfig({ ...frameConfig, material })}
                              className={`p-3 border rounded-lg text-sm capitalize ${
                                frameConfig.material === material
                                  ? "border-primary bg-primary/10"
                                  : "border-border"
                              }`}
                            >
                              {material}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Frame Size */}
                      <div>
                        <Label className="text-base font-medium">Frame Size</Label>
                        <Select
                          value={frameConfig.size}
                          onValueChange={(size) => setFrameConfig({ ...frameConfig, size })}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5x7">5" × 7"</SelectItem>
                            <SelectItem value="8x10">8" × 10"</SelectItem>
                            <SelectItem value="11x14">11" × 14"</SelectItem>
                            <SelectItem value="16x20">16" × 20"</SelectItem>
                            <SelectItem value="custom">Custom Size</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Frame Color */}
                      <div>
                        <Label className="text-base font-medium">Frame Color</Label>
                        <div className="grid grid-cols-4 gap-2 mt-2">
                          {["oak", "walnut", "black", "white"].map((color) => (
                            <button
                              key={color}
                              onClick={() => setFrameConfig({ ...frameConfig, color })}
                              className={`h-12 rounded-lg border-2 capitalize ${
                                frameConfig.color === color
                                  ? "border-primary"
                                  : "border-border"
                              }`}
                              style={{
                                backgroundColor: color === "oak" ? "#D2B48C" : 
                                              color === "walnut" ? "#8B4513" :
                                              color === "black" ? "#2D2D2D" : "#FFFFFF"
                              }}
                            >
                              <span className={color === "white" ? "text-black" : "text-white"}>
                                {color}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="matting" className="space-y-4">
                      {/* Mat Selection */}
                      <div>
                        <Label className="text-base font-medium">Matting</Label>
                        <Select
                          value={frameConfig.matting}
                          onValueChange={(matting) => setFrameConfig({ ...frameConfig, matting })}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Matting</SelectItem>
                            <SelectItem value="white">White Mat</SelectItem>
                            <SelectItem value="cream">Cream Mat</SelectItem>
                            <SelectItem value="black">Black Mat</SelectItem>
                            <SelectItem value="double">Double Mat</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Mat Width */}
                      {frameConfig.matting !== "none" && (
                        <div>
                          <Label className="text-base font-medium">
                            Mat Width: {frameConfig.matWidth}"
                          </Label>
                          <Slider
                            value={[frameConfig.matWidth]}
                            onValueChange={([value]) => setFrameConfig({ ...frameConfig, matWidth: value })}
                            max={4}
                            min={1}
                            step={0.5}
                            className="mt-2"
                          />
                        </div>
                      )}

                      {/* Glazing */}
                      <div>
                        <Label className="text-base font-medium">Glass Type</Label>
                        <Select
                          value={frameConfig.glazing}
                          onValueChange={(glazing) => setFrameConfig({ ...frameConfig, glazing })}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="glass">Standard Glass</SelectItem>
                            <SelectItem value="anti-glare">Anti-glare Glass (+₹199)</SelectItem>
                            <SelectItem value="acrylic">Acrylic</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TabsContent>

                    <TabsContent value="extras" className="space-y-4">
                      {/* Mounting */}
                      <div>
                        <Label className="text-base font-medium">Mounting & Backing</Label>
                        <Select
                          value={frameConfig.mounting}
                          onValueChange={(mounting) => setFrameConfig({ ...frameConfig, mounting })}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="paper">Paper Backing</SelectItem>
                            <SelectItem value="foam">Foam Board</SelectItem>
                            <SelectItem value="archival">Archival Mounting</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Engraving */}
                      <div>
                        <Label className="text-base font-medium">Custom Engraving (+₹399)</Label>
                        <Input
                          placeholder="Enter text for engraving"
                          value={frameConfig.engraving}
                          onChange={(e) => setFrameConfig({ ...frameConfig, engraving: e.target.value })}
                          className="mt-2"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Maximum 30 characters. Available on wood frames only.
                        </p>
                      </div>

                      {/* Hanging Hardware */}
                      <div>
                        <Label className="text-base font-medium">Hanging Hardware</Label>
                        <div className="mt-2 space-y-2">
                          <label className="flex items-center space-x-2">
                            <input type="checkbox" defaultChecked />
                            <span className="text-sm">Wire hanging system (included)</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input type="checkbox" />
                            <span className="text-sm">Installation kit (+₹99)</span>
                          </label>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}
              
              {uploadedImage && (
                <>
                  <Button variant="outline" size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Save Design
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CustomBuilder;