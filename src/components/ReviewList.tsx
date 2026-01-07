import { useEffect, useState } from 'react';
import { Star, CheckCircle2, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  verified_purchase: boolean;
  created_at: string;
  user_id: string;
}

interface ReviewListProps {
  productId: string;
  refreshKey?: number;
}

const ReviewList = ({ productId, refreshKey }: ReviewListProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [productId, refreshKey]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(r => r.rating === stars).length,
    percentage: reviews.length > 0 
      ? (reviews.filter(r => r.rating === stars).length / reviews.length) * 100 
      : 0,
  }));

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="grid md:grid-cols-2 gap-6 p-4 bg-muted/30 rounded-lg">
        <div className="text-center md:text-left">
          <div className="text-5xl font-bold mb-2">{averageRating.toFixed(1)}</div>
          <div className="flex items-center justify-center md:justify-start gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-5 w-5 ${
                  star <= Math.round(averageRating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-muted-foreground'
                }`}
              />
            ))}
          </div>
          <p className="text-muted-foreground">{reviews.length} reviews</p>
        </div>
        
        <div className="space-y-2">
          {ratingCounts.map(({ stars, count, percentage }) => (
            <div key={stars} className="flex items-center gap-2 text-sm">
              <span className="w-8">{stars}★</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-muted-foreground">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No reviews yet. Be the first to review this product!
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-muted-foreground'
                          }`}
                        />
                      ))}
                      {review.verified_purchase && (
                        <span className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle2 className="h-3 w-3" />
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              
              {review.title && (
                <h4 className="font-semibold mb-1">{review.title}</h4>
              )}
              {review.comment && (
                <p className="text-muted-foreground">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewList;
