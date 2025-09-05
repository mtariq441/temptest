import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TemplateCard from "@/components/TemplateCard";
import SearchFilters from "@/components/SearchFilters";
import { Skeleton } from "@/components/ui/skeleton";

export default function Templates() {
  const [filters, setFilters] = useState({
    search: "",
    categoryId: "",
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
    sortBy: "newest" as const,
  });

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["/api/templates", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          params.append(key, value.toString());
        }
      });
      const response = await fetch(`/api/templates?${params}`);
      return response.json();
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4" data-testid="text-templates-title">
            All Templates
          </h1>
          <p className="text-muted-foreground" data-testid="text-templates-description">
            Browse our collection of premium website templates
          </p>
        </div>

        <SearchFilters
          filters={filters}
          onFiltersChange={setFilters}
        />

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12" data-testid="text-no-templates">
            <i className="fas fa-search text-4xl text-muted-foreground mb-4"></i>
            <h3 className="text-lg font-semibold mb-2">No templates found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or browse all categories
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {templates.map((template: any) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
