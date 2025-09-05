import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search, X } from "lucide-react";

interface SearchFiltersProps {
  filters: {
    search: string;
    categoryId: string;
    minPrice: number | undefined;
    maxPrice: number | undefined;
    sortBy: 'price_asc' | 'price_desc' | 'newest' | 'popular' | 'rating';
  };
  onFiltersChange: (filters: any) => void;
}

export default function SearchFilters({ filters, onFiltersChange }: SearchFiltersProps) {
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const updateFilter = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      categoryId: "",
      minPrice: undefined,
      maxPrice: undefined,
      sortBy: "newest" as const,
    });
  };

  const hasActiveFilters = filters.search || filters.categoryId || filters.minPrice || filters.maxPrice || filters.sortBy !== 'newest';

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search templates..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="pl-9 bg-muted border-0"
                data-testid="input-search-templates"
              />
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-4 lg:flex-shrink-0">
            {/* Category Filter */}
            <Select 
              value={filters.categoryId} 
              onValueChange={(value) => updateFilter('categoryId', value)}
            >
              <SelectTrigger className="w-full sm:w-48 bg-muted border-0" data-testid="select-category">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map((category: any) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Price Range Filter */}
            <Select 
              value={filters.minPrice && filters.maxPrice ? `${filters.minPrice}-${filters.maxPrice}` : ""} 
              onValueChange={(value) => {
                if (value === "") {
                  updateFilter('minPrice', undefined);
                  updateFilter('maxPrice', undefined);
                } else {
                  const [min, max] = value.split('-').map(Number);
                  updateFilter('minPrice', min);
                  updateFilter('maxPrice', max);
                }
              }}
            >
              <SelectTrigger className="w-full sm:w-48 bg-muted border-0" data-testid="select-price-range">
                <SelectValue placeholder="Price: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Price: All</SelectItem>
                <SelectItem value="0-25">Under $25</SelectItem>
                <SelectItem value="25-50">$25 - $50</SelectItem>
                <SelectItem value="50-100">$50 - $100</SelectItem>
                <SelectItem value="100-1000">Over $100</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Filter */}
            <Select 
              value={filters.sortBy} 
              onValueChange={(value: any) => updateFilter('sortBy', value)}
            >
              <SelectTrigger className="w-full sm:w-48 bg-muted border-0" data-testid="select-sort">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="w-full sm:w-auto"
                data-testid="button-clear-filters"
              >
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
            {filters.search && (
              <div className="flex items-center bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                Search: "{filters.search}"
                <button 
                  onClick={() => updateFilter('search', '')}
                  className="ml-2 hover:text-primary/70"
                  data-testid="clear-search-filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            
            {filters.categoryId && (
              <div className="flex items-center bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                Category: {categories.find((c: any) => c.id === filters.categoryId)?.name}
                <button 
                  onClick={() => updateFilter('categoryId', '')}
                  className="ml-2 hover:text-primary/70"
                  data-testid="clear-category-filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            
            {(filters.minPrice || filters.maxPrice) && (
              <div className="flex items-center bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                Price: ${filters.minPrice || 0} - ${filters.maxPrice || 1000}
                <button 
                  onClick={() => {
                    updateFilter('minPrice', undefined);
                    updateFilter('maxPrice', undefined);
                  }}
                  className="ml-2 hover:text-primary/70"
                  data-testid="clear-price-filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
