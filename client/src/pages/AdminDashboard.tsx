import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/Header";
import UploadTemplate from "@/components/UploadTemplate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  DollarSign, 
  ShoppingBag, 
  Code, 
  Users, 
  Plus,
  TrendingUp,
} from "lucide-react";

export default function AdminDashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user?.isAdmin)) {
      toast({
        title: "Unauthorized",
        description: "Admin access required",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: !!user?.isAdmin,
    retry: false,
  });

  const { data: recentOrders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/admin/recent-orders"],
    enabled: !!user?.isAdmin,
    retry: false,
  });

  const { data: templates = [] } = useQuery({
    queryKey: ["/api/templates"],
    enabled: !!user?.isAdmin,
  });

  if (isLoading || !user?.isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="h-96 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-admin-title">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your template marketplace</p>
          </div>
          <Button 
            onClick={() => setShowUploadForm(true)}
            data-testid="button-add-template"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Template
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold" data-testid="text-total-revenue">
                    ${statsLoading ? "..." : stats?.totalRevenue.toLocaleString() || "0"}
                  </p>
                </div>
                <div className="bg-primary text-primary-foreground p-3 rounded-lg">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold" data-testid="text-total-orders">
                    {statsLoading ? "..." : stats?.totalOrders.toLocaleString() || "0"}
                  </p>
                </div>
                <div className="bg-accent text-accent-foreground p-3 rounded-lg">
                  <ShoppingBag className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Templates</p>
                  <p className="text-2xl font-bold" data-testid="text-total-templates">
                    {statsLoading ? "..." : stats?.totalTemplates.toLocaleString() || "0"}
                  </p>
                </div>
                <div className="bg-secondary text-secondary-foreground p-3 rounded-lg">
                  <Code className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Users</p>
                  <p className="text-2xl font-bold" data-testid="text-total-users">
                    {statsLoading ? "..." : stats?.totalUsers.toLocaleString() || "0"}
                  </p>
                </div>
                <div className="bg-muted text-muted-foreground p-3 rounded-lg">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList>
            <TabsTrigger value="orders">Recent Orders</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Recent Orders */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-12 bg-muted rounded animate-pulse" />
                    ))}
                  </div>
                ) : recentOrders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8" data-testid="text-no-orders">
                    No orders found
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 text-muted-foreground font-medium">Order ID</th>
                          <th className="text-left py-3 text-muted-foreground font-medium">Customer</th>
                          <th className="text-left py-3 text-muted-foreground font-medium">Templates</th>
                          <th className="text-left py-3 text-muted-foreground font-medium">Amount</th>
                          <th className="text-left py-3 text-muted-foreground font-medium">Status</th>
                          <th className="text-left py-3 text-muted-foreground font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map((order: any) => (
                          <tr key={order.id} className="border-b border-border">
                            <td className="py-3 font-mono text-sm" data-testid={`text-order-id-${order.id}`}>
                              #{order.id.slice(-8)}
                            </td>
                            <td className="py-3" data-testid={`text-customer-${order.id}`}>
                              {order.user.firstName} {order.user.lastName}
                            </td>
                            <td className="py-3" data-testid={`text-templates-${order.id}`}>
                              {order.items.map((item: any) => item.template.name).join(", ")}
                            </td>
                            <td className="py-3" data-testid={`text-amount-${order.id}`}>
                              ${parseFloat(order.totalAmount).toFixed(2)}
                            </td>
                            <td className="py-3">
                              <Badge 
                                variant={order.status === 'completed' ? 'default' : 'secondary'}
                                data-testid={`badge-status-${order.id}`}
                              >
                                {order.status}
                              </Badge>
                            </td>
                            <td className="py-3 text-muted-foreground text-sm" data-testid={`text-date-${order.id}`}>
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Management */}
          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle>Template Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templates.map((template: any) => (
                    <Card key={template.id} className="overflow-hidden">
                      <div className="aspect-video">
                        <img
                          src={template.previewImages?.[0] || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop"}
                          alt={template.name}
                          className="w-full h-full object-cover"
                          data-testid={`img-template-${template.id}`}
                        />
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold" data-testid={`text-template-name-${template.id}`}>
                            {template.name}
                          </h3>
                          <Badge variant="outline" data-testid={`badge-template-price-${template.id}`}>
                            ${template.price}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span data-testid={`text-downloads-${template.id}`}>
                            {template.downloads} downloads
                          </span>
                          <Badge variant={template.isActive ? 'default' : 'secondary'}>
                            {template.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Performance Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Average Order Value</span>
                      <span className="font-semibold">
                        ${stats?.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : '0.00'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Templates per Order</span>
                      <span className="font-semibold">1.2</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Conversion Rate</span>
                      <span className="font-semibold">12.5%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart className="w-5 h-5 mr-2" />
                    Top Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Business</span>
                      <span className="font-semibold">45 templates</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>E-commerce</span>
                      <span className="font-semibold">32 templates</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Portfolio</span>
                      <span className="font-semibold">28 templates</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Blog</span>
                      <span className="font-semibold">21 templates</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Upload Template Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <UploadTemplate onClose={() => setShowUploadForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
