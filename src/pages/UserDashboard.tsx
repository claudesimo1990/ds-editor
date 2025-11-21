import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PaymentSuccessHandler } from '@/components/PaymentSuccessHandler';
import { ObituaryManagementDialog } from '@/components/obituary/ObituaryManagementDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { 
  Heart, Plus, Eye, Edit, Calendar, User as UserIcon, FileText, Trash2, 
  ExternalLink, BarChart3, Clock, CheckCircle, AlertCircle, Flame,
  TrendingUp, Star, Settings, LogOut, Bell, Search, Filter, SortDesc,
  Copy, Share, Download, Archive, RefreshCw, ChevronDown, Home, CreditCard
} from 'lucide-react';

interface Obituary {
  id: string;
  deceased_first_name: string;
  deceased_last_name: string;
  birth_date: string;
  death_date: string;
  is_published: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
  photo_url?: string;
  is_deleted: boolean;
  published_until?: string;
  published_duration_days?: number;
  payment_status: string;
}

interface MemorialPage {
  id: string;
  deceased_first_name: string;
  deceased_last_name: string;
  birth_date: string;
  death_date: string;
  is_published: boolean;
  visitor_count: number;
  created_at: string;
  updated_at: string;
  is_moderated: boolean;
  main_photo_url?: string;
  is_deleted: boolean;
}

interface CandleStats {
  count: number;
  recent: number;
}

interface Profile {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  phone?: string;
  date_of_birth?: string;
  street_address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  preferred_contact_method?: string;
  newsletter_subscription?: boolean;
  marketing_emails?: boolean;
  data_processing_consent?: boolean;
  profile_visibility?: string;
  account_status?: string;
  email_verified?: boolean;
  phone_verified?: boolean;
  language?: string;
  timezone?: string;
  notifications_enabled?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  currency: string;
  status: string;
  payment_status: string;
  created_at: string;
  items: any; // Changed from any[] to any to match Json type from Supabase
}

interface PaymentMethod {
  id: string;
  type: string;
  provider?: string;
  last_four_digits?: string;
  card_brand?: string;
  is_default: boolean;
  is_active: boolean;
}

const UserDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [obituaries, setObituaries] = useState<Obituary[]>([]);
  const [memorialPages, setMemorialPages] = useState<MemorialPage[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [candleStats, setCandleStats] = useState<CandleStats>({ count: 0, recent: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'views'>('date');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Partial<Profile>>({});
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedObituary, setSelectedObituary] = useState<Obituary | null>(null);
  const [managementDialogOpen, setManagementDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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
      fetchData();
      fetchProfile();
      fetchOrders();
      fetchPaymentMethods();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('dde_user_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setProfile(data || null);
      setEditingProfile(data || {});
    } catch (error: any) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('dde_orders')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('dde_payment_methods')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .order('is_default', { ascending: false });

      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (error: any) {
      console.error('Error fetching payment methods:', error);
    }
  };

  const fetchData = async () => {
    try {
      const [obituariesResult, memorialPagesResult, candlesResult] = await Promise.all([
        supabase
          .from('dde_obituaries')
          .select('*')
          .eq('user_id', user?.id)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false }),
        supabase
          .from('dde_memorial_pages')
          .select('*')
          .eq('user_id', user?.id)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false }),
        supabase
          .from('dde_candles')
          .select('*')
          .in('obituary_id', obituaries.map(o => o.id))
          .eq('is_active', true)
      ]);

      if (obituariesResult.error) throw obituariesResult.error;
      if (memorialPagesResult.error) throw memorialPagesResult.error;

      setObituaries(obituariesResult.data || []);
      setMemorialPages(memorialPagesResult.data || []);

      // Calculate candle statistics
      const candles = candlesResult.data || [];
      const recentCandles = candles.filter(candle => 
        new Date(candle.lit_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      );
      setCandleStats({ count: candles.length, recent: recentCandles.length });

    } catch (error: any) {
      toast({
        title: "Fehler beim Laden",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteObituary = async (id: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diese Traueranzeige löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.')) return;
    
    try {
      const { error } = await supabase
        .from('dde_obituaries')
        .update({ 
          is_deleted: true, 
          deleted_at: new Date().toISOString(),
          is_published: false 
        })
        .eq('id', id);

      if (error) throw error;

      setObituaries(prev => prev.filter(o => o.id !== id));
      toast({
        title: "Traueranzeige gelöscht",
        description: "Die Traueranzeige wurde erfolgreich gelöscht.",
      });
    } catch (error: any) {
      toast({
        title: "Fehler beim Löschen",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteMemorialPage = async (id: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diese Gedenkseite löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.')) return;
    
    try {
      const { error } = await supabase
        .from('dde_memorial_pages')
        .update({ 
          is_deleted: true, 
          deleted_at: new Date().toISOString(),
          is_published: false 
        })
        .eq('id', id);

      if (error) throw error;

      setMemorialPages(prev => prev.filter(m => m.id !== id));
      toast({
        title: "Gedenkseite gelöscht",
        description: "Die Gedenkseite wurde erfolgreich gelöscht.",
      });
    } catch (error: any) {
      toast({
        title: "Fehler beim Löschen",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const updateProfile = async () => {
    try {
      const { error } = await supabase
        .from('dde_user_profiles')
        .upsert({
          user_id: user?.id,
          ...editingProfile,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setProfile({ ...profile, ...editingProfile } as Profile);
      setProfileDialogOpen(false);
      setSettingsDialogOpen(false);
      await fetchProfile(); // Refresh profile data
      toast({
        title: "Profil aktualisiert",
        description: "Ihre Profildaten wurden erfolgreich gespeichert.",
      });
    } catch (error: any) {
      toast({
        title: "Fehler beim Speichern",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const softDeleteAccount = async () => {
    if (!confirm('Sind Sie sicher? Ihr Konto wird deaktiviert und alle Inhalte werden ausgeblendet.')) return;
    
    try {
      // Soft delete by marking content as deleted
      await supabase.from('dde_memorial_pages')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('user_id', user?.id);
      
      await supabase.from('dde_obituaries')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('user_id', user?.id);

      toast({
        title: "Konto deaktiviert",
        description: "Ihr Konto wurde erfolgreich deaktiviert.",
      });
      
      await supabase.auth.signOut();
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const permanentlyDeleteAccount = async () => {
    if (!confirm('WARNUNG: Diese Aktion löscht dauerhaft alle Ihre Daten und kann NICHT rückgängig gemacht werden. Sind Sie absolut sicher?')) return;
    
    try {
      // Permanently delete user data
      await supabase.from('dde_memorial_pages')
        .delete()
        .eq('user_id', user?.id);
      
      await supabase.from('dde_obituaries')
        .delete()
        .eq('user_id', user?.id);
      
      await supabase.from('dde_user_profiles')
        .delete()
        .eq('user_id', user?.id);

      toast({
        title: "Konto gelöscht",
        description: "Ihr Konto und alle Daten wurden dauerhaft gelöscht.",
      });
      
      await supabase.auth.signOut();
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const copyShareLink = (type: 'obituary' | 'memorial', id: string) => {
    const url = `${window.location.origin}/${type === 'obituary' ? 'traueranzeige' : 'gedenkseite'}/${id}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link kopiert",
      description: "Der Freigabe-Link wurde in die Zwischenablage kopiert.",
    });
  };

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([fetchData(), fetchProfile(), fetchOrders(), fetchPaymentMethods()]);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Heute';
    if (diffDays === 1) return 'Gestern';
    if (diffDays < 7) return `vor ${diffDays} Tagen`;
    if (diffDays < 30) return `vor ${Math.ceil(diffDays / 7)} Wochen`;
    return formatDate(dateString);
  };

  const getStatusBadge = (item: Obituary | MemorialPage) => {
    if (!item.is_published) {
      return <Badge variant="secondary">Entwurf</Badge>;
    }
    
    if ('is_moderated' in item && !item.is_moderated) {
      return <Badge variant="outline" className="border-orange-200 text-orange-700">Warten auf Moderation</Badge>;
    }
    
    return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Veröffentlicht</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="memorial-page-ornament animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground font-elegant">Lade Ihren Bereich...</p>
        </div>
      </div>
    );
  }

  const totalViews = obituaries.reduce((sum, o) => sum + (o.views_count || 0), 0) + 
                   memorialPages.reduce((sum, m) => sum + (m.visitor_count || 0), 0);
  const publishedCount = obituaries.filter(o => o.is_published).length + 
                        memorialPages.filter(m => m.is_published).length;

  // Filter and sort functions
  const filterItems = <T extends Obituary | MemorialPage>(items: T[]) => {
    let filtered = items;
    
    if (searchTerm) {
      filtered = filtered.filter(item => 
        `${item.deceased_first_name} ${item.deceased_last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => 
        filterStatus === 'published' ? item.is_published : !item.is_published
      );
    }
    
    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.deceased_first_name} ${a.deceased_last_name}`.localeCompare(`${b.deceased_first_name} ${b.deceased_last_name}`);
        case 'views':
          const aViews = 'views_count' in a ? a.views_count || 0 : a.visitor_count || 0;
          const bViews = 'views_count' in b ? b.views_count || 0 : b.visitor_count || 0;
          return bViews - aViews;
        case 'date':
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });
    
    return filtered;
  };

  const filteredObituaries = filterItems(obituaries);
  const filteredMemorialPages = filterItems(memorialPages);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Enhanced Header */}
      <div className="bg-background/95 backdrop-blur border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/')}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <Home className="w-4 h-4" />
                Zur Startseite
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-4">
                <div className="memorial-page-ornament-small" />
                <div>
                  <h1 className="text-2xl font-memorial font-bold text-foreground">
                    Mein Bereich
                  </h1>
                  <p className="text-sm text-muted-foreground font-elegant">
                    Willkommen zurück, {profile?.first_name || user?.user_metadata?.first_name || 'lieber Nutzer'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshData}
                className="gap-2"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Aktualisieren
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {(profile?.first_name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline">
                      {profile?.first_name || user?.user_metadata?.first_name || 'Nutzer'}
                    </span>
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Mein Konto</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setProfileDialogOpen(true)}>
                    <Settings className="w-4 h-4 mr-2" />
                    Profil bearbeiten
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bell className="w-4 h-4 mr-2" />
                    Benachrichtigungen
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Abmelden
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {/* Enhanced Search and Filter Bar */}
        {(activeTab === 'obituaries' || activeTab === 'memorial-pages') && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Namen suchen..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Filter className="w-4 h-4" />
                        Status: {filterStatus === 'all' ? 'Alle' : filterStatus === 'published' ? 'Veröffentlicht' : 'Entwürfe'}
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                        Alle anzeigen
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterStatus('published')}>
                        Nur veröffentlichte
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterStatus('draft')}>
                        Nur Entwürfe
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <SortDesc className="w-4 h-4" />
                        {sortBy === 'date' ? 'Datum' : sortBy === 'name' ? 'Name' : 'Aufrufe'}
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setSortBy('date')}>
                        Nach Datum
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy('name')}>
                        Nach Name
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy('views')}>
                        Nach Aufrufen
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="overview" className="font-elegant">
              <BarChart3 className="h-4 w-4 mr-2" />
              Übersicht
            </TabsTrigger>
            <TabsTrigger value="obituaries" className="font-elegant">
              <FileText className="h-4 w-4 mr-2" />
              Traueranzeigen ({filteredObituaries.length})
            </TabsTrigger>
            <TabsTrigger value="memorial-pages" className="font-elegant">
              <Heart className="h-4 w-4 mr-2" />
              Gedenkseiten ({filteredMemorialPages.length})
            </TabsTrigger>
            <TabsTrigger value="orders" className="font-elegant">
              <TrendingUp className="h-4 w-4 mr-2" />
              Bestellungen ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="settings" className="font-elegant">
              <Settings className="h-4 w-4 mr-2" />
              Einstellungen
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="hover:shadow-elegant transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-elegant font-medium">Traueranzeigen</CardTitle>
                  <FileText className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-memorial font-bold text-foreground mb-1">
                    {obituaries.length}
                  </div>
                  <p className="text-xs text-muted-foreground font-elegant">
                    {obituaries.filter(o => o.is_published).length} veröffentlicht
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-elegant transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-elegant font-medium">Gedenkseiten</CardTitle>
                  <Heart className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-memorial font-bold text-foreground mb-1">
                    {memorialPages.length}
                  </div>
                  <p className="text-xs text-muted-foreground font-elegant">
                    {memorialPages.filter(m => m.is_published && m.is_moderated).length} aktiv
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-elegant transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-elegant font-medium">Bestellungen</CardTitle>
                  <TrendingUp className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-memorial font-bold text-foreground mb-1">
                    {orders.length}
                  </div>
                  <p className="text-xs text-muted-foreground font-elegant">
                    {orders.filter(o => o.status === 'completed').length} abgeschlossen
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-elegant transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-elegant font-medium">Kerzen</CardTitle>
                  <Flame className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-memorial font-bold text-foreground mb-1">
                    {candleStats.count}
                  </div>
                  <p className="text-xs text-muted-foreground font-elegant">
                    {candleStats.recent} diese Woche
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="hover:shadow-elegant transition-all duration-300 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-memorial font-semibold text-foreground mb-1">
                        Neue Traueranzeige
                      </h3>
                      <p className="text-sm text-muted-foreground font-elegant">
                        Erstellen Sie eine würdevolle Anzeige zum Gedenken
                      </p>
                    </div>
                    <Button asChild className="shadow-elegant">
                      <a href="/traueranzeigen/erstellen">
                        <Plus className="w-4 h-4 mr-2" />
                        Erstellen
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-elegant transition-all duration-300 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Heart className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-memorial font-semibold text-foreground mb-1">
                        Neue Gedenkseite
                      </h3>
                      <p className="text-sm text-muted-foreground font-elegant">
                        Schaffen Sie einen dauerhaften Erinnerungsort
                      </p>
                    </div>
                    <Button asChild variant="outline" className="shadow-elegant">
                      <a href="/gedenkseite/erstellen">
                        <Plus className="w-4 h-4 mr-2" />
                        Erstellen
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="obituaries" className="space-y-6">
            {filteredObituaries.length === 0 && obituaries.length === 0 ? (
              <Card className="border-dashed border-2 border-muted">
                <CardContent className="text-center py-16">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-memorial font-semibold text-foreground mb-2">
                    Noch keine Traueranzeigen
                  </h3>
                  <p className="text-muted-foreground font-elegant mb-6 max-w-md mx-auto">
                    Erstellen Sie Ihre erste Traueranzeige, um einem verstorbenen Menschen zu gedenken 
                    und die Gemeinschaft über den Verlust zu informieren.
                  </p>
                  <Button asChild size="lg" className="shadow-elegant">
                    <a href="/traueranzeigen/erstellen">
                      <Plus className="w-5 h-5 mr-2" />
                      Erste Traueranzeige erstellen
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ) : filteredObituaries.length === 0 ? (
              <Card className="border-dashed border-2 border-muted">
                <CardContent className="text-center py-12">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-memorial font-medium text-foreground mb-2">
                    Keine Ergebnisse gefunden
                  </h3>
                  <p className="text-muted-foreground font-elegant">
                    Versuchen Sie andere Suchbegriffe oder Filter.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredObituaries.map((obituary) => (
                  <Card key={obituary.id} className="hover:shadow-elegant transition-all duration-300 group">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-memorial text-foreground group-hover:text-primary transition-colors">
                            {obituary.deceased_first_name} {obituary.deceased_last_name}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Calendar className="h-3 w-3" />
                            <span className="text-xs">
                              {formatDate(obituary.birth_date)} - {formatDate(obituary.death_date)}
                            </span>
                          </CardDescription>
                        </div>
                        {obituary.photo_url && (
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-border/20 ml-3">
                            <img 
                              src={obituary.photo_url} 
                              alt={`${obituary.deceased_first_name} ${obituary.deceased_last_name}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        {getStatusBadge(obituary)}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {obituary.views_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatRelativeDate(obituary.updated_at)}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="flex gap-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          asChild
                        >
                          <a href={`/traueranzeigen/erstellen?edit=${obituary.id}`}>
                            <Edit className="h-3 w-3 mr-1" />
                            Bearbeiten
                          </a>
                        </Button>
                        
                        {obituary.is_published && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.open(`/traueranzeige/${obituary.id}`, '_blank')}
                              title="Öffnen"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => copyShareLink('obituary', obituary.id)}
                              title="Link kopieren"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedObituary(obituary);
                            setManagementDialogOpen(true);
                          }}
                          title="Veröffentlichung verwalten"
                        >
                          <CreditCard className="h-3 w-3" />
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Settings className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => deleteObituary(obituary.id)} className="text-destructive">
                              <Trash2 className="h-3 w-3 mr-2" />
                              Löschen
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="memorial-pages" className="space-y-6">
            {filteredMemorialPages.length === 0 && memorialPages.length === 0 ? (
              <Card className="border-dashed border-2 border-muted">
                <CardContent className="text-center py-16">
                  <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-memorial font-semibold text-foreground mb-2">
                    Noch keine Gedenkseiten
                  </h3>
                  <p className="text-muted-foreground font-elegant mb-6 max-w-md mx-auto">
                    Erstellen Sie eine liebevolle Gedenkseite mit Fotos, Erinnerungen und einem Kondolenzbuch, 
                    wo Besucher Kerzen anzünden können.
                  </p>
                  <Button asChild size="lg" variant="outline" className="shadow-elegant">
                    <a href="/gedenkseite/erstellen">
                      <Plus className="w-5 h-5 mr-2" />
                      Erste Gedenkseite erstellen
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ) : filteredMemorialPages.length === 0 ? (
              <Card className="border-dashed border-2 border-muted">
                <CardContent className="text-center py-12">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-memorial font-medium text-foreground mb-2">
                    Keine Ergebnisse gefunden
                  </h3>
                  <p className="text-muted-foreground font-elegant">
                    Versuchen Sie andere Suchbegriffe oder Filter.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredMemorialPages.map((memorial) => (
                  <Card key={memorial.id} className="hover:shadow-elegant transition-all duration-300 group">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-memorial text-foreground group-hover:text-primary transition-colors">
                            {memorial.deceased_first_name} {memorial.deceased_last_name}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Calendar className="h-3 w-3" />
                            <span className="text-xs">
                              {formatDate(memorial.birth_date)} - {formatDate(memorial.death_date)}
                            </span>
                          </CardDescription>
                        </div>
                        {memorial.main_photo_url && (
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-border/20 ml-3">
                            <img 
                              src={memorial.main_photo_url} 
                              alt={`${memorial.deceased_first_name} ${memorial.deceased_last_name}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          {getStatusBadge(memorial)}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <UserIcon className="h-3 w-3" />
                            {memorial.visitor_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatRelativeDate(memorial.updated_at)}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="flex gap-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          asChild
                        >
                          <a href={`/gedenkseite/erstellen?edit=${memorial.id}`}>
                            <Edit className="h-3 w-3 mr-1" />
                            Bearbeiten
                          </a>
                        </Button>
                        
                        {memorial.is_published && memorial.is_moderated && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.open(`/gedenkseite/${memorial.id}`, '_blank')}
                              title="Öffnen"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => copyShareLink('memorial', memorial.id)}
                              title="Link kopieren"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Settings className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => deleteMemorialPage(memorial.id)} className="text-destructive">
                              <Trash2 className="h-3 w-3 mr-2" />
                              Löschen
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            {orders.length === 0 ? (
              <Card className="border-dashed border-2 border-muted">
                <CardContent className="text-center py-16">
                  <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-memorial font-semibold text-foreground mb-2">
                    Noch keine Bestellungen
                  </h3>
                  <p className="text-muted-foreground font-elegant mb-6 max-w-md mx-auto">
                    Hier finden Sie alle Ihre Bestellungen und Zahlungen.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="hover:shadow-elegant transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg font-memorial text-foreground">
                            Bestellung {order.order_number}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Calendar className="h-3 w-3" />
                            <span className="text-xs">
                              {formatDate(order.created_at)}
                            </span>
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-memorial font-bold text-foreground">
                            {order.total_amount.toFixed(2)} {order.currency}
                          </div>
                          <Badge 
                            variant={order.status === 'completed' ? 'default' : 'secondary'}
                            className={order.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' : ''}
                          >
                            {order.status === 'completed' ? 'Abgeschlossen' : 
                             order.status === 'pending' ? 'Ausstehend' : 
                             order.status === 'processing' ? 'In Bearbeitung' : 
                             order.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {order.items.map((item: any, index: number) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="font-elegant">{item.name || 'Artikel'}</span>
                            <span className="text-muted-foreground">
                              {item.quantity || 1}x {item.price ? `${item.price.toFixed(2)} ${order.currency}` : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Profile Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-memorial">Profil-Einstellungen</CardTitle>
                  <CardDescription className="font-elegant">
                    Verwalten Sie Ihre persönlichen Informationen
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Name</div>
                      <div className="text-sm text-muted-foreground">
                        {profile?.first_name} {profile?.last_name || 'Nicht angegeben'}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setProfileDialogOpen(true)}>
                      Bearbeiten
                    </Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">E-Mail</div>
                      <div className="text-sm text-muted-foreground">
                        {user?.email}
                      </div>
                    </div>
                    <Badge variant={profile?.email_verified ? 'default' : 'secondary'}>
                      {profile?.email_verified ? 'Verifiziert' : 'Nicht verifiziert'}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Telefon</div>
                      <div className="text-sm text-muted-foreground">
                        {profile?.phone || 'Nicht angegeben'}
                      </div>
                    </div>
                    <Badge variant={profile?.phone_verified ? 'default' : 'secondary'}>
                      {profile?.phone_verified ? 'Verifiziert' : 'Nicht verifiziert'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Privacy Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-memorial">Datenschutz-Einstellungen</CardTitle>
                  <CardDescription className="font-elegant">
                    Kontrollieren Sie Ihre Datenschutz-Präferenzen
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Newsletter</div>
                      <div className="text-sm text-muted-foreground">
                        E-Mail-Updates erhalten
                      </div>
                    </div>
                    <Badge variant={profile?.newsletter_subscription ? 'default' : 'secondary'}>
                      {profile?.newsletter_subscription ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Marketing</div>
                      <div className="text-sm text-muted-foreground">
                        Werbe-E-Mails erhalten
                      </div>
                    </div>
                    <Badge variant={profile?.marketing_emails ? 'default' : 'secondary'}>
                      {profile?.marketing_emails ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                  </div>
                  <Separator />
                  <Button variant="outline" onClick={() => setSettingsDialogOpen(true)} className="w-full">
                    Einstellungen bearbeiten
                  </Button>
                </CardContent>
              </Card>

              {/* Account Actions */}
              <Card className="md:col-span-2 border-destructive/20">
                <CardHeader>
                  <CardTitle className="font-memorial text-destructive">Konto-Aktionen</CardTitle>
                  <CardDescription className="font-elegant">
                    Gefährliche Aktionen - Bitte mit Vorsicht verwenden
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-medium mb-2">Konto deaktivieren</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Ihr Konto wird deaktiviert und alle Inhalte werden ausgeblendet. 
                        Sie können Ihr Konto später reaktivieren.
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={softDeleteAccount}
                        className="w-full border-orange-200 text-orange-700 hover:bg-orange-50"
                      >
                        Konto deaktivieren
                      </Button>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 text-destructive">Konto löschen</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        WARNUNG: Diese Aktion löscht dauerhaft alle Ihre Daten und 
                        kann NICHT rückgängig gemacht werden.
                      </p>
                      <Button 
                        variant="destructive" 
                        onClick={() => setDeleteAccountDialogOpen(true)}
                        className="w-full"
                      >
                        Konto dauerhaft löschen
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Enhanced Profile Edit Dialog */}
      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-memorial">Profil bearbeiten</DialogTitle>
            <DialogDescription className="font-elegant">
              Verwalten Sie Ihre persönlichen Informationen und Kontaktdaten.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name" className="font-elegant">Vorname</Label>
                <Input
                  id="first_name"
                  value={editingProfile.first_name || ''}
                  onChange={(e) => setEditingProfile(prev => ({ ...prev, first_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name" className="font-elegant">Nachname</Label>
                <Input
                  id="last_name"
                  value={editingProfile.last_name || ''}
                  onChange={(e) => setEditingProfile(prev => ({ ...prev, last_name: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="display_name" className="font-elegant">Anzeigename (optional)</Label>
              <Input
                id="display_name"
                value={editingProfile.display_name || ''}
                onChange={(e) => setEditingProfile(prev => ({ ...prev, display_name: e.target.value }))}
                placeholder="Wie soll Ihr Name angezeigt werden?"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="font-elegant">Telefonnummer</Label>
                <Input
                  id="phone"
                  value={editingProfile.phone || ''}
                  onChange={(e) => setEditingProfile(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+49 ..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_of_birth" className="font-elegant">Geburtsdatum</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={editingProfile.date_of_birth || ''}
                  onChange={(e) => setEditingProfile(prev => ({ ...prev, date_of_birth: e.target.value }))}
                />
              </div>
            </div>

            <Separator />
            <h4 className="font-memorial font-semibold">Adresse</h4>
            
            <div className="space-y-2">
              <Label htmlFor="street_address" className="font-elegant">Straße und Hausnummer</Label>
              <Input
                id="street_address"
                value={editingProfile.street_address || ''}
                onChange={(e) => setEditingProfile(prev => ({ ...prev, street_address: e.target.value }))}
                placeholder="Musterstraße 123"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postal_code" className="font-elegant">PLZ</Label>
                <Input
                  id="postal_code"
                  value={editingProfile.postal_code || ''}
                  onChange={(e) => setEditingProfile(prev => ({ ...prev, postal_code: e.target.value }))}
                  placeholder="12345"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city" className="font-elegant">Stadt</Label>
                <Input
                  id="city"
                  value={editingProfile.city || ''}
                  onChange={(e) => setEditingProfile(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Berlin"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country" className="font-elegant">Land</Label>
                <Input
                  id="country"
                  value={editingProfile.country || 'Deutschland'}
                  onChange={(e) => setEditingProfile(prev => ({ ...prev, country: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProfileDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={updateProfile}>
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-memorial">Datenschutz-Einstellungen</DialogTitle>
            <DialogDescription className="font-elegant">
              Verwalten Sie Ihre Datenschutz- und Kommunikationseinstellungen.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="font-elegant">Newsletter abonnieren</Label>
                  <p className="text-sm text-muted-foreground">
                    Erhalten Sie Updates und Neuigkeiten per E-Mail
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={editingProfile.newsletter_subscription || false}
                  onChange={(e) => setEditingProfile(prev => ({ 
                    ...prev, 
                    newsletter_subscription: e.target.checked 
                  }))}
                  className="rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="font-elegant">Marketing-E-Mails</Label>
                  <p className="text-sm text-muted-foreground">
                    Erhalten Sie Informationen zu Angeboten und Services
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={editingProfile.marketing_emails || false}
                  onChange={(e) => setEditingProfile(prev => ({ 
                    ...prev, 
                    marketing_emails: e.target.checked 
                  }))}
                  className="rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="font-elegant">Benachrichtigungen</Label>
                  <p className="text-sm text-muted-foreground">
                    Erhalten Sie wichtige Benachrichtigungen
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={editingProfile.notifications_enabled || false}
                  onChange={(e) => setEditingProfile(prev => ({ 
                    ...prev, 
                    notifications_enabled: e.target.checked 
                  }))}
                  className="rounded"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={updateProfile}>
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={deleteAccountDialogOpen} onOpenChange={setDeleteAccountDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-memorial text-destructive">Konto dauerhaft löschen</DialogTitle>
            <DialogDescription className="font-elegant">
              Diese Aktion kann nicht rückgängig gemacht werden. Alle Ihre Daten werden dauerhaft gelöscht.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <h4 className="font-medium text-destructive mb-2">Was wird gelöscht:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Alle Ihre Traueranzeigen und Gedenkseiten</li>
                <li>• Alle hochgeladenen Fotos und Inhalte</li>
                <li>• Ihr Profil und alle persönlichen Daten</li>
                <li>• Bestellhistorie und Zahlungsinformationen</li>
                <li>• Alle Beziehungen zu angezündeten Kerzen</li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground">
              Sind Sie absolut sicher, dass Sie fortfahren möchten? 
              Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteAccountDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={permanentlyDeleteAccount}>
              Ja, Konto dauerhaft löschen
            </Button>
          </DialogFooter>
        </DialogContent>
        </Dialog>

        {/* Obituary Management Dialog */}
        {selectedObituary && (
          <ObituaryManagementDialog
            open={managementDialogOpen}
            onOpenChange={setManagementDialogOpen}
            obituary={selectedObituary}
            onUpdate={() => {
              fetchData();
              setSelectedObituary(null);
            }}
          />
        )}
      </div>
    );
  };

  export default UserDashboard;