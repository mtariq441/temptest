import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import ShoppingCart from "./ShoppingCart";
import { 
  Search, 
  ShoppingCart as ShoppingCartIcon, 
  Menu, 
  User, 
  Settings, 
  LogOut,
  Shield,
  Package,
} from "lucide-react";

export default function Header() {
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Get cart count from localStorage
  const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
  const cartCount = cartItems.length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/templates?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <>
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/">
                <h1 className="text-2xl font-bold text-primary cursor-pointer" data-testid="link-home">
                  <i className="fas fa-code mr-2"></i>TemplateHub
                </h1>
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link href="/">
                  <a className="text-foreground hover:text-primary transition-colors" data-testid="link-home-nav">
                    Home
                  </a>
                </Link>
                <Link href="/templates">
                  <a className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-templates">
                    Templates
                  </a>
                </Link>
                <Link href="/categories">
                  <a className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-categories">
                    Categories
                  </a>
                </Link>
                <Link href="/about">
                  <a className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-about">
                    About
                  </a>
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="hidden md:flex items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-64 bg-muted border-0"
                    data-testid="input-search"
                  />
                </div>
              </form>
              
              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowCart(true)}
                className="relative"
                data-testid="button-cart"
              >
                <ShoppingCartIcon className="w-5 h-5" />
                {cartCount > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 w-5 text-xs flex items-center justify-center p-0"
                    data-testid="badge-cart-count"
                  >
                    {cartCount}
                  </Badge>
                )}
              </Button>
              
              {/* User Menu */}
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="p-0" data-testid="button-user-menu">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.profileImageUrl} />
                        <AvatarFallback data-testid="text-user-initials">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center space-x-2 p-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.profileImageUrl} />
                        <AvatarFallback>
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium" data-testid="text-user-name">
                          {user.firstName} {user.lastName}
                        </span>
                        <span className="text-xs text-muted-foreground" data-testid="text-user-email">
                          {user.email}
                        </span>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    
                    <Link href="/my-purchases">
                      <DropdownMenuItem data-testid="link-purchases">
                        <Package className="w-4 h-4 mr-2" />
                        My Purchases
                      </DropdownMenuItem>
                    </Link>
                    
                    <DropdownMenuItem data-testid="link-profile">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem data-testid="link-settings">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    
                    {user.isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <Link href="/admin">
                          <DropdownMenuItem data-testid="link-admin">
                            <Shield className="w-4 h-4 mr-2" />
                            Admin Dashboard
                          </DropdownMenuItem>
                        </Link>
                      </>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} data-testid="button-logout">
                      <LogOut className="w-4 h-4 mr-2" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden md:flex items-center space-x-2">
                  <Button asChild data-testid="button-login">
                    <a href="/api/login">
                      <User className="w-4 h-4 mr-2" />
                      Login
                    </a>
                  </Button>
                </div>
              )}
              
              {/* Mobile Menu Toggle */}
              <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden" data-testid="button-mobile-menu">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72">
                  <div className="flex flex-col space-y-4 py-4">
                    {/* Mobile Search */}
                    <form onSubmit={handleSearch}>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          type="text"
                          placeholder="Search templates..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 bg-muted border-0"
                          data-testid="input-mobile-search"
                        />
                      </div>
                    </form>
                    
                    {/* Mobile Nav Links */}
                    <nav className="flex flex-col space-y-2">
                      <Link href="/">
                        <a className="py-2 text-foreground hover:text-primary" data-testid="link-mobile-home">
                          Home
                        </a>
                      </Link>
                      <Link href="/templates">
                        <a className="py-2 text-muted-foreground hover:text-primary" data-testid="link-mobile-templates">
                          Templates
                        </a>
                      </Link>
                      <Link href="/categories">
                        <a className="py-2 text-muted-foreground hover:text-primary" data-testid="link-mobile-categories">
                          Categories
                        </a>
                      </Link>
                      <Link href="/about">
                        <a className="py-2 text-muted-foreground hover:text-primary" data-testid="link-mobile-about">
                          About
                        </a>
                      </Link>
                    </nav>
                    
                    {/* Mobile Auth */}
                    {!isAuthenticated && (
                      <div className="flex space-x-2 pt-2">
                        <Button className="flex-1" asChild data-testid="button-mobile-login">
                          <a href="/api/login">Login</a>
                        </Button>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Shopping Cart Sidebar */}
      <ShoppingCart open={showCart} onClose={() => setShowCart(false)} />
    </>
  );
}
