import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar } from "lucide-react";

export default function MyPurchases() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  const { data: purchases = [], isLoading: purchasesLoading } = useQuery({
    queryKey: ["/api/my-purchases"],
    enabled: !!isAuthenticated,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["/api/my-orders"],
    enabled: !!isAuthenticated,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="h-96 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4" data-testid="text-purchases-title">
            My Purchases
          </h1>
          <p className="text-muted-foreground">
            Download and manage your purchased templates
          </p>
        </div>

        {purchasesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted h-48 rounded-t-lg mb-4"></div>
                <div className="bg-muted h-4 rounded mb-2"></div>
                <div className="bg-muted h-4 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : purchases.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-4">
              <i className="fas fa-shopping-bag text-4xl text-muted-foreground"></i>
            </div>
            <h2 className="text-xl font-semibold mb-2" data-testid="text-no-purchases">
              No purchases yet
            </h2>
            <p className="text-muted-foreground mb-6">
              Browse our template collection and make your first purchase
            </p>
            <Button onClick={() => window.location.href = '/templates'} data-testid="button-browse-templates">
              Browse Templates
            </Button>
          </div>
        ) : (
          <>
            {/* Purchased Templates */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Downloaded Templates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {purchases.map((template: any) => (
                  <Card key={template.id} className="overflow-hidden">
                    <div className="aspect-video">
                      <img
                        src={template.previewImages?.[0] || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop"}
                        alt={`${template.name} preview`}
                        className="w-full h-full object-cover"
                        data-testid={`img-purchased-template-${template.id}`}
                      />
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-lg" data-testid={`text-template-name-${template.id}`}>
                          {template.name}
                        </h3>
                        <Badge variant="outline" data-testid={`badge-template-price-${template.id}`}>
                          ${template.price}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm mb-4" data-testid={`text-template-description-${template.id}`}>
                        {template.shortDescription || template.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {template.tags?.slice(0, 3).map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          className="flex-1"
                          onClick={() => window.open(template.downloadUrl, '_blank')}
                          data-testid={`button-download-${template.id}`}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                        {template.demoUrl && (
                          <Button 
                            variant="outline" 
                            onClick={() => window.open(template.demoUrl, '_blank')}
                            data-testid={`button-preview-${template.id}`}
                          >
                            Preview
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Order History */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Order History</h2>
              <div className="space-y-4">
                {orders.map((order: any) => (
                  <Card key={order.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-semibold" data-testid={`text-order-id-${order.id}`}>
                              Order #{order.id.slice(-8)}
                            </p>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span data-testid={`text-order-date-${order.id}`}>
                                {new Date(order.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold" data-testid={`text-order-total-${order.id}`}>
                            ${parseFloat(order.totalAmount).toFixed(2)}
                          </p>
                          <Badge 
                            variant={order.status === 'completed' ? 'default' : 'secondary'}
                            data-testid={`badge-order-status-${order.id}`}
                          >
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
