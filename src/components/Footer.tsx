import { Facebook, Instagram, Twitter, Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const footerSections = {
    shop: {
      title: "Shop",
      links: [
        { name: "All Frames", href: "/shop" },
        { name: "Wall Frames", href: "/shop/wall-frames" },
        { name: "Tabletop Frames", href: "/shop/tabletop-frames" },
        { name: "Gallery Sets", href: "/shop/gallery-sets" },
        { name: "Custom Frames", href: "/custom-builder" },
        { name: "Bundles", href: "/bundles" },
      ],
    },
    help: {
      title: "Help & Support",
      links: [
        { name: "Size Guide", href: "/size-guide" },
        { name: "Shipping Info", href: "/shipping" },
        { name: "Returns & Exchanges", href: "/returns" },
        { name: "Care Instructions", href: "/care" },
        { name: "Contact Us", href: "/contact" },
        { name: "FAQ", href: "/faq" },
      ],
    },
    company: {
      title: "Company",
      links: [
        { name: "About Us", href: "/about" },
        { name: "Our Story", href: "/story" },
        { name: "Craftsmanship", href: "/craftsmanship" },
        { name: "Reviews", href: "/reviews" },
        { name: "Press", href: "/press" },
        { name: "Careers", href: "/careers" },
      ],
    },
  };

  return (
    <footer className="bg-rich-black text-white">
      {/* Main Footer Content */}
      <div className="container-wide py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">F</span>
              </div>
              <span className="font-serif text-xl font-bold">FrameCraft</span>
            </Link>
            
            <p className="text-gray-300 mb-6 leading-relaxed">
              Premium photo frames crafted with attention to detail. 
              Turn your memories into masterpieces with our beautiful collection.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-sm">1-800-FRAMES-1</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-sm">hello@framecraft.com</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerSections).map(([key, section]) => (
            <div key={key}>
              <h3 className="font-serif font-bold text-lg mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-300 hover:text-primary transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="font-serif font-bold text-xl mb-2">Stay Connected</h3>
              <p className="text-gray-300">Get styling tips, new arrivals, and exclusive offers.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-primary focus:outline-none"
              />
              <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Social Media & Trust Badges */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Social Media */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-300">Follow us:</span>
              <div className="flex gap-3">
                <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-primary transition-colors">
                  <Facebook className="h-4 w-4" />
                </a>
                <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-primary transition-colors">
                  <Instagram className="h-4 w-4" />
                </a>
                <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-primary transition-colors">
                  <Twitter className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-lg font-bold">30-Day</div>
                <div className="text-xs text-gray-400">Returns</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">Free</div>
                <div className="text-xs text-gray-400">Shipping</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">Secure</div>
                <div className="text-xs text-gray-400">Checkout</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 bg-gray-900">
        <div className="container-wide py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © 2024 FrameCraft. All rights reserved.
            </p>
            
            <div className="flex gap-6">
              <Link to="/privacy" className="text-sm text-gray-400 hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm text-gray-400 hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-sm text-gray-400 hover:text-primary transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;