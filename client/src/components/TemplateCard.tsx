import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Eye, Heart, Download, Zap, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface TemplateCardProps {
  template: {
    id: string;
    name: string;
    slug: string;
    description: string;
    shortDescription?: string | null;
    price: string;
    previewImages?: string[] | null;
    tags?: string[] | null;
    category?: {
      name: string;
    };
    avgRating?: number;
    reviewCount?: number;
    demoUrl?: string | null;
    downloads?: number | null;
  };
}

export default function TemplateCard({ template }: TemplateCardProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const addToCart = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to add templates to your cart",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1000);
      return;
    }

    setIsAddingToCart(true);
    
    // Get current cart from localStorage
    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if template is already in cart
    if (currentCart.includes(template.id)) {
      toast({
        title: "Already in Cart",
        description: "This template is already in your cart",
        variant: "destructive",
      });
      setIsAddingToCart(false);
      return;
    }

    // Add to cart
    const updatedCart = [...currentCart, template.id];
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    
    toast({
      title: "Added to Cart",
      description: `${template.name} has been added to your cart`,
    });

    // Trigger a page refresh to update cart count in header
    window.dispatchEvent(new Event('storage'));
    setIsAddingToCart(false);
  };

  const handlePreview = () => {
    if (template.demoUrl) {
      window.open(template.demoUrl, '_blank');
    } else {
      toast({
        title: "Preview Unavailable",
        description: "Live preview is not available for this template",
        variant: "destructive",
      });
    }
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "Removed from Wishlist" : "Added to Wishlist",
      description: isLiked 
        ? `${template.name} removed from your wishlist` 
        : `${template.name} added to your wishlist`,
    });
  };

  return (
    <div className="template-card-ultra group gpu-optimized">
      {/* Image Container with Hover Effects */}
      <div className="image-container relative">
        <Link href={`/template/${template.slug}`}>
          <img 
            src={template.previewImages?.[0] || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop"}
            alt={`${template.name} preview`}
            className="w-full h-56 object-cover cursor-pointer"
            data-testid={`img-template-preview-${template.id}`}
          />
        </Link>
        
        {/* Overlay with Actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <Button 
              size="sm" 
              className="bg-white/20 backdrop-blur-sm border-white/20 text-white hover:bg-white/30"
              onClick={handlePreview}
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              className="bg-white/20 backdrop-blur-sm border-white/20 text-white hover:bg-white/30"
              onClick={toggleLike}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current text-red-400' : ''}`} />
            </Button>
          </div>
        </div>
        
        {/* Price Badge */}
        <div className="absolute top-4 right-4">
          <span className="badge-price-ultra">
            ${template.price}
          </span>
        </div>
        
        {/* Download Count */}
        {template.downloads && template.downloads > 0 && (
          <div className="absolute top-4 left-4">
            <div className="flex items-center gap-1 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-xs">
              <Download className="w-3 h-3" />
              <span>{template.downloads}</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Title and Rating */}
        <div className="space-y-2">
          <Link href={`/template/${template.slug}`}>
            <h3 className="font-bold text-lg text-white cursor-pointer hover:text-violet-300 transition-colors line-clamp-1" data-testid={`text-template-name-${template.id}`}>
              {template.name}
            </h3>
          </Link>
          
          {/* Rating */}
          <div className="flex items-center justify-between">
            <div className="rating-ultra">
              {Array.from({ length: 5 }, (_, i) => (
                <Star 
                  key={i} 
                  className={`rating-star-ultra ${i < Math.floor(template.avgRating || 0) ? '' : 'empty'}`}
                />
              ))}
              <span className="text-sm text-white/60 ml-2" data-testid={`text-rating-${template.id}`}>
                {template.avgRating ? template.avgRating.toFixed(1) : '0.0'} ({template.reviewCount || 0})
              </span>
            </div>
          </div>
        </div>
        
        {/* Description */}
        <p className="text-white/70 text-sm line-clamp-2 leading-relaxed" data-testid={`text-template-description-${template.id}`}>
          {template.shortDescription || template.description}
        </p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {template.category && (
            <span className="badge-ultra-premium">
              {template.category.name}
            </span>
          )}
          {template.tags?.slice(0, 2).map((tag: string) => (
            <span key={tag} className="badge-ultra-premium">
              {tag}
            </span>
          ))}
        </div>
        
        {/* Action Buttons */}
        <div className="template-actions">
          <Button 
            className="btn-ghost-premium flex-1" 
            size="sm"
            onClick={handlePreview}
            data-testid={`button-preview-${template.id}`}
          >
            <Eye className="w-4 h-4 mr-1" />
            Preview
          </Button>
          <Button 
            className="btn-ultra-premium flex-1" 
            size="sm"
            onClick={addToCart}
            disabled={isAddingToCart}
            data-testid={`button-add-cart-${template.id}`}
          >
            {isAddingToCart ? (
              <>
                <Sparkles className="w-4 h-4 mr-1 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-1" />
                Add to Cart
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Hover Glow Effect */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500/10 via-transparent to-indigo-500/10"></div>
      </div>
    </div>
  );
}