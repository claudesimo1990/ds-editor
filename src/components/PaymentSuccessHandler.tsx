import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export const PaymentSuccessHandler: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const { toast } = useToast();

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const paymentStatus = searchParams.get('payment');

    if (paymentStatus === 'success' && sessionId) {
      handlePaymentSuccess(sessionId);
    } else if (paymentStatus === 'cancelled') {
      setStatus('error');
      toast({
        title: "Zahlung abgebrochen",
        description: "Die Zahlung wurde abgebrochen. Sie können es erneut versuchen.",
        variant: "destructive"
      });
    }
  }, [searchParams, toast]);

  const handlePaymentSuccess = async (sessionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('handle-payment-success', {
        body: { sessionId }
      });

      if (error) throw error;

      if (data.success) {
        setStatus('success');
        toast({
          title: "Zahlung erfolgreich",
          description: "Ihre Traueranzeige wurde erfolgreich veröffentlicht.",
        });
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      setStatus('error');
      toast({
        title: "Fehler bei der Zahlungsverarbeitung",
        description: "Es gab ein Problem bei der Verarbeitung Ihrer Zahlung. Bitte kontaktieren Sie den Support.",
        variant: "destructive"
      });
    }
  };

  if (status === 'processing') {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <Clock className="w-12 h-12 mx-auto mb-4 text-blue-500 animate-spin" />
          <h3 className="text-lg font-medium mb-2">Zahlung wird verarbeitet...</h3>
          <p className="text-muted-foreground">
            Bitte warten Sie, während wir Ihre Zahlung verarbeiten.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (status === 'success') {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
          <h3 className="text-lg font-medium mb-2">Zahlung erfolgreich!</h3>
          <p className="text-muted-foreground">
            Ihre Traueranzeige wurde erfolgreich veröffentlicht und ist nun öffentlich sichtbar.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="p-6 text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
        <h3 className="text-lg font-medium mb-2">Fehler bei der Zahlung</h3>
        <p className="text-muted-foreground">
          Es gab ein Problem bei der Verarbeitung Ihrer Zahlung. Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.
        </p>
      </CardContent>
    </Card>
  );
};