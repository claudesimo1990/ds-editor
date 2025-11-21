import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flame, Heart, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Candle {
  id: string;
  obituary_id: string;
  lit_by_name: string;
  message?: string;
  duration_hours: number;
  lit_at: string;
  expires_at: string;
  obituary?: {
    deceased_first_name: string;
    deceased_last_name: string;
  } | null;
}

interface CandleDisplayProps {
  obituaryId?: string;
  showAll?: boolean;
  compact?: boolean;
}

export const CandleDisplay: React.FC<CandleDisplayProps> = ({ 
  obituaryId, 
  showAll = false, 
  compact = false 
}) => {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandles = async () => {
      try {
        let query = supabase
          .from('dde_candles')
          .select(`
            id,
            obituary_id,
            lit_by_name,
            message,
            duration_hours,
            lit_at,
            expires_at,
            obituary:dde_obituaries(deceased_first_name, deceased_last_name)
          `)
          .eq('is_active', true)
          .gte('expires_at', new Date().toISOString())
          .order('lit_at', { ascending: false });

        if (obituaryId && !showAll) {
          query = query.eq('obituary_id', obituaryId);
        }

        if (showAll) {
          query = query.limit(10);
        }

        const { data, error } = await query;

        if (error) throw error;
        
        // Type assertion to handle the Supabase query result
        const candlesData = (data as any[])?.map(item => ({
          id: item.id,
          obituary_id: item.obituary_id,
          lit_by_name: item.lit_by_name,
          message: item.message,
          duration_hours: item.duration_hours,
          lit_at: item.lit_at,
          expires_at: item.expires_at,
          obituary: item.obituary && typeof item.obituary === 'object' && 'deceased_first_name' in item.obituary 
            ? item.obituary 
            : null
        })) || [];
        
        setCandles(candlesData);
      } catch (error) {
        console.error('Error fetching candles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCandles();

    // Set up real-time subscription
    const subscription = supabase
      .channel('candles')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'dde_candles'
        },
        () => {
          fetchCandles();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [obituaryId, showAll]);

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Erloschen';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (candles.length === 0) {
    return (
      <div className="text-center text-muted-foreground text-sm p-4">
        {obituaryId ? 'Noch keine Kerzen angezündet' : 'Keine aktiven Kerzen'}
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
        <span className="text-sm text-muted-foreground">
          {candles.length} {candles.length === 1 ? 'Kerze brennt' : 'Kerzen brennen'}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {showAll && (
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-5 h-5 text-amber-500" />
          <h3 className="font-memorial text-lg">Gedenkkerzen</h3>
          <Badge variant="secondary">{candles.length} aktiv</Badge>
        </div>
      )}

      <div className="grid gap-3">
        {candles.map((candle) => (
          <Card key={candle.id} className="border-amber-200/50 bg-amber-50/30">
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                {/* Animated Candle */}
                <div className="relative flex-shrink-0">
                  <div className="w-6 h-8 bg-amber-100 rounded-t-full border border-amber-200 relative">
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <Flame className="w-3 h-3 text-amber-500 animate-pulse" />
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{candle.lit_by_name}</span>
                    {showAll && candle.obituary && (
                      <span className="text-xs text-muted-foreground">
                        für {candle.obituary.deceased_first_name} {candle.obituary.deceased_last_name}
                      </span>
                    )}
                  </div>

                  {candle.message && (
                    <p className="text-xs text-muted-foreground mb-2 italic">
                      "{candle.message}"
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{getTimeRemaining(candle.expires_at)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      <span>{candle.duration_hours}h</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};