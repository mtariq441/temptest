import { useState, useEffect } from "react";
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
  Crown,
  Sparkles,
  X,
  Home,
  Grid3X3,
  Zap,
} from "lucide-react";

export default function Header() {
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Get cart count from localStorage
  const [cartCount, setCartCount] = useState(0);
  
  useEffect(() => {
    const updateCartCount = () => {
      const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartCount(cartItems.length);
    };
    
    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    return () => window.removeEventListener('storage', updateCartCount);
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/templates?search=${encodeURIComponent(searchQuery)}`;
      setShowMobileMenu(false);
    }
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'glass-card backdrop-blur-2xl bg-black/20 shadow-xl shadow-black/20' 
          : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-20 lg:h-24">
            
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center space-x-3 cursor-pointer group" data-testid="link-home">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-all duration-300">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-black text-white group-hover:text-violet-300 transition-colors duration-300">
                    TemplateHub
                  </h1>
                  <p className="text-xs text-white/60 -mt-1 hidden sm:block">Premium Templates</p>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link href="/">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 cursor-pointer group" data-testid="link-home-nav">
                  <Home className="w-4 h-4 group-hover:text-violet-300 transition-colors" />
                  <span className="font-medium">Home</span>
                </div>
              </Link>
              <Link href="/templates">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 cursor-pointer group" data-testid="link-templates">
                  <Grid3X3 className="w-4 h-4 group-hover:text-violet-300 transition-colors" />
                  <span className="font-medium">Templates</span>
                </div>
              </Link>
            </nav>

            {/* Desktop Search */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300 outline-none"
                />
              </div>
            </form>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              
              {/* Cart Button */}
              <Button
                onClick={() => setShowCart(true)}
                className="relative btn-ghost-premium"
                data-testid="button-cart"
              >
                <ShoppingCartIcon className="w-5 h-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 text-white text-xs flex items-center justify-center p-0 animate-pulse">
                    {cartCount}
                  </Badge>
                )}
              </Button>

              {/* User Menu */}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="btn-ghost-premium" data-testid="button-user-menu">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.profileImageUrl || ""} />
                        <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white font-bold">
                          {user?.firstName?.[0] || user?.email?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:block ml-2 font-medium">
                        {user?.firstName || "Profile"}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="glass-card border-white/20 mt-2" align="end">
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-sm font-medium text-white">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-white/60">{user?.email}</p>
                    </div>
                    
                    <Link href="/my-purchases">
                      <DropdownMenuItem className="text-white hover:bg-white/10 cursor-pointer">
                        <Package className="mr-2 h-4 w-4" />
                        My Purchases
                      </DropdownMenuItem>
                    </Link>
                    
                    {user?.isAdmin && (
                      <Link href="/admin">
                        <DropdownMenuItem className="text-white hover:bg-white/10 cursor-pointer">
                          <Shield className="mr-2 h-4 w-4" />
                          Admin Panel
                        </DropdownMenuItem>
                      </Link>
                    )}
                    
                    <DropdownMenuSeparator className="bg-white/10" />
                    
                    <DropdownMenuItem 
                      onClick={handleLogout} 
                      className="text-red-300 hover:bg-red-500/10 cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/api/login">
                  <Button className="btn-ultra-premium" data-testid="button-login">
                    <Zap className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
              )}

              {/* Mobile Menu Button */}
              <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
                <SheetTrigger asChild>
                  <Button className="lg:hidden btn-ghost-premium" data-testid="button-mobile-menu">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="glass-card border-white/20 p-0">
                  <div className="p-6">
                    {/* Mobile Header */}
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center">
                          <Crown className="w-4 h-4 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Menu</h2>
                      </div>
                      <Button 
                        onClick={() => setShowMobileMenu(false)}
                        className="btn-ghost-premium p-2"
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>

                    {/* Mobile Search */}
                    <form onSubmit={handleSearch} className="mb-8">
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                        <input
                          type="text"
                          placeholder="Search templates..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="input-ultra-premium w-full pl-12"
                        />
                      </div>
                      <Button type="submit" className="btn-ultra-premium w-full mt-3">
                        <Search className="w-4 h-4 mr-2" />
                        Search Templates
                      </Button>
                    </form>

                    {/* Mobile Navigation */}
                    <nav className="space-y-2 mb-8">
                      <Link href="/">
                        <div 
                          className="flex items-center gap-3 px-4 py-3 rounded-xl text-white hover:bg-white/10 transition-all duration-300 cursor-pointer"
                          onClick={() => setShowMobileMenu(false)}
                        >
                          <Home className="w-5 h-5" />
                          <span className="font-medium">Home</span>
                        </div>
                      </Link>
                      
                      <Link href="/templates">
                        <div 
                          className="flex items-center gap-3 px-4 py-3 rounded-xl text-white hover:bg-white/10 transition-all duration-300 cursor-pointer"
                          onClick={() => setShowMobileMenu(false)}
                        >
                          <Grid3X3 className="w-5 h-5" />
                          <span className="font-medium">Templates</span>
                        </div>
                      </Link>
                      
                      {isAuthenticated && (
                        <>
                          <Link href="/my-purchases">
                            <div 
                              className="flex items-center gap-3 px-4 py-3 rounded-xl text-white hover:bg-white/10 transition-all duration-300 cursor-pointer"
                              onClick={() => setShowMobileMenu(false)}
                            >
                              <Package className="w-5 h-5" />
                              <span className="font-medium">My Purchases</span>
                            </div>
                          </Link>
                          
                          {user?.isAdmin && (
                            <Link href="/admin">
                              <div 
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-white hover:bg-white/10 transition-all duration-300 cursor-pointer"
                                onClick={() => setShowMobileMenu(false)}
                              >
                                <Shield className="w-5 h-5" />
                                <span className="font-medium">Admin Panel</span>
                              </div>
                            </Link>
                          )}
                        </>
                      )}
                    </nav>

                    {/* Mobile User Section */}
                    {isAuthenticated ? (
                      <div className="pt-6 border-t border-white/10">
                        <div className="flex items-center gap-3 mb-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user?.profileImageUrl || ""} />
                            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white font-bold">
                              {user?.firstName?.[0] || user?.email?.[0] || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-white font-medium">{user?.firstName} {user?.lastName}</p>
                            <p className="text-white/60 text-sm">{user?.email}</p>
                          </div>
                        </div>
                        <Button 
                          onClick={handleLogout}
                          className="btn-ghost-premium w-full justify-start text-red-300 hover:bg-red-500/10"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </Button>
                      </div>
                    ) : (
                      <div className="pt-6 border-t border-white/10">
                        <Link href="/api/login">
                          <Button 
                            className="btn-ultra-premium w-full"
                            onClick={() => setShowMobileMenu(false)}
                          >
                            <Zap className="w-4 h-4 mr-2" />
                            Sign In
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Add padding to body to account for fixed header */}
      <div className="h-20 lg:h-24"></div>

      {/* Shopping Cart Sidebar */}
      <ShoppingCart open={showCart} onClose={() => setShowCart(false)} />
    </>
  );
}