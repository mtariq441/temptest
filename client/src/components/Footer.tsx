import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border py-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-primary mb-4">
              <i className="fas fa-code mr-2"></i>TemplateHub
            </h3>
            <p className="text-muted-foreground mb-4" data-testid="text-footer-description">
              Premium website templates for professionals and businesses. Create stunning websites with our handcrafted designs.
            </p>
            <div className="flex space-x-3">
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="link-twitter"
              >
                <i className="fab fa-twitter"></i>
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="link-facebook"
              >
                <i className="fab fa-facebook"></i>
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="link-instagram"
              >
                <i className="fab fa-instagram"></i>
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="link-linkedin"
              >
                <i className="fab fa-linkedin"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Templates</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/templates?category=business">
                  <a className="hover:text-primary transition-colors" data-testid="link-business-templates">
                    Business
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/templates?category=ecommerce">
                  <a className="hover:text-primary transition-colors" data-testid="link-ecommerce-templates">
                    E-commerce
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/templates?category=portfolio">
                  <a className="hover:text-primary transition-colors" data-testid="link-portfolio-templates">
                    Portfolio
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/templates?category=blog">
                  <a className="hover:text-primary transition-colors" data-testid="link-blog-templates">
                    Blog
                  </a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors" data-testid="link-help">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors" data-testid="link-contact">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors" data-testid="link-docs">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors" data-testid="link-faq">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors" data-testid="link-about">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors" data-testid="link-terms">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors" data-testid="link-privacy">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors" data-testid="link-careers">
                  Careers
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <hr className="border-border my-8" />
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm" data-testid="text-copyright">
            © 2024 TemplateHub. All rights reserved.
          </p>
          <p className="text-muted-foreground text-sm mt-2 md:mt-0" data-testid="text-made-with-love">
            Made with <i className="fas fa-heart text-red-500 mx-1"></i> for developers worldwide
          </p>
        </div>
      </div>
    </footer>
  );
}
