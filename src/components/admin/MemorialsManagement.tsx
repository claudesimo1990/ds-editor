import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { Edit, Trash2, Eye, Search, Calendar, User, CheckCircle, Clock } from 'lucide-react';

interface Memorial {
  id: string;
  deceased_first_name: string;
  deceased_last_name: string;
  birth_date: string;
  death_date: string;
  created_at: string;
  is_published: boolean;
  is_moderated: boolean;
  moderation_status: string;
  visitor_count: number;
  user_id: string;
  user_email?: string;
  user_name?: string;
}

const MemorialsManagement: React.FC = () => {
  const [memorials, setMemorials] = useState<Memorial[]>([]);
  const [filteredMemorials, setFilteredMemorials] = useState<Memorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchMemorials();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = memorials.filter(memorial =>
        `${memorial.deceased_first_name} ${memorial.deceased_last_name}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
      setFilteredMemorials(filtered);
    } else {
      setFilteredMemorials(memorials);
    }
  }, [searchQuery, memorials]);

  const fetchMemorials = async () => {
    try {
      const { data, error } = await supabase
        .from('dde_memorial_pages')
        .select('*')
        .eq('is_deleted', false)
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

      // Get user profiles for all memorials
      const userIds = [...new Set((data || []).map((m: any) => m.user_id).filter(Boolean))];
      let userProfiles: any[] = [];
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('dde_user_profiles')
          .select('user_id, first_name, last_name')
          .in('user_id', userIds);
        userProfiles = profiles || [];
      }

      // Enhance memorials with user information
      const memorialsWithUsers = (data || []).map((memorial: any) => {
        const profile = userProfiles.find(p => p.user_id === memorial.user_id);
        const authUser = authUsers?.users?.find((u: any) => u.id === memorial.user_id);
        
        return {
          ...memorial,
          user_name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Unbekannt',
          user_email: authUser?.email || 'Nicht verfügbar'
        };
      });

      setMemorials(memorialsWithUsers);
      setFilteredMemorials(memorialsWithUsers);
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

  const approveMemorial = async (id: string) => {
    try {
      const { error } = await supabase
        .from('dde_memorial_pages')
        .update({ 
          moderation_status: 'approved',
          is_moderated: true,
          published_at: new Date().toISOString().split('T')[0]
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Gedenkseite genehmigt",
        description: "Die Gedenkseite wurde erfolgreich veröffentlicht.",
      });

      fetchMemorials();
    } catch (error: any) {
      toast({
        title: "Fehler beim Genehmigen",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const togglePublished = async (memorial: Memorial) => {
    try {
      const { error } = await supabase
        .from('dde_memorial_pages')
        .update({ 
          is_published: !memorial.is_published
        })
        .eq('id', memorial.id);

      if (error) throw error;

      toast({
        title: !memorial.is_published ? "Veröffentlicht" : "Unveröffentlicht",
        description: `Gedenkseite wurde ${!memorial.is_published ? 'veröffentlicht' : 'unveröffentlicht'}.`,
      });

      fetchMemorials();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteMemorial = async (memorial: Memorial) => {
    if (!confirm(`Möchten Sie die Gedenkseite für ${memorial.deceased_first_name} ${memorial.deceased_last_name} wirklich löschen?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('dde_memorial_pages')
        .delete()
        .eq('id', memorial.id);

      if (error) throw error;

      toast({
        title: "Gelöscht",
        description: "Gedenkseite wurde erfolgreich gelöscht.",
      });

      fetchMemorials();
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

  const getStatusBadge = (memorial: Memorial) => {
    if (memorial.is_published && memorial.is_moderated) {
      return <Badge variant="default">Veröffentlicht</Badge>;
    } else if (memorial.moderation_status === 'pending') {
      return (
        <div className="flex gap-1">
          <Badge variant="secondary">Warteschlange</Badge>
          <Badge variant="destructive">
            <Clock className="w-3 h-3 mr-1" />
            Prüfung erforderlich
          </Badge>
        </div>
      );
    } else if (memorial.moderation_status === 'rejected') {
      return <Badge variant="destructive">Abgelehnt</Badge>;
    } else {
      return <Badge variant="outline">Entwurf</Badge>;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Lade Gedenkseiten...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gedenkseiten verwalten</CardTitle>
          <CardDescription>
            Alle Gedenkseiten bearbeiten, freigeben oder löschen
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
              {filteredMemorials.length} von {memorials.length} Gedenkseiten
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
                  <TableHead>Besucher</TableHead>
                  <TableHead>Erstellt</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMemorials.map((memorial) => (
                  <TableRow key={memorial.id}>
                    <TableCell className="font-medium">
                      {memorial.deceased_first_name} {memorial.deceased_last_name} ✝
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <div className="text-sm">
                          <p className="font-medium">{memorial.user_name}</p>
                          <p className="text-muted-foreground text-xs">{memorial.user_email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(memorial.birth_date)} - {formatDate(memorial.death_date)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(memorial)}
                    </TableCell>
                    <TableCell>{memorial.visitor_count || 0}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(memorial.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`/gedenkseite/${memorial.id}`, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {memorial.moderation_status === 'pending' && !memorial.is_published && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => approveMemorial(memorial.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`/memorial-editor/${memorial.id}`, '_blank')}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePublished(memorial)}
                        >
                          {memorial.is_published ? "Verbergen" : "Freigeben"}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Gedenkseite löschen</AlertDialogTitle>
                              <AlertDialogDescription>
                                Sind Sie sicher, dass Sie die Gedenkseite für {memorial.deceased_first_name} {memorial.deceased_last_name} löschen möchten? 
                                Diese Aktion kann nicht rückgängig gemacht werden.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteMemorial(memorial)}>
                                Löschen
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredMemorials.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "Keine Gedenkseiten gefunden" : "Noch keine Gedenkseiten vorhanden"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MemorialsManagement;