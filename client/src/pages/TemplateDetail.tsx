import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Star, ShoppingCart, Eye, Download, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";

export default function TemplateDetail() {
  const { slug } = useParams() as { slug: string };
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const { data: template, isLoading } = useQuery({
    queryKey: ["/api/templates", slug],
    queryFn: async () => {
      const response = await fetch(`/api/templates/slug/${slug}`);
      if (!response.ok) throw new Error("Template not found");
      return response.json();
    },
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["/api/templates", template?.id, "reviews"],
    enabled: !!template?.id,
  });

  const { data: purchases = [] } = useQuery({
    queryKey: ["/api/my-purchases"],
    enabled: !!user,
  });

  const addToCartMutation = useMutation({
    mutationFn: async (templateId: string) => {
      return apiRequest("POST", "/api/cart/add", { templateId });
    },
    onSuccess: () => {
      toast({
        title: "Added to Cart",
        description: "Template has been added to your cart",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add template to cart",
        variant: "destructive",
      });
    },
  });

  const addReviewMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/templates/${template.id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment,
      });
    },
    onSuccess: () => {
      toast({
        title: "Review Added",
        description: "Thank you for your review!",
      });
      setReviewComment("");
      setReviewRating(5);
      queryClient.invalidateQueries({ queryKey: ["/api/templates", template.id, "reviews"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add review",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !template) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
            <div className="h-96 bg-muted rounded mb-6"></div>
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isPurchased = purchases.some((p: any) => p.id === template.id);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Template Images */}
          <div className="space-y-4">
            <div className="aspect-video">
              <img
                src={template.previewImages?.[0] || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop"}
                alt={`${template.name} main preview`}
                className="w-full h-full object-cover rounded-lg shadow-md"
                data-testid={`img-template-main-${template.id}`}
              />
            </div>
            {template.previewImages?.slice(1).map((image: string, index: number) => (
              <div key={index} className="aspect-video">
                <img
                  src={image}
                  alt={`${template.name} preview ${index + 2}`}
                  className="w-full h-full object-cover rounded-lg shadow-md"
                  data-testid={`img-template-preview-${template.id}-${index + 1}`}
                />
              </div>
            ))}
          </div>

          {/* Template Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2" data-testid={`text-template-name-${template.id}`}>
                {template.name}
              </h1>
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400 mr-2">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(template.avgRating || 0) ? 'fill-current' : ''}`}
                    />
                  ))}
                </div>
                <span className="text-muted-foreground" data-testid={`text-rating-${template.id}`}>
                  {template.avgRating ? template.avgRating.toFixed(1) : '0.0'} ({template.reviewCount || 0} reviews)
                </span>
              </div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-4xl font-bold text-primary" data-testid={`text-price-${template.id}`}>
                  ${template.price}
                </span>
                {template.category && (
                  <Badge variant="outline" data-testid={`badge-category-${template.id}`}>
                    {template.category.name}
                  </Badge>
                )}
              </div>
            </div>

            <div>
              <p className="text-muted-foreground mb-6" data-testid={`text-description-${template.id}`}>
                {template.description}
              </p>
              
              {template.tags && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {template.tags.map((tag: string) => (
                    <Badge key={tag} variant="outline" className="text-sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              {isPurchased ? (
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => window.open(template.downloadUrl, '_blank')}
                  data-testid={`button-download-${template.id}`}
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Template
                </Button>
              ) : (
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => addToCartMutation.mutate(template.id)}
                  disabled={addToCartMutation.isPending}
                  data-testid={`button-add-cart-${template.id}`}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
                </Button>
              )}
              
              {template.demoUrl && (
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="lg"
                  onClick={() => window.open(template.demoUrl, '_blank')}
                  data-testid={`button-demo-${template.id}`}
                >
                  <Eye className="w-5 h-5 mr-2" />
                  Live Preview
                </Button>
              )}
            </div>

            {/* Template Features */}
            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-accent mr-2" />
                    Fully responsive design
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-accent mr-2" />
                    SEO optimized
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-accent mr-2" />
                    Cross-browser compatibility
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-accent mr-2" />
                    Clean, modern code
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-accent mr-2" />
                    Documentation included
                  </li>
                  {template.fileSize && (
                    <li className="flex items-center">
                      <Check className="w-4 h-4 text-accent mr-2" />
                      File size: {template.fileSize}
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Reviews Section */}
        <Card>
          <CardHeader>
            <CardTitle data-testid="text-reviews-title">
              Reviews ({reviews.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add Review Form (only if purchased) */}
            {isPurchased && (
              <div className="border-b pb-6">
                <h3 className="font-semibold mb-4">Leave a Review</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Rating</label>
                    <div className="flex space-x-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <button
                          key={i}
                          onClick={() => setReviewRating(i + 1)}
                          className={`w-6 h-6 ${i < reviewRating ? 'text-yellow-400' : 'text-muted-foreground'}`}
                          data-testid={`button-rating-${i + 1}`}
                        >
                          <Star className="w-full h-full fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Comment</label>
                    <Textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your experience with this template..."
                      data-testid="textarea-review-comment"
                    />
                  </div>
                  <Button 
                    onClick={() => addReviewMutation.mutate()}
                    disabled={addReviewMutation.isPending || !reviewComment.trim()}
                    data-testid="button-submit-review"
                  >
                    {addReviewMutation.isPending ? "Submitting..." : "Submit Review"}
                  </Button>
                </div>
              </div>
            )}

            {/* Reviews List */}
            {reviews.length === 0 ? (
              <p className="text-muted-foreground text-center py-8" data-testid="text-no-reviews">
                No reviews yet. Be the first to review this template!
              </p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review: any) => (
                  <div key={review.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <img
                          src={review.user.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user.firstName || 'User')}`}
                          alt={review.user.firstName || 'User'}
                          className="w-10 h-10 rounded-full"
                          data-testid={`img-reviewer-${review.id}`}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium" data-testid={`text-reviewer-name-${review.id}`}>
                            {review.user.firstName} {review.user.lastName}
                          </span>
                          <div className="flex text-yellow-400">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < review.rating ? 'fill-current' : ''}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-muted-foreground text-sm mb-2" data-testid={`text-review-date-${review.id}`}>
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-foreground" data-testid={`text-review-comment-${review.id}`}>
                          {review.comment}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
