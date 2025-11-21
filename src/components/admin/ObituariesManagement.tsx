import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Edit, Trash2, Eye, Search, Calendar, User } from 'lucide-react';

interface Obituary {
  id: string;
  deceased_first_name: string;
  deceased_last_name: string;
  birth_date: string;
  death_date: string;
  created_at: string;
  is_published: boolean;
  views_count: number;
  user_id: string;
  user_email?: string;
  user_name?: string;
}

const ObituariesManagement: React.FC = () => {
  const [obituaries, setObituaries] = useState<Obituary[]>([]);
  const [filteredObituaries, setFilteredObituaries] = useState<Obituary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchObituaries();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = obituaries.filter(obituary =>
        `${obituary.deceased_first_name} ${obituary.deceased_last_name}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
      setFilteredObituaries(filtered);
    } else {
      setFilteredObituaries(obituaries);
    }
  }, [searchQuery, obituaries]);

  const fetchObituaries = async () => {
    try {
      const { data, error } = await supabase
        .from('dde_obituaries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Try to get auth users for email addresses
      let authUsers: any = null;
      try {
        const { data: authData } = await supabase.auth.admin.listUsers();
        authUsers = authData;
      } catch (error) {
        console.warn('Cannot fetch auth users (admin access required):', error);
      }

      // Get user profiles for all obituaries
      const userIds = [...new Set((data || []).map((o: any) => o.user_id).filter(Boolean))];
      let userProfiles: any[] = [];
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('dde_user_profiles')
          .select('user_id, first_name, last_name')
          .in('user_id', userIds);
        userProfiles = profiles || [];
      }

      // Enhance obituaries with user information
      const obituariesWithUsers = (data || []).map((obituary: any) => {
        const profile = userProfiles.find(p => p.user_id === obituary.user_id);
        const authUser = authUsers?.users?.find((u: any) => u.id === obituary.user_id);
        
        return {
          ...obituary,
          user_name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Unbekannt',
          user_email: authUser?.email || 'Nicht verfügbar'
        };
      });

      setObituaries(obituariesWithUsers);
      setFilteredObituaries(obituariesWithUsers);
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

  const togglePublished = async (obituary: Obituary) => {
    try {
      const { error } = await supabase
        .from('dde_obituaries')
        .update({ 
          is_published: !obituary.is_published,
          published_at: !obituary.is_published ? new Date().toISOString() : null
        })
        .eq('id', obituary.id);

      if (error) throw error;

      toast({
        title: !obituary.is_published ? "Veröffentlicht" : "Unveröffentlicht",
        description: `Traueranzeige wurde ${!obituary.is_published ? 'veröffentlicht' : 'unveröffentlicht'}.`,
      });

      fetchObituaries();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteObituary = async (obituary: Obituary) => {
    if (!confirm(`Möchten Sie die Traueranzeige für ${obituary.deceased_first_name} ${obituary.deceased_last_name} wirklich löschen?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('dde_obituaries')
        .delete()
        .eq('id', obituary.id);

      if (error) throw error;

      toast({
        title: "Gelöscht",
        description: "Traueranzeige wurde erfolgreich gelöscht.",
      });

      fetchObituaries();
    } catch (error: any) {
      toast({
        title: "Fehler beim Löschen",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  if (loading) {
    return <div className="text-center py-8">Lade Traueranzeigen...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Traueranzeigen verwalten</CardTitle>
          <CardDescription>
            Alle Traueranzeigen bearbeiten, freigeben oder löschen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Nach Name suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredObituaries.length} von {obituaries.length} Traueranzeigen
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Verstorbene/r</TableHead>
                  <TableHead>Erstellt von</TableHead>
                  <TableHead>Lebensdaten</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aufrufe</TableHead>
                  <TableHead>Erstellt</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredObituaries.map((obituary) => (
                  <TableRow key={obituary.id}>
                    <TableCell className="font-medium">
                      {obituary.deceased_first_name} {obituary.deceased_last_name} ✝
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <div className="text-sm">
                          <p className="font-medium">{obituary.user_name}</p>
                          <p className="text-muted-foreground text-xs">{obituary.user_email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(obituary.birth_date)} - {formatDate(obituary.death_date)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={obituary.is_published ? "default" : "secondary"}>
                        {obituary.is_published ? "Veröffentlicht" : "Entwurf"}
                      </Badge>
                    </TableCell>
                    <TableCell>{obituary.views_count || 0}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(obituary.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`/traueranzeige/${obituary.id}`, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`/gedenkportal?edit=${obituary.id}`, '_blank')}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePublished(obituary)}
                        >
                          {obituary.is_published ? "Verbergen" : "Freigeben"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteObituary(obituary)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredObituaries.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "Keine Traueranzeigen gefunden" : "Noch keine Traueranzeigen vorhanden"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ObituariesManagement;