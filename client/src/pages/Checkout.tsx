import { useState, useEffect } from "react";
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/my-purchases`,
      },
    });

    setIsProcessing(false);

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "Thank you for your purchase!",
      });
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="w-full"
        size="lg"
        data-testid="button-complete-payment"
      >
        {isProcessing ? "Processing..." : "Complete Payment"}
      </Button>
    </form>
  );
};

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const [orderId, setOrderId] = useState("");
  const { toast } = useToast();

  // Get cart items from localStorage (in a real app, this would come from a cart context/API)
  const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');

  const { data: templates = [] } = useQuery({
    queryKey: ["/api/templates/cart", cartItems],
    queryFn: async () => {
      if (cartItems.length === 0) return [];
      
      // Fetch template details for cart items
      const templatePromises = cartItems.map((id: string) =>
        fetch(`/api/templates/${id}`).then(res => res.json())
      );
      return Promise.all(templatePromises);
    },
    enabled: cartItems.length > 0,
  });

  const createPaymentMutation = useMutation({
    mutationFn: async (templateIds: string[]) => {
      const response = await apiRequest("POST", "/api/create-payment-intent", { templateIds });
      return response.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
      setOrderId(data.orderId);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create payment intent",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (cartItems.length > 0) {
      createPaymentMutation.mutate(cartItems);
    }
  }, [cartItems.length]);

  const handleSuccess = () => {
    // Clear cart and redirect
    localStorage.removeItem('cart');
    window.location.href = '/my-purchases';
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4" data-testid="text-empty-cart">
              Your cart is empty
            </h1>
            <p className="text-muted-foreground mb-6">
              Add some templates to your cart before checking out
            </p>
            <Button onClick={() => window.location.href = '/templates'} data-testid="button-browse-templates">
              Browse Templates
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="h-screen flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const total = templates.reduce((sum: number, template: any) => sum + parseFloat(template.price), 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8" data-testid="text-checkout-title">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm onSuccess={handleSuccess} />
              </Elements>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates.map((template: any) => (
                  <div key={template.id} className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center space-x-3">
                      <img
                        src={template.previewImages?.[0] || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=60&h=40&fit=crop"}
                        alt={template.name}
                        className="w-12 h-8 object-cover rounded"
                        data-testid={`img-order-item-${template.id}`}
                      />
                      <span className="font-medium" data-testid={`text-order-item-name-${template.id}`}>
                        {template.name}
                      </span>
                    </div>
                    <span className="font-semibold" data-testid={`text-order-item-price-${template.id}`}>
                      ${template.price}
                    </span>
                  </div>
                ))}
                
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary" data-testid="text-total-amount">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 text-sm text-muted-foreground text-center">
                <i className="fas fa-lock mr-1"></i>
                Secure checkout powered by Stripe. Your payment information is encrypted and secure.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
