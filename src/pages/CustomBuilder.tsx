import { useState, useRef, useEffect, useCallback } from "react";
import { Upload, Share2, Save, ArrowLeft, ArrowRight, ShoppingCart, Check, Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useNavigate, useSearchParams } from "react-router-dom";

interface FrameOption {
  id: string;
  category: string;
  name: string;
  description: string | null;
  price_modifier: number;
  image_url: string | null;
  available: boolean;
}

interface FrameConfig {
  material: string;
  size: string;
  color: string;
  finish: string;
  matting: string;
  glazing: string;
  mounting: string;
  matWidth: number;
  engraving: string;
}

const CustomBuilder = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  
  const [frameOptions, setFrameOptions] = useState<Record<string, FrameOption[]>>({
    material: [],
    size: [],
    color: [],
    finish: [],
    matting: [],
    glazing: [],
    mounting: [],
  });

  const [frameConfig, setFrameConfig] = useState<FrameConfig>({
    material: "",
    size: "",
    color: "",
    finish: "",
    matting: "",
    glazing: "",
    mounting: "",
    matWidth: 2,
    engraving: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch frame options from database
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const { data, error } = await supabase
          .from('custom_frame_options')
          .select('*')
          .eq('available', true)
          .order('sort_order');

        if (error) throw error;

        // Group options by category
        const grouped: Record<string, FrameOption[]> = {
          material: [],
          size: [],
          color: [],
          finish: [],
          matting: [],
          glazing: [],
          mounting: [],
        };

        data?.forEach(option => {
          if (grouped[option.category]) {
            grouped[option.category].push(option);
          }
        });

        setFrameOptions(grouped);

        // Set defaults
        setFrameConfig(prev => ({
          ...prev,
          material: grouped.material[0]?.name || "",
          size: grouped.size[1]?.name || grouped.size[0]?.name || "",
          color: grouped.color[0]?.name || "",
          finish: grouped.finish[0]?.name || "",
          matting: grouped.matting[0]?.name || "",
          glazing: grouped.glazing[0]?.name || "",
          mounting: grouped.mounting[0]?.name || "",
        }));
      } catch (error) {
        console.error('Error fetching frame options:', error);
        toast.error('Failed to load frame options');
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, []);

  // Load shared design from URL
  useEffect(() => {
    const shareCode = searchParams.get('design');
    if (shareCode) {
      loadSharedDesign(shareCode);
    }
  }, [searchParams]);

  const loadSharedDesign = async (shareCode: string) => {
    try {
      const { data, error } = await supabase
        .from('saved_designs')
        .select('*')
        .eq('share_code', shareCode)
        .single();

      if (error) throw error;

      if (data) {
        const config = data.frame_config as unknown as FrameConfig;
        setFrameConfig(config);
        if (data.image_url) {
          setUploadedImage(data.image_url);
          setProcessedImage(data.image_url);
        }
        setCurrentStep(2);
        toast.success('Design loaded successfully');
      }
    } catch (error) {
      console.error('Error loading shared design:', error);
    }
  };

  // Process uploaded image - resize for preview
  const processImage = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 800;
        let { width, height } = img;

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }, []);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error('Image must be less than 20MB');
      return;
    }

    try {
      const processed = await processImage(file);
      setUploadedImage(URL.createObjectURL(file));
      setProcessedImage(processed);
      setCurrentStep(2);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Failed to process image');
    }
  };

  const getOptionPrice = (category: string, optionName: string): number => {
    const option = frameOptions[category]?.find(o => o.name === optionName);
    return option?.price_modifier || 0;
  };

  const calculatePrice = () => {
    let basePrice = 1299;
    
    // Add price modifiers from selected options
    basePrice += getOptionPrice('material', frameConfig.material);
    basePrice += getOptionPrice('size', frameConfig.size);
    basePrice += getOptionPrice('color', frameConfig.color);
    basePrice += getOptionPrice('finish', frameConfig.finish);
    basePrice += getOptionPrice('matting', frameConfig.matting);
    basePrice += getOptionPrice('glazing', frameConfig.glazing);
    basePrice += getOptionPrice('mounting', frameConfig.mounting);
    
    // Engraving add-on
    if (frameConfig.engraving) basePrice += 399;

    return Math.max(basePrice, 0);
  };

  const handleSaveDesign = async () => {
    if (!user) {
      toast.error('Please sign in to save your design');
      navigate('/login');
      return;
    }

    setSaving(true);
    try {
      const shareCode = Math.random().toString(36).substring(2, 10);
      
      const { error } = await supabase
        .from('saved_designs')
        .insert([{
          user_id: user.id,
          name: `Custom Frame - ${new Date().toLocaleDateString()}`,
          image_url: uploadedImage,
          frame_config: JSON.parse(JSON.stringify(frameConfig)),
          total_price: calculatePrice(),
          share_code: shareCode,
        }]);

      if (error) throw error;

      toast.success('Design saved successfully!');
    } catch (error: any) {
      console.error('Error saving design:', error);
      toast.error(error.message || 'Failed to save design');
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    const shareCode = Math.random().toString(36).substring(2, 10);
    const link = `${window.location.origin}/custom-builder?design=${shareCode}`;
    
    if (user) {
      try {
        await supabase
          .from('saved_designs')
          .insert([{
            user_id: user.id,
            name: `Shared Design - ${new Date().toLocaleDateString()}`,
            image_url: uploadedImage,
            frame_config: JSON.parse(JSON.stringify(frameConfig)),
            total_price: calculatePrice(),
            share_code: shareCode,
          }]);
      } catch (error) {
        console.error('Error creating share link:', error);
      }
    }

    setShareLink(link);
    setShareDialogOpen(true);
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast.success('Link copied to clipboard!');
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please sign in to add to cart');
      navigate('/login');
      return;
    }

    try {
      // Save custom frame order
      const { data, error } = await supabase
        .from('custom_frame_orders')
        .insert([{
          user_id: user.id,
          image_url: uploadedImage,
          frame_config: JSON.parse(JSON.stringify(frameConfig)),
          total_price: calculatePrice(),
          status: 'pending',
        }])
        .select()
        .single();

      if (error) throw error;

      setSuccessDialogOpen(true);
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      toast.error(error.message || 'Failed to add to cart');
    }
  };

  const steps = [
    { id: 1, title: "Upload Image", description: "Add your photo" },
    { id: 2, title: "Choose Frame", description: "Select material & style" },
    { id: 3, title: "Customize", description: "Mat, glass & extras" },
    { id: 4, title: "Review", description: "Final preview & order" },
  ];

  const getFrameColor = () => {
    const colorMap: Record<string, string> = {
      'Natural Oak': '#D2B48C',
      'Walnut Brown': '#5D4037',
      'Espresso': '#3E2723',
      'Classic Black': '#1a1a1a',
      'Pure White': '#FFFFFF',
      'Silver': '#C0C0C0',
      'Gold': '#D4AF37',
      'Rose Gold': '#B76E79',
    };
    return colorMap[frameConfig.color] || '#8B4513';
  };

  const getMatColor = () => {
    const matMap: Record<string, string> = {
      'No Mat': 'transparent',
      'White Mat': '#FFFFFF',
      'Cream Mat': '#FFFDD0',
      'Black Mat': '#1a1a1a',
      'Gray Mat': '#808080',
      'Double Mat': '#FFFFFF',
    };
    return matMap[frameConfig.matting] || '#FFFFFF';
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container-wide py-20 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading frame options...</p>
        </div>
        <Footer />
      </div>
    );
  }

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
            <div className="flex items-center space-x-2 md:space-x-4 overflow-x-auto pb-2">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-shrink-0">
                  <button
                    onClick={() => uploadedImage && setCurrentStep(step.id)}
                    disabled={!uploadedImage && step.id > 1}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      currentStep >= step.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    } ${uploadedImage || step.id === 1 ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed'}`}
                  >
                    <span className="w-6 h-6 rounded-full bg-background/20 flex items-center justify-center text-sm font-medium">
                      {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
                    </span>
                    <span className="hidden sm:inline text-sm font-medium">{step.title}</span>
                  </button>
                  {index < steps.length - 1 && (
                    <ArrowRight className="mx-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
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
                <div className="aspect-square bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg flex items-center justify-center p-8 overflow-hidden">
                  {processedImage ? (
                    <div 
                      className="relative max-w-full max-h-full"
                      style={{
                        padding: frameConfig.matting !== 'No Mat' ? `${frameConfig.matWidth * 12}px` : '0',
                        backgroundColor: getMatColor(),
                        boxShadow: `0 0 0 16px ${getFrameColor()}, 0 4px 20px rgba(0,0,0,0.3)`,
                        borderRadius: '2px',
                      }}
                    >
                      <img
                        src={processedImage}
                        alt="Your photo"
                        className="max-w-full max-h-64 object-contain block"
                        style={{
                          filter: frameConfig.glazing === 'Anti-glare Glass' ? 'brightness(0.98)' : 'none',
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

                {/* Frame Info Summary */}
                {uploadedImage && (
                  <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-medium mb-2">Your Selection</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-muted-foreground">Material:</span> {frameConfig.material}</div>
                      <div><span className="text-muted-foreground">Size:</span> {frameConfig.size}</div>
                      <div><span className="text-muted-foreground">Color:</span> {frameConfig.color}</div>
                      <div><span className="text-muted-foreground">Finish:</span> {frameConfig.finish}</div>
                      <div><span className="text-muted-foreground">Mat:</span> {frameConfig.matting}</div>
                      <div><span className="text-muted-foreground">Glass:</span> {frameConfig.glazing}</div>
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
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Base Frame</span>
                    <span>₹1,299</span>
                  </div>
                  {getOptionPrice('material', frameConfig.material) !== 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>{frameConfig.material}</span>
                      <span>{getOptionPrice('material', frameConfig.material) > 0 ? '+' : ''}₹{getOptionPrice('material', frameConfig.material)}</span>
                    </div>
                  )}
                  {getOptionPrice('size', frameConfig.size) !== 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>{frameConfig.size}</span>
                      <span>{getOptionPrice('size', frameConfig.size) > 0 ? '+' : ''}₹{getOptionPrice('size', frameConfig.size)}</span>
                    </div>
                  )}
                  {getOptionPrice('matting', frameConfig.matting) !== 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>{frameConfig.matting}</span>
                      <span>+₹{getOptionPrice('matting', frameConfig.matting)}</span>
                    </div>
                  )}
                  {getOptionPrice('glazing', frameConfig.glazing) !== 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>{frameConfig.glazing}</span>
                      <span>+₹{getOptionPrice('glazing', frameConfig.glazing)}</span>
                    </div>
                  )}
                  {frameConfig.engraving && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Custom Engraving</span>
                      <span>+₹399</span>
                    </div>
                  )}
                  <hr className="my-3" />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{calculatePrice().toLocaleString()}</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full mt-4" 
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={!uploadedImage}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
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

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• Supported formats: JPG, PNG, WEBP</p>
                    <p>• Images are automatically optimized for preview</p>
                    <p>• We'll crop to fit your chosen frame size</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2-4: Frame Configuration */}
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

                    <TabsContent value="frame" className="space-y-6 mt-4">
                      {/* Material */}
                      <div>
                        <Label className="text-base font-medium">Material</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {frameOptions.material.map((option) => (
                            <button
                              key={option.id}
                              onClick={() => setFrameConfig({ ...frameConfig, material: option.name })}
                              className={`p-3 border rounded-lg text-left transition-colors ${
                                frameConfig.material === option.name
                                  ? "border-primary bg-primary/10"
                                  : "border-border hover:border-primary/50"
                              }`}
                            >
                              <div className="font-medium text-sm">{option.name}</div>
                              {option.price_modifier !== 0 && (
                                <div className="text-xs text-muted-foreground">
                                  {option.price_modifier > 0 ? '+' : ''}₹{option.price_modifier}
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Size */}
                      <div>
                        <Label className="text-base font-medium">Size</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {frameOptions.size.map((option) => (
                            <button
                              key={option.id}
                              onClick={() => setFrameConfig({ ...frameConfig, size: option.name })}
                              className={`p-3 border rounded-lg text-left transition-colors ${
                                frameConfig.size === option.name
                                  ? "border-primary bg-primary/10"
                                  : "border-border hover:border-primary/50"
                              }`}
                            >
                              <div className="font-medium text-sm">{option.name}</div>
                              {option.price_modifier !== 0 && (
                                <div className="text-xs text-muted-foreground">
                                  {option.price_modifier > 0 ? '+' : ''}₹{option.price_modifier}
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Color */}
                      <div>
                        <Label className="text-base font-medium">Color</Label>
                        <div className="grid grid-cols-4 gap-2 mt-2">
                          {frameOptions.color.map((option) => (
                            <button
                              key={option.id}
                              onClick={() => setFrameConfig({ ...frameConfig, color: option.name })}
                              className={`p-2 border rounded-lg text-center transition-colors ${
                                frameConfig.color === option.name
                                  ? "border-primary ring-2 ring-primary/50"
                                  : "border-border hover:border-primary/50"
                              }`}
                            >
                              <div className="text-xs font-medium truncate">{option.name.split(' ')[0]}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Finish */}
                      <div>
                        <Label className="text-base font-medium">Finish</Label>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {frameOptions.finish.map((option) => (
                            <button
                              key={option.id}
                              onClick={() => setFrameConfig({ ...frameConfig, finish: option.name })}
                              className={`p-3 border rounded-lg text-sm transition-colors ${
                                frameConfig.finish === option.name
                                  ? "border-primary bg-primary/10"
                                  : "border-border hover:border-primary/50"
                              }`}
                            >
                              {option.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="matting" className="space-y-6 mt-4">
                      {/* Mat Selection */}
                      <div>
                        <Label className="text-base font-medium">Matting Style</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {frameOptions.matting.map((option) => (
                            <button
                              key={option.id}
                              onClick={() => setFrameConfig({ ...frameConfig, matting: option.name })}
                              className={`p-3 border rounded-lg text-left transition-colors ${
                                frameConfig.matting === option.name
                                  ? "border-primary bg-primary/10"
                                  : "border-border hover:border-primary/50"
                              }`}
                            >
                              <div className="font-medium text-sm">{option.name}</div>
                              {option.price_modifier !== 0 && (
                                <div className="text-xs text-muted-foreground">+₹{option.price_modifier}</div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Mat Width */}
                      {frameConfig.matting !== 'No Mat' && (
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
                            className="mt-3"
                          />
                        </div>
                      )}

                      {/* Glazing */}
                      <div>
                        <Label className="text-base font-medium">Glass Type</Label>
                        <div className="grid grid-cols-1 gap-2 mt-2">
                          {frameOptions.glazing.map((option) => (
                            <button
                              key={option.id}
                              onClick={() => setFrameConfig({ ...frameConfig, glazing: option.name })}
                              className={`p-3 border rounded-lg text-left transition-colors ${
                                frameConfig.glazing === option.name
                                  ? "border-primary bg-primary/10"
                                  : "border-border hover:border-primary/50"
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-medium text-sm">{option.name}</div>
                                  {option.description && (
                                    <div className="text-xs text-muted-foreground">{option.description}</div>
                                  )}
                                </div>
                                {option.price_modifier !== 0 && (
                                  <div className="text-sm font-medium">+₹{option.price_modifier}</div>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="extras" className="space-y-6 mt-4">
                      {/* Mounting */}
                      <div>
                        <Label className="text-base font-medium">Mounting & Backing</Label>
                        <div className="grid grid-cols-1 gap-2 mt-2">
                          {frameOptions.mounting.map((option) => (
                            <button
                              key={option.id}
                              onClick={() => setFrameConfig({ ...frameConfig, mounting: option.name })}
                              className={`p-3 border rounded-lg text-left transition-colors ${
                                frameConfig.mounting === option.name
                                  ? "border-primary bg-primary/10"
                                  : "border-border hover:border-primary/50"
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-medium text-sm">{option.name}</div>
                                  {option.description && (
                                    <div className="text-xs text-muted-foreground">{option.description}</div>
                                  )}
                                </div>
                                {option.price_modifier !== 0 && (
                                  <div className="text-sm font-medium">+₹{option.price_modifier}</div>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Engraving */}
                      <div>
                        <Label className="text-base font-medium">Custom Engraving (+₹399)</Label>
                        <Input
                          placeholder="Enter text for engraving (max 30 characters)"
                          value={frameConfig.engraving}
                          onChange={(e) => setFrameConfig({ ...frameConfig, engraving: e.target.value.slice(0, 30) })}
                          className="mt-2"
                          maxLength={30}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {frameConfig.engraving.length}/30 characters
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}
              
              {currentStep < 4 && uploadedImage && (
                <Button
                  onClick={() => setCurrentStep(currentStep + 1)}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
              
              {uploadedImage && (
                <>
                  <Button 
                    variant="outline" 
                    onClick={handleSaveDesign}
                    disabled={saving}
                  >
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Design
                  </Button>
                  <Button variant="outline" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Your Design</DialogTitle>
            <DialogDescription>
              Copy the link below to share your custom frame design with others.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Input value={shareLink} readOnly className="flex-1" />
            <Button onClick={copyShareLink}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              Added to Cart!
            </DialogTitle>
            <DialogDescription>
              Your custom frame has been added to your cart successfully.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => setSuccessDialogOpen(false)} className="flex-1">
              Continue Designing
            </Button>
            <Button onClick={() => navigate('/cart')} className="flex-1">
              View Cart
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default CustomBuilder;
