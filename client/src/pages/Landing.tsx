import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Template, Category } from "@shared/schema";

export default function Landing() {
  const { data: featuredTemplates = [] } = useQuery<(Template & { category?: Category; avgRating?: number; reviewCount?: number })[]>({
    queryKey: ["/api/templates/featured"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-accent text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6" data-testid="hero-title">
            Premium Website Templates
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-2xl mx-auto" data-testid="hero-description">
            Discover professionally crafted templates for your next project. Modern designs that convert visitors into customers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/api/login">
              <Button 
                size="lg" 
                className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-3 text-lg"
                data-testid="button-browse-templates"
              >
                Browse Templates
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary px-8 py-3 text-lg"
              data-testid="button-learn-more"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12" data-testid="text-categories-title">Popular Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Card key={category.id} className="hover:shadow-md transition-shadow cursor-pointer text-center">
                <CardContent className="p-6">
                  <div className="text-3xl text-primary mb-4" data-testid={`icon-category-${category.id}`}>
                    {category.icon ? (
                      <i className={category.icon}></i>
                    ) : (
                      <i className="fas fa-laptop-code"></i>
                    )}
                  </div>
                  <h3 className="font-semibold mb-2" data-testid={`text-category-name-${category.id}`}>
                    {category.name}
                  </h3>
                  <p className="text-muted-foreground text-sm" data-testid={`text-category-description-${category.id}`}>
                    {category.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Templates */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-12">
            <h2 className="text-3xl font-bold mb-4 sm:mb-0" data-testid="text-featured-title">Featured Templates</h2>
            <Link href="/api/login">
              <Button variant="link" className="text-primary font-semibold p-0" data-testid="link-view-all">
                View All Templates <i className="fas fa-arrow-right ml-1"></i>
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredTemplates.map((template) => (
              <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="relative">
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
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg" data-testid={`text-template-name-${template.id}`}>
                      {template.name}
                    </h3>
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
                  <p className="text-muted-foreground mb-4" data-testid={`text-template-description-${template.id}`}>
                    {template.shortDescription || template.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {template.tags?.slice(0, 3).map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" data-testid={`button-preview-${template.id}`}>
                      <Eye className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                    <Link href="/api/login">
                      <Button size="sm" data-testid={`button-add-cart-${template.id}`}>
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        Add to Cart
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12" data-testid="text-why-choose-title">Why Choose TemplateHub?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary text-primary-foreground w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-award text-2xl"></i>
              </div>
              <h3 className="font-bold text-xl mb-3" data-testid="text-quality-title">Premium Quality</h3>
              <p className="text-muted-foreground" data-testid="text-quality-description">
                Hand-crafted templates designed by professionals with attention to detail and modern standards.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-accent text-accent-foreground w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-mobile-alt text-2xl"></i>
              </div>
              <h3 className="font-bold text-xl mb-3" data-testid="text-responsive-title">Fully Responsive</h3>
              <p className="text-muted-foreground" data-testid="text-responsive-description">
                All templates are optimized for mobile, tablet, and desktop devices with perfect responsiveness.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-secondary text-secondary-foreground w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-headset text-2xl"></i>
              </div>
              <h3 className="font-bold text-xl mb-3" data-testid="text-support-title">24/7 Support</h3>
              <p className="text-muted-foreground" data-testid="text-support-description">
                Get help when you need it with our dedicated customer support team available around the clock.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
