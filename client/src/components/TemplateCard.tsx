import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Eye } from "lucide-react";
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
  };
}

export default function TemplateCard({ template }: TemplateCardProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

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

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <Link href={`/template/${template.slug}`}>
        <div className="relative cursor-pointer">
          <img 
            src={template.previewImages?.[0] || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop"}
            alt={`${template.name} preview`}
            className="w-full h-48 object-cover"
            data-testid={`img-template-preview-${template.id}`}
          />
          <div className="absolute top-4 right-4">
            <Badge variant="secondary" data-testid={`badge-price-${template.id}`}>
              ${template.price}
            </Badge>
          </div>
        </div>
      </Link>
      
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <Link href={`/template/${template.slug}`}>
            <h3 className="font-bold text-lg cursor-pointer hover:text-primary" data-testid={`text-template-name-${template.id}`}>
              {template.name}
            </h3>
          </Link>
          <div className="flex items-center">
            <div className="flex text-yellow-400 mr-1">
              {Array.from({ length: 5 }, (_, i) => (
                <Star 
                  key={i} 
                  className={`w-4 h-4 ${i < Math.floor(template.avgRating || 0) ? 'fill-current' : ''}`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground" data-testid={`text-rating-${template.id}`}>
              {template.avgRating ? template.avgRating.toFixed(1) : '0.0'} ({template.reviewCount || 0})
            </span>
          </div>
        </div>
        
        <p className="text-muted-foreground mb-4 text-sm" data-testid={`text-template-description-${template.id}`}>
          {template.shortDescription || template.description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {template.category && (
            <Badge variant="outline" className="text-xs">
              {template.category.name}
            </Badge>
          )}
          {template.tags?.slice(0, 2).map((tag: string) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePreview}
            data-testid={`button-preview-${template.id}`}
          >
            <Eye className="w-4 h-4 mr-1" />
            Preview
          </Button>
          <Button 
            size="sm" 
            onClick={addToCart}
            disabled={isAddingToCart}
            data-testid={`button-add-cart-${template.id}`}
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            {isAddingToCart ? "Adding..." : "Add to Cart"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
