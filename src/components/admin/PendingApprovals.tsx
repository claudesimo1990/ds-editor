import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Check, X, Eye, Calendar, User } from 'lucide-react';
import { sendApprovalGrantedNotification, sendRejectionNotification, generateUrls, formatDateForNotification } from '@/lib/notifications';

interface PendingItem {
  id: string;
  type: 'obituary' | 'memorial';
  deceased_first_name: string;
  deceased_last_name: string;
  birth_date: string;
  death_date: string;
  created_at: string;
  user_id: string;
  moderation_status: string;
  is_published: boolean;
}

const PendingApprovals: React.FC = () => {
  const [pendingObituaries, setPendingObituaries] = useState<PendingItem[]>([]);
  const [pendingMemorials, setPendingMemorials] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingItems();
  }, []);

  const fetchPendingItems = async () => {
    try {
      console.log('Fetching pending items...'); // Debug log
      
      // Fetch pending obituaries
      const { data: obituaries, error: obituariesError } = await supabase
        .from('dde_obituaries')
        .select('*')
        .eq('is_published', false)
        .order('created_at', { ascending: false });

      if (obituariesError) throw obituariesError;

      // Fetch pending memorial pages - only those waiting for moderation
      const { data: memorials, error: memorialsError } = await supabase
        .from('dde_memorial_pages')
        .select('*')
        .eq('is_deleted', false)
        .eq('moderation_status', 'pending')
        .order('created_at', { ascending: false });

      if (memorialsError) throw memorialsError;

      console.log('Found obituaries:', obituaries?.length || 0); // Debug log
      console.log('Found memorials:', memorials?.length || 0, memorials); // Debug log

      setPendingObituaries(obituaries?.map(item => ({ 
        ...item, 
        type: 'obituary' as const,
        moderation_status: item.is_published ? 'approved' : 'pending'
      })) || []);
      setPendingMemorials(memorials?.map(item => ({ ...item, type: 'memorial' as const })) || []);
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

  const approveItem = async (item: PendingItem) => {
    try {
      const table = item.type === 'obituary' ? 'dde_obituaries' : 'dde_memorial_pages';
      
      const updateData = item.type === 'memorial' 
        ? {
            moderation_status: 'approved',
            is_moderated: true,
            is_published: true,
            published_at: new Date().toISOString().split('T')[0] // Use date only for memorial pages
          }
        : {
            is_published: true,
            moderation_status: 'approved',
            published_at: new Date().toISOString()
          };
      
      const { error } = await supabase
        .from(table)
        .update(updateData)
        .eq('id', item.id);

      if (error) throw error;

      // Send approval notification
      try {
        const itemType = item.type === 'obituary' ? 'Traueranzeige' : 'Gedenkseite';
        const deceasedName = `${item.deceased_first_name} ${item.deceased_last_name}`;
        const urls = generateUrls(item.type, item.id);
        
        await sendApprovalGrantedNotification(
          item.user_id,
          itemType,
          deceasedName,
          urls.viewUrl
        );
        
        console.log('Approval notification sent successfully');
      } catch (notificationError) {
        console.error('Error sending approval notification:', notificationError);
        // Don't fail the approval process if notification fails
      }

      toast({
        title: "Freigegeben",
        description: `${item.type === 'obituary' ? 'Traueranzeige' : 'Gedenkseite'} wurde freigegeben und Benutzer benachrichtigt.`,
      });

      fetchPendingItems();
    } catch (error: any) {
      toast({
        title: "Fehler bei der Freigabe",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const rejectItem = async (item: PendingItem) => {
    try {
      const table = item.type === 'obituary' ? 'dde_obituaries' : 'dde_memorial_pages';
      
      const { error } = await supabase
        .from(table)
        .update({
          moderation_status: 'rejected'
        })
        .eq('id', item.id);

      if (error) throw error;

      // Send rejection notification
      try {
        const itemType = item.type === 'obituary' ? 'Traueranzeige' : 'Gedenkseite';
        const deceasedName = `${item.deceased_first_name} ${item.deceased_last_name}`;
        
        await sendRejectionNotification(
          item.user_id,
          itemType,
          deceasedName
        );
        
        console.log('Rejection notification sent successfully');
      } catch (notificationError) {
        console.error('Error sending rejection notification:', notificationError);
        // Don't fail the rejection process if notification fails
      }

      toast({
        title: "Abgelehnt",
        description: `${item.type === 'obituary' ? 'Traueranzeige' : 'Gedenkseite'} wurde abgelehnt und Benutzer benachrichtigt.`,
      });

      fetchPendingItems();
    } catch (error: any) {
      toast({
        title: "Fehler bei der Ablehnung",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  const renderPendingItem = (item: PendingItem) => (
    <Card key={item.id} className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              {item.deceased_first_name} {item.deceased_last_name} ✝
            </CardTitle>
            <CardDescription className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(item.birth_date)} - {formatDate(item.death_date)}
              </span>
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                Erstellt: {formatDate(item.created_at)}
              </span>
            </CardDescription>
          </div>
          <Badge variant={item.moderation_status === 'pending' ? 'secondary' : 'outline'}>
            {item.moderation_status === 'pending' ? 'Wartend' : 'Entwurf'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const route = item.type === 'obituary' 
                ? `/traueranzeige/${item.id}` 
                : `/gedenkseite/${item.id}`;
              window.open(route, '_blank');
            }}
          >
            <Eye className="h-4 w-4 mr-1" />
            Vorschau
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => rejectItem(item)}
          >
            <X className="h-4 w-4 mr-1" />
            Ablehnen
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => approveItem(item)}
          >
            <Check className="h-4 w-4 mr-1" />
            Freigeben
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return <div className="text-center py-8">Lade wartende Freigaben...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Freigabe-Warteschlange</CardTitle>
          <CardDescription>
            Hier finden Sie alle Inhalte, die auf Freigabe warten
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="obituaries" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="obituaries" className="flex items-center gap-2">
            Traueranzeigen
            {pendingObituaries.length > 0 && (
              <Badge variant="secondary">{pendingObituaries.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="memorials" className="flex items-center gap-2">
            Gedenkseiten
            {pendingMemorials.length > 0 && (
              <Badge variant="secondary">{pendingMemorials.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="obituaries" className="space-y-4">
          {pendingObituaries.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">Keine wartenden Traueranzeigen</p>
              </CardContent>
            </Card>
          ) : (
            pendingObituaries.map(renderPendingItem)
          )}
        </TabsContent>

        <TabsContent value="memorials" className="space-y-4">
          {pendingMemorials.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">Keine wartenden Gedenkseiten</p>
              </CardContent>
            </Card>
          ) : (
            pendingMemorials.map(renderPendingItem)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PendingApprovals;