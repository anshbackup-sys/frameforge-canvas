import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Collection {
  id: string;
  name: string;
  description: string;
  image_url: string;
  featured: boolean;
}

interface Product {
  id: string;
  name: string;
  price: number;
  rating: number | null;
  reviews_count: number;
  image_url: string;
  category: string;
  size: string;
  stock: number;
  featured: boolean;
}

const CollectionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCollectionAndProducts();
    }
  }, [id]);

  const fetchCollectionAndProducts = async () => {
    try {
      // Fetch collection details
      const { data: collectionData, error: collectionError } = await supabase
        .from('collections')
        .select('*')
        .eq('id', id)
        .single();

      if (collectionError) throw collectionError;
      setCollection(collectionData);

      // Fetch products in this collection via product_collections junction table
      const { data: productCollections, error: pcError } = await supabase
        .from('product_collections')
        .select('product_id')
        .eq('collection_id', id);

      if (pcError) throw pcError;

      if (productCollections && productCollections.length > 0) {
        const productIds = productCollections.map(pc => pc.product_id);
        
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .in('id', productIds);

        if (productsError) throw productsError;
        setProducts(productsData || []);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching collection:', error);
      toast.error('Failed to load collection');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container-wide py-16">
          <div className="space-y-8">
            <div className="h-12 bg-cosmic-gray/50 rounded animate-pulse w-1/3" />
            <div className="h-64 bg-cosmic-gray/50 rounded animate-pulse" />
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-80 bg-cosmic-gray/50 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container-wide py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Collection Not Found</h1>
          <Button asChild>
            <Link to="/collections">Back to Collections</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Breadcrumb */}
      <section className="py-6 bg-cosmic-gray/30">
        <div className="container-wide">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/collections">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Collections
            </Link>
          </Button>
        </div>
      </section>

      {/* Collection Hero */}
      <section className="py-16">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold">{collection.name}</h1>
              <p className="text-xl text-muted-foreground">{collection.description}</p>
              <div className="flex items-center gap-4">
                <span className="text-lg text-muted-foreground">
                  {products.length} {products.length === 1 ? 'Product' : 'Products'}
                </span>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-video overflow-hidden rounded-2xl shadow-2xl">
                <img 
                  src={collection.image_url || '/placeholder.svg'} 
                  alt={collection.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div>
            <h2 className="text-2xl font-bold mb-8">Products in this Collection</h2>
            
            {products.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground mb-4">No products in this collection yet.</p>
                  <Button asChild>
                    <Link to="/shop">Browse All Products</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={{
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      rating: product.rating || 0,
                      reviews: product.reviews_count,
                      image: product.image_url,
                      category: product.category,
                      size: product.size,
                      inStock: product.stock > 0,
                      isBestseller: product.featured
                    }} 
                    viewMode="grid"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CollectionDetail;
