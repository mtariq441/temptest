import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TemplateCard from "@/components/TemplateCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Star, Search, ArrowRight, Tag, TrendingUp, Clock, Heart, Percent } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { Template, Category } from "@shared/schema";

type TemplateWithExtras = Template & { 
  category?: Category; 
  avgRating?: number; 
  reviewCount?: number 
};

export default function Landing() {
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all template sections
  const { data: featuredTemplates = [] } = useQuery<TemplateWithExtras[]>({
    queryKey: ["/api/templates/featured"],
  });

  const { data: bestSellingTemplates = [] } = useQuery<TemplateWithExtras[]>({
    queryKey: ["/api/templates/best-selling"],
  });

  const { data: latestTemplates = [] } = useQuery<TemplateWithExtras[]>({
    queryKey: ["/api/templates/latest"],
  });

  const { data: trendingTemplates = [] } = useQuery<TemplateWithExtras[]>({
    queryKey: ["/api/templates/trending"],
  });

  const { data: discountTemplates = [] } = useQuery<TemplateWithExtras[]>({
    queryKey: ["/api/templates/discount"],
  });

  const { data: customerFavorites = [] } = useQuery<TemplateWithExtras[]>({
    queryKey: ["/api/templates/favorites"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Featured template for hero banner (use first featured template)
  const heroTemplate = featuredTemplates[0];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/templates?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Banner - Large Featured Template Slider */}
      <section className="relative bg-gradient-to-br from-primary/10 to-accent/10 py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge variant="secondary" className="w-fit">
                <Star className="w-4 h-4 mr-2 fill-current text-yellow-500" />
                Featured Template
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                {heroTemplate ? (
                  <>Premium <span className="text-primary">{heroTemplate.name}</span> Template</>
                ) : (
                  <>Premium <span className="text-primary">Website</span> Templates</>
                )}
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                {heroTemplate?.description || "Discover professionally crafted templates for your next project. Modern designs that convert visitors into customers."}
              </p>
              
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="flex gap-2 max-w-lg">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search templates, categories, tags..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button type="submit">Search</Button>
              </form>

              {heroTemplate && (
                <div className="flex gap-4 pt-4">
                  <Button size="lg" className="px-8">
                    <Link href={heroTemplate.demoUrl || "#"}>
                      View Demo
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="px-8">
                    Buy Now - ${heroTemplate.price}
                  </Button>
                </div>
              )}
            </div>

            {heroTemplate && (
              <div className="relative">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img 
                    src={heroTemplate.previewImages?.[0] || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop"}
                    alt={heroTemplate.name}
                    className="w-full h-96 object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-green-500 text-white">
                      ${heroTemplate.price}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Templates Section */}
      {featuredTemplates.length > 0 && (
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <Star className="w-6 h-6 text-yellow-500 fill-current" />
                <h2 className="text-3xl font-bold">Featured Templates</h2>
              </div>
              <Link href="/templates?featured=true">
                <Button variant="ghost" className="flex items-center gap-2">
                  View All <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Best Selling Templates Section */}
      {bestSellingTemplates.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-green-500" />
                <h2 className="text-3xl font-bold">Best Selling Templates</h2>
              </div>
              <Link href="/templates?sort=popular">
                <Button variant="ghost" className="flex items-center gap-2">
                  View All <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bestSellingTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Templates Section */}
      {latestTemplates.length > 0 && (
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-blue-500" />
                <h2 className="text-3xl font-bold">Latest Templates</h2>
              </div>
              <Link href="/templates?sort=newest">
                <Button variant="ghost" className="flex items-center gap-2">
                  View All <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Category Sections */}
      {categories.map((category) => (
        <CategorySection key={category.id} category={category} />
      ))}

      {/* Trending Templates Section */}
      {trendingTemplates.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-purple-500" />
                <h2 className="text-3xl font-bold">Trending Templates</h2>
              </div>
              <Link href="/templates?sort=rating">
                <Button variant="ghost" className="flex items-center gap-2">
                  View All <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Discount Templates Section */}
      {discountTemplates.length > 0 && (
        <section className="py-16 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <Percent className="w-6 h-6 text-red-500" />
                <h2 className="text-3xl font-bold">Special Offers</h2>
              </div>
              <Link href="/templates?discount=true">
                <Button variant="ghost" className="flex items-center gap-2">
                  View All <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {discountTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Customer Favorites Section */}
      {customerFavorites.length > 0 && (
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <Heart className="w-6 h-6 text-red-500 fill-current" />
                <h2 className="text-3xl font-bold">Customer Favorites</h2>
              </div>
              <Link href="/templates?sort=rating">
                <Button variant="ghost" className="flex items-center gap-2">
                  View All <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customerFavorites.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Get notified about new template releases, special offers, and design trends.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Input 
              type="email" 
              placeholder="Enter your email"
              className="bg-white text-black"
            />
            <Button variant="secondary" className="px-8">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// Category Section Component
function CategorySection({ category }: { category: Category }) {
  const { data: templates = [] } = useQuery<TemplateWithExtras[]>({
    queryKey: [`/api/templates/category/${category.id}`],
    enabled: !!category.id,
  });

  if (templates.length === 0) return null;

  return (
    <section className="py-16 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Tag className="w-6 h-6 text-primary" />
            <h2 className="text-3xl font-bold">{category.name} Templates</h2>
          </div>
          <Link href={`/templates?category=${category.id}`}>
            <Button variant="ghost" className="flex items-center gap-2">
              View All <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      </div>
    </section>
  );
}