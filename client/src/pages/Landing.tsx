import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TemplateCard from "@/components/TemplateCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Star, 
  Search, 
  ArrowRight, 
  Tag, 
  TrendingUp, 
  Clock, 
  Heart, 
  Percent,
  Sparkles,
  Zap,
  Crown,
  Award,
  Mail
} from "lucide-react";
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

      {/* Ultra-Premium Hero Banner */}
      <section className="hero-ultra-gradient py-20 lg:py-32 overflow-hidden relative">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-emerald-500/10"></div>
          <div className="absolute top-20 left-20 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }}></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500/20 to-indigo-500/20 border border-violet-500/20 rounded-full backdrop-blur-sm">
                <Crown className="w-4 h-4 text-violet-300" />
                <span className="text-sm font-medium text-violet-200">World-Class Premium Templates</span>
              </div>
              
              <h1 className="text-ultra-hero text-glow-ultra mb-6 animate-pulse-glow-ultra">
                Premium <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">Template</span>
                <br />
                Marketplace
              </h1>
              
              <p className="text-lg md:text-xl text-white/70 max-w-xl leading-relaxed mb-8">
                Discover professionally crafted templates designed by world-class designers. 
                Modern, responsive designs that convert visitors into customers.
              </p>
              
              {/* Ultra-Premium Search Bar */}
              <form onSubmit={handleSearch} className="search-ultra-premium mb-8">
                <Search className="search-icon" />
                <input
                  type="text"
                  placeholder="Search premium templates, categories, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button type="submit" className="search-button btn-ultra-premium">
                  <Zap className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </form>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/templates">
                  <Button className="btn-ultra-premium text-base px-8 py-4">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Browse Templates
                  </Button>
                </Link>
                <Button className="btn-ghost-premium text-base px-8 py-4">
                  <Award className="w-5 h-5 mr-2" />
                  See Pricing
                </Button>
              </div>
            </div>

            {/* Hero Template Showcase */}
            {heroTemplate && (
              <div className="relative hidden lg:block">
                <div className="template-card-ultra animate-pulse-glow-ultra float-element">
                  <div className="image-container">
                    <img 
                      src={heroTemplate.previewImages?.[0] || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop"}
                      alt={heroTemplate.name}
                      className="w-full h-80 object-cover"
                    />
                    <div className="overlay"></div>
                    <div className="absolute top-6 right-6">
                      <span className="badge-price-ultra">
                        ${heroTemplate.price}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-3 text-white">{heroTemplate.name}</h3>
                    <p className="text-white/70 text-sm mb-4 leading-relaxed">{heroTemplate.shortDescription}</p>
                    <div className="template-actions">
                      <Button className="btn-ghost-premium flex-1">
                        View Demo
                      </Button>
                      <Button className="btn-ultra-premium flex-1">
                        Buy Now
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Templates Section */}
      {featuredTemplates.length > 0 && (
        <section className="py-20 section-premium">
          <div className="container mx-auto px-6 relative z-10">
            <div className="flex justify-between items-center mb-12">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500/20 to-indigo-500/20 rounded-xl flex items-center justify-center border border-violet-500/20">
                  <Star className="w-6 h-6 text-violet-300 fill-current" />
                </div>
                <div>
                  <h2 className="text-4xl font-bold text-white mb-2">Featured Templates</h2>
                  <p className="text-white/60">Hand-picked premium designs</p>
                </div>
              </div>
              <Link href="/templates?featured=true">
                <Button className="btn-secondary-premium">
                  View All <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="grid-ultra-responsive">
              {featuredTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Best Selling Templates Section */}
      {bestSellingTemplates.length > 0 && (
        <section className="py-20 section-premium">
          <div className="container mx-auto px-6 relative z-10">
            <div className="flex justify-between items-center mb-12">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-xl flex items-center justify-center border border-emerald-500/20">
                  <TrendingUp className="w-6 h-6 text-emerald-300" />
                </div>
                <div>
                  <h2 className="text-4xl font-bold text-white mb-2">Best Selling Templates</h2>
                  <p className="text-white/60">Most popular among creators</p>
                </div>
              </div>
              <Link href="/templates?sort=popular">
                <Button className="btn-secondary-premium">
                  View All <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="grid-ultra-responsive">
              {bestSellingTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Templates Section */}
      {latestTemplates.length > 0 && (
        <section className="py-20 section-premium">
          <div className="container mx-auto px-6 relative z-10">
            <div className="flex justify-between items-center mb-12">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center border border-blue-500/20">
                  <Clock className="w-6 h-6 text-blue-300" />
                </div>
                <div>
                  <h2 className="text-4xl font-bold text-white mb-2">Latest Templates</h2>
                  <p className="text-white/60">Fresh designs just released</p>
                </div>
              </div>
              <Link href="/templates?sort=newest">
                <Button className="btn-secondary-premium">
                  View All <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="grid-ultra-responsive">
              {latestTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Category Sections */}
      {categories.map((category, index) => (
        <CategorySection key={category.id} category={category} index={index} />
      ))}

      {/* Trending Templates Section */}
      {trendingTemplates.length > 0 && (
        <section className="py-20 section-premium">
          <div className="container mx-auto px-6 relative z-10">
            <div className="flex justify-between items-center mb-12">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center border border-purple-500/20">
                  <TrendingUp className="w-6 h-6 text-purple-300" />
                </div>
                <div>
                  <h2 className="text-4xl font-bold text-white mb-2">Trending Templates</h2>
                  <p className="text-white/60">What's hot right now</p>
                </div>
              </div>
              <Link href="/templates?sort=trending">
                <Button className="btn-secondary-premium">
                  View All <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="grid-ultra-responsive">
              {trendingTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Special Offers Section */}
      {discountTemplates.length > 0 && (
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-orange-500/5 to-yellow-500/10"></div>
          <div className="container mx-auto px-6 relative z-10">
            <div className="flex justify-between items-center mb-12">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-xl flex items-center justify-center border border-red-500/20">
                  <Percent className="w-6 h-6 text-red-300" />
                </div>
                <div>
                  <h2 className="text-4xl font-bold text-white mb-2">Special Offers</h2>
                  <p className="text-white/60">Limited time deals</p>
                </div>
              </div>
              <Link href="/templates?discount=true">
                <Button className="btn-secondary-premium">
                  View All <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="grid-ultra-responsive">
              {discountTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Customer Favorites Section */}
      {customerFavorites.length > 0 && (
        <section className="py-20 section-premium">
          <div className="container mx-auto px-6 relative z-10">
            <div className="flex justify-between items-center mb-12">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-rose-500/20 to-pink-500/20 rounded-xl flex items-center justify-center border border-rose-500/20">
                  <Heart className="w-6 h-6 text-rose-300 fill-current" />
                </div>
                <div>
                  <h2 className="text-4xl font-bold text-white mb-2">Customer Favorites</h2>
                  <p className="text-white/60">Highest rated templates</p>
                </div>
              </div>
              <Link href="/templates?sort=rating">
                <Button className="btn-secondary-premium">
                  View All <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="grid-ultra-responsive">
              {customerFavorites.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Premium Newsletter Section */}
      <section className="newsletter-premium py-20">
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500/20 to-indigo-500/20 rounded-2xl flex items-center justify-center border border-violet-500/20 mx-auto mb-6">
              <Mail className="w-8 h-8 text-violet-300" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-4 text-glow">Stay Updated</h2>
            <p className="text-xl text-white/70 mb-8 leading-relaxed">
              Get notified about new template releases, exclusive offers, and design trends from world-class creators.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input 
                type="email" 
                placeholder="Enter your email"
                className="input-premium flex-1"
              />
              <Button type="submit" className="btn-premium">
                <Sparkles className="w-4 h-4 mr-2" />
                Subscribe
              </Button>
            </form>
            <p className="text-white/50 text-sm mt-4">
              Join 50,000+ designers and developers
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// Premium Category Section Component
function CategorySection({ category, index }: { category: Category; index: number }) {
  const { data: templates = [] } = useQuery<TemplateWithExtras[]>({
    queryKey: [`/api/templates/category/${category.id}`],
    enabled: !!category.id,
  });

  if (templates.length === 0) return null;

  const isEven = index % 2 === 0;

  return (
    <section className={`py-20 section-premium ${!isEven ? 'bg-white/[0.02]' : ''}`}>
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            <div className="category-icon-premium">
              <Tag className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-4xl font-bold text-white mb-2">{category.name}</h2>
              <p className="text-white/60">{category.description}</p>
            </div>
          </div>
          <Link href={`/templates?category=${category.id}`}>
            <Button className="btn-secondary-premium">
              View All <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {templates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      </div>
    </section>
  );
}