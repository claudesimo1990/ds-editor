import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { Shield, Users, Heart, Eye, Calendar, Activity } from 'lucide-react';
import AdminNavigation from '@/components/admin/AdminNavigation';
import PendingApprovals from '@/components/admin/PendingApprovals';
import ObituariesManagement from '@/components/admin/ObituariesManagement';
import MemorialsManagement from '@/components/admin/MemorialsManagement';
import UsersManagement from '@/components/admin/UsersManagement';

interface AdminStats {
  totalObituaries: number;
  publishedObituaries: number;
  totalMemorials: number;
  totalUsers: number;
  totalViews: number;
  pendingCount: number;
  recentObituaries: Obituary[];
}

interface Obituary {
  id: string;
  deceased_first_name: string;
  deceased_last_name: string;
  birth_date: string;
  death_date: string;
  is_published: boolean;
  views_count: number;
  created_at: string;
  user_id: string;
}

const AdminDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<AdminStats>({
    totalObituaries: 0,
    publishedObituaries: 0,
    totalMemorials: 0,
    totalUsers: 0,
    totalViews: 0,
    pendingCount: 0,
    recentObituaries: []
  });
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (!session) {
          navigate('/auth');
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      checkAdminStatus();
    }
  }, [user]);

  const checkAdminStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('dde_admin_users')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      const adminAccess = !!data;
      
      setIsAdmin(adminAccess);
      
      if (!adminAccess) {
        toast({
          title: "Zugriff verweigert",
          description: "Sie haben keine Administratorrechte für das Gedenkportal.",
          variant: "destructive",
        });
        navigate('/user-bereich');
        return;
      }

      fetchAdminStats();
    } catch (error: any) {
      toast({
        title: "Fehler beim Prüfen der Berechtigung",
        description: error.message,
        variant: "destructive",
      });
      navigate('/user-bereich');
    }
  };

  const fetchAdminStats = async () => {
    try {
      // Fetch obituaries statistics
      const { data: obituaries, error: obituariesError } = await supabase
        .from('dde_obituaries')
        .select('*')
        .order('created_at', { ascending: false });

      if (obituariesError) throw obituariesError;

      // Fetch memorial pages statistics
      const { data: memorials, error: memorialsError } = await supabase
        .from('dde_memorial_pages')
        .select('*');

      if (memorialsError) throw memorialsError;

      // Count pending items
      const pendingObituaries = obituaries?.filter(o => !o.is_published).length || 0;
      const pendingMemorials = memorials?.filter(m => m.moderation_status === 'pending').length || 0;

      // Get unique user count from both tables
      const obituaryUsers = new Set(obituaries?.map(o => o.user_id).filter(Boolean));
      const memorialUsers = new Set(memorials?.map(m => m.user_id).filter(Boolean));
      const allUsers = new Set([...obituaryUsers, ...memorialUsers]);

      const totalObituaries = obituaries?.length || 0;
      const publishedObituaries = obituaries?.filter(o => o.is_published).length || 0;
      const totalMemorials = memorials?.length || 0;
      const totalViews = (obituaries?.reduce((sum, o) => sum + (o.views_count || 0), 0) || 0) +
                        (memorials?.reduce((sum, m) => sum + (m.visitor_count || 0), 0) || 0);
      const recentObituaries = obituaries?.slice(0, 5) || [];
      const pendingCount = pendingObituaries + pendingMemorials;

      setStats({
        totalObituaries,
        publishedObituaries,
        totalMemorials,
        totalUsers: allUsers.size,
        totalViews,
        pendingCount,
        recentObituaries
      });
    } catch (error: any) {
      toast({
        title: "Fehler beim Laden der Statistiken",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Lade Admin-Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will be redirected
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Traueranzeigen</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalObituaries}</div>
            <p className="text-xs text-muted-foreground">
              {stats.publishedObituaries} veröffentlicht
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gedenkseiten</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMemorials}</div>
            <p className="text-xs text-muted-foreground">Gedenkseiten erstellt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Benutzer</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registrierte Nutzer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Besucher</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews}</div>
            <p className="text-xs text-muted-foreground">Gesamte Aufrufe</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Neueste Traueranzeigen</CardTitle>
            <CardDescription>
              Die 5 zuletzt erstellten Traueranzeigen
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentObituaries.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Noch keine Traueranzeigen vorhanden
              </p>
            ) : (
              <div className="space-y-4">
                {stats.recentObituaries.map((obituary) => (
                  <div key={obituary.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">
                        {obituary.deceased_first_name} {obituary.deceased_last_name} ✝
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(obituary.birth_date)} - {formatDate(obituary.death_date)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Erstellt: {formatDate(obituary.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={obituary.is_published ? "default" : "secondary"}>
                        {obituary.is_published ? "Veröffentlicht" : "Entwurf"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {obituary.views_count || 0} Aufrufe
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schnellaktionen</CardTitle>
            <CardDescription>
              Wichtige Verwaltungsfunktionen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => setActiveTab('pending')}
            >
              <Activity className="mr-2 h-4 w-4" />
              Freigaben verwalten
              {stats.pendingCount > 0 && (
                <Badge variant="destructive" className="ml-auto">
                  {stats.pendingCount}
                </Badge>
              )}
            </Button>
            
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => navigate('/gedenkportal')}
            >
              <Heart className="mr-2 h-4 w-4" />
              Neue Traueranzeige
            </Button>
            
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => navigate('/memorial-editor')}
            >
              <Heart className="mr-2 h-4 w-4" />
              Neue Gedenkseite
            </Button>
            
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => window.open('https://supabase.com/dashboard/project/ytuumwgmdnqcmkvrtsll', '_blank')}
            >
              <Shield className="mr-2 h-4 w-4" />
              Supabase Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'pending':
        return <PendingApprovals />;
      case 'obituaries':
        return <ObituariesManagement />;
      case 'memorials':
        return <MemorialsManagement />;
      case 'users':
        return <UsersManagement />;
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <header className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-serif text-foreground">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Willkommen, {user?.user_metadata?.first_name || user?.email}
                  <Badge variant="secondary" className="ml-2">Administrator</Badge>
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/user-bereich')}>
                User-Bereich
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                Abmelden
              </Button>
            </div>
          </div>
        </div>
      </header>

      <AdminNavigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        pendingCount={stats.pendingCount}
      />

      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;