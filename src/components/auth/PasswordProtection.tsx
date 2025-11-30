import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';

interface PasswordProtectionProps {
  children: React.ReactNode;
}

const PasswordProtection: React.FC<PasswordProtectionProps> = ({ children }) => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Routes accessibles sans authentification
  const publicRoutes = ['/gedenkseite/share/'];

  useEffect(() => {
    // Vérifier si la route actuelle est publique
    const isPublicRoute = publicRoutes.some(route => location.pathname.startsWith(route));
    
    if (isPublicRoute) {
      setIsAuthenticated(true);
      return;
    }

    const savedAuth = localStorage.getItem('memorial-auth');
    if (savedAuth === 'authenticated') {
      setIsAuthenticated(true);
    }
  }, [location.pathname]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'milka') {
      setIsAuthenticated(true);
      localStorage.setItem('memorial-auth', 'authenticated');
      setError('');
    } else {
      setError('Falsches Passwort');
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-memorial-cream via-memorial-ivory to-memorial-pearl flex items-center justify-center p-4">
      {/* Decorative ornaments */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="memorial-ornament-corner top-4 left-4" />
        <div className="memorial-ornament-corner top-4 right-4 rotate-90" />
        <div className="memorial-ornament-corner bottom-4 left-4 rotate-270" />
        <div className="memorial-ornament-corner bottom-4 right-4 rotate-180" />
        <div className="memorial-ornament-flourish top-1/4 left-8" />
        <div className="memorial-ornament-flourish bottom-1/4 right-8 rotate-180" />
      </div>

      <Card className="w-full max-w-md shadow-memorial-soft border-memorial-gold/20">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-memorial-gold/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-memorial-gold" />
          </div>
          <CardTitle className="text-2xl font-memorial text-memorial-charcoal">
            Zugang geschützt
          </CardTitle>
          <CardDescription className="text-memorial-slate">
            Bitte geben Sie das Passwort ein, um fortzufahren
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Passwort eingeben"
                className="text-center border-memorial-gold/30 focus:border-memorial-gold"
                autoFocus
              />
              {error && (
                <p className="text-destructive text-sm mt-2 text-center">{error}</p>
              )}
            </div>
            <Button 
              type="submit" 
              className="w-full bg-memorial-gold hover:bg-memorial-gold/90 text-memorial-cream"
            >
              Anmelden
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordProtection;