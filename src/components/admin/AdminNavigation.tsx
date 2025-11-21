import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, BarChart3, Users, Heart, FileText, Eye, Clock } from 'lucide-react';

interface AdminNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingCount: number;
}

const AdminNavigation: React.FC<AdminNavigationProps> = ({ activeTab, setActiveTab, pendingCount }) => {
  const tabs = [
    { id: 'dashboard', label: 'Übersicht', icon: BarChart3 },
    { id: 'pending', label: 'Freigaben', icon: Clock, badge: pendingCount },
    { id: 'obituaries', label: 'Traueranzeigen', icon: FileText },
    { id: 'memorials', label: 'Gedenkseiten', icon: Heart },
    { id: 'users', label: 'Benutzer', icon: Users },
  ];

  return (
    <div className="bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4">
        <nav className="flex space-x-1 overflow-x-auto py-2">
          {tabs.map(({ id, label, icon: Icon, badge }) => (
            <Button
              key={id}
              variant={activeTab === id ? "default" : "ghost"}
              onClick={() => setActiveTab(id)}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <Icon className="h-4 w-4" />
              {label}
              {badge && badge > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {badge}
                </Badge>
              )}
            </Button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default AdminNavigation;