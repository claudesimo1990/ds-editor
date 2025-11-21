import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Search, Mail, Calendar, MapPin, User, Heart, FileText } from 'lucide-react';

interface UserProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  city?: string;
  country?: string;
  created_at: string;
  last_login_at?: string;
  account_status: string;
  obituaries_count?: number;
  memorials_count?: number;
}

const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter(user =>
        `${user.first_name || ''} ${user.last_name || ''} ${user.email || ''}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      // Fetch users from auth.users via profiles table
      const { data: profiles, error: profilesError } = await supabase
        .from('dde_user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Try to get auth users' email addresses (requires admin access)
      let authUsers: any = null;
      try {
        const { data } = await supabase.auth.admin.listUsers();
        authUsers = data;
      } catch (error) {
        console.warn('Cannot fetch auth users (admin access required):', error);
      }

      // Combine profile data with auth data and count content
      const usersWithCounts = await Promise.all(
        (profiles || []).map(async (profile) => {
          // Find corresponding auth user
          const authUser = authUsers?.users?.find(u => u.id === profile.user_id);
          
          // Count obituaries
          const { count: obituariesCount } = await supabase
            .from('dde_obituaries')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', profile.user_id);

          // Count memorial pages
          const { count: memorialsCount } = await supabase
            .from('dde_memorial_pages')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', profile.user_id);

          return {
            ...profile,
            email: authUser?.email || 'Nicht verfügbar',
            obituaries_count: obituariesCount || 0,
            memorials_count: memorialsCount || 0,
          };
        })
      );

      setUsers(usersWithCounts);
      setFilteredUsers(usersWithCounts);
    } catch (error: any) {
      toast({
        title: "Fehler beim Laden der Benutzer",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nie';
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Aktiv</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Gesperrt</Badge>;
      case 'pending':
        return <Badge variant="secondary">Ausstehend</Badge>;
      default:
        return <Badge variant="outline">Unbekannt</Badge>;
    }
  };

  const viewUserContent = (userId: string) => {
    // Open a new tab with user's content filtered
    window.open(`/admin-bereich?user=${userId}`, '_blank');
  };

  if (loading) {
    return <div className="text-center py-8">Lade Benutzer...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Benutzerverwaltung</CardTitle>
          <CardDescription>
            Übersicht aller registrierten Benutzer und ihrer Aktivitäten
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Nach Name oder E-Mail suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredUsers.length} von {users.length} Benutzern
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Benutzer</TableHead>
                  <TableHead>Kontakt</TableHead>
                  <TableHead>Ort</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Inhalte</TableHead>
                  <TableHead>Registriert</TableHead>
                  <TableHead>Letzter Login</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {user.first_name || 'Unbekannt'} {user.last_name || ''}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ID: {user.user_id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <p className="text-sm text-muted-foreground mt-1">
                            📞 {user.phone}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.city || user.country ? (
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3" />
                          {user.city && user.country ? `${user.city}, ${user.country}` : 
                           user.city || user.country}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Nicht angegeben</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(user.account_status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {user.obituaries_count! > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <FileText className="h-3 w-3 mr-1" />
                            {user.obituaries_count} Traueranzeigen
                          </Badge>
                        )}
                        {user.memorials_count! > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <Heart className="h-3 w-3 mr-1" />
                            {user.memorials_count} Gedenkseiten
                          </Badge>
                        )}
                        {(user.obituaries_count! + user.memorials_count!) === 0 && (
                          <span className="text-xs text-muted-foreground">Keine Inhalte</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(user.created_at)}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(user.last_login_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {(user.obituaries_count! + user.memorials_count!) > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewUserContent(user.user_id)}
                            title="Benutzerinhalte anzeigen"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`https://supabase.com/dashboard/project/ytuumwgmdnqcmkvrtsll/auth/users`, '_blank')}
                          title="In Supabase verwalten"
                        >
                          <User className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "Keine Benutzer gefunden" : "Noch keine Benutzer registriert"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersManagement;