import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ReviewFormProps {
  productId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const ReviewForm = ({ productId, onSuccess, onCancel }: ReviewFormProps) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please sign in to leave a review');
      return;
    }

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setSubmitting(true);

    try {
      // Check if user has purchased this product
      const { data: orders } = await supabase
        .from('order_items')
        .select('order_id, orders!inner(user_id)')
        .eq('product_id', productId)
        .eq('orders.user_id', user.id)
        .limit(1);

      const verifiedPurchase = orders && orders.length > 0;

      const { error } = await supabase
        .from('reviews')
        .insert([{
          product_id: productId,
          user_id: user.id,
          rating,
          title: title.trim() || null,
          comment: comment.trim() || null,
          verified_purchase: verifiedPurchase,
        }]);

      if (error) {
        if (error.code === '23505') {
          toast.error('You have already reviewed this product');
        } else {
          throw error;
        }
        return;
      }

      toast.success('Review submitted successfully!');
      onSuccess();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-muted/30">
      <div>
        <Label className="text-base font-medium mb-2 block">Your Rating</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="focus:outline-none"
            >
              <Star
                className={`h-8 w-8 transition-colors ${
                  star <= (hoverRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-muted-foreground'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="title">Review Title (Optional)</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          maxLength={100}
        />
      </div>

      <div>
        <Label htmlFor="comment">Your Review (Optional)</Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell others about your experience with this product..."
          rows={4}
          maxLength={1000}
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting || rating === 0}>
          {submitting ? 'Submitting...' : 'Submit Review'}
        </Button>
      </div>
    </form>
  );
};

export default ReviewForm;
