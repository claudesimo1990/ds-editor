import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin, Building } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border relative">
      {/* Decorative ornaments */}
      <div className="absolute top-4 left-8 memorial-ornament-center" />
      <div className="absolute top-4 right-8 memorial-ornament-center" />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img 
              src="/lovable-uploads/9d4e5b81-dc9c-475a-aa0b-bcfb30b624d0.png" 
              alt="Das Deutschland Echo Logo" 
              className="h-24 w-auto opacity-80"
            />
          </div>
          <p className="text-sm text-muted-foreground font-memorial">
            Trauerportal für Deutschland
          </p>
          
          <div className="flex justify-center space-x-6 text-sm">
            <Link to="/impressum" className="text-muted-foreground hover:text-foreground transition-gentle">
              Impressum
            </Link>
            <Link to="/datenschutz" className="text-muted-foreground hover:text-foreground transition-gentle">
              Datenschutz
            </Link>
          </div>
          
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Das Deutschland Echo. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;