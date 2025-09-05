import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { X, ShoppingCart as ShoppingCartIcon, Trash2, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface ShoppingCartProps {
  open: boolean;
  onClose: () => void;
}

export default function ShoppingCart({ open, onClose }: ShoppingCartProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<string[]>([]);

  // Load cart items from localStorage
  useEffect(() => {
    const loadCart = () => {
      const stored = localStorage.getItem('cart');
      if (stored) {
        setCartItems(JSON.parse(stored));
      }
    };

    loadCart();

    // Listen for storage events to update cart when items are added
    const handleStorageChange = () => {
      loadCart();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Fetch template details for cart items
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["/api/templates/cart", cartItems],
    queryFn: async () => {
      if (cartItems.length === 0) return [];
      
      const templatePromises = cartItems.map(async (id: string) => {
        const response = await fetch(`/api/templates/${id}`);
        if (!response.ok) throw new Error(`Failed to fetch template ${id}`);
        return response.json();
      });
      return Promise.all(templatePromises);
    },
    enabled: cartItems.length > 0,
  });

  const removeFromCart = (templateId: string) => {
    const updatedCart = cartItems.filter(id => id !== templateId);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    
    toast({
      title: "Removed from Cart",
      description: "Template has been removed from your cart",
    });

    // Trigger storage event to update header cart count
    window.dispatchEvent(new Event('storage'));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
    window.dispatchEvent(new Event('storage'));
    
    toast({
      title: "Cart Cleared",
      description: "All items have been removed from your cart",
    });
  };

  const proceedToCheckout = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to proceed with checkout",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1000);
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add some templates to your cart first",
        variant: "destructive",
      });
      return;
    }

    onClose();
    window.location.href = "/checkout";
  };

  const subtotal = templates.reduce((sum, template) => sum + parseFloat(template.price || "0"), 0);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-96 overflow-y-auto">
        <SheetHeader className="pb-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center" data-testid="text-cart-title">
              <ShoppingCartIcon className="w-5 h-5 mr-2" />
              Shopping Cart ({cartItems.length})
            </SheetTitle>
            {cartItems.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="text-muted-foreground hover:text-destructive"
                data-testid="button-clear-cart"
              >
                Clear All
              </Button>
            )}
          </div>
        </SheetHeader>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <ShoppingCartIcon className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2" data-testid="text-empty-cart">Your cart is empty</h3>
            <p className="text-muted-foreground mb-4">
              Browse our templates and add some to your cart
            </p>
            <Button onClick={() => { onClose(); window.location.href = "/templates"; }} data-testid="button-browse-templates">
              Browse Templates
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Cart Items */}
            <div className="space-y-3">
              {isLoading ? (
                Array.from({ length: cartItems.length }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="flex space-x-3">
                        <div className="w-16 h-12 bg-muted rounded"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                templates.map((template) => (
                  <Card key={template.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={template.previewImages?.[0] || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100&h=75&fit=crop"}
                          alt={`${template.name} thumbnail`}
                          className="w-16 h-12 object-cover rounded"
                          data-testid={`img-cart-item-${template.id}`}
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm" data-testid={`text-cart-item-name-${template.id}`}>
                            {template.name}
                          </h4>
                          <p className="text-accent font-bold" data-testid={`text-cart-item-price-${template.id}`}>
                            ${template.price}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(template.id)}
                          className="text-muted-foreground hover:text-destructive p-1"
                          data-testid={`button-remove-${template.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            <Separator />

            {/* Cart Summary */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-bold" data-testid="text-cart-subtotal">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-lg">
                <span className="font-bold">Total:</span>
                <span className="font-bold text-accent" data-testid="text-cart-total">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              
              <Button 
                className="w-full" 
                size="lg"
                onClick={proceedToCheckout}
                disabled={cartItems.length === 0}
                data-testid="button-checkout"
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Proceed to Checkout
              </Button>
              
              <p className="text-xs text-muted-foreground text-center">
                Secure checkout powered by Stripe
              </p>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
