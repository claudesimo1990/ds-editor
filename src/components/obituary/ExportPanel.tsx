import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ObituaryData } from '@/types/obituary';
import { Download, Share2, Mail, MessageCircle, Facebook, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExportPanelProps {
  obituary: ObituaryData;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({ obituary }) => {
  const { toast } = useToast();

  const getPersonName = () => {
    const { firstName, lastName } = obituary.deceased;
    return [firstName, lastName].filter(Boolean).join(' ') || 'Unbenannte Person';
  };

  const handlePDFDownload = async () => {
    try {
      toast({
        title: "PDF wird erstellt",
        description: "Die Traueranzeige wird als PDF heruntergeladen...",
      });

      // Get the preview element
      const previewElement = document.querySelector('[data-preview="obituary"]') as HTMLElement;
      if (!previewElement) {
        throw new Error('Vorschau-Element nicht gefunden');
      }

      // Use html2canvas to convert to image, then jsPDF
      const { default: html2canvas } = await import('html2canvas');
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(previewElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`traueranzeige-${getPersonName().replace(/\s+/g, '-').toLowerCase()}.pdf`);

      toast({
        title: "PDF erstellt",
        description: "Die Traueranzeige wurde erfolgreich als PDF heruntergeladen.",
      });
    } catch (error) {
      console.error('PDF-Export Fehler:', error);
      toast({
        title: "Fehler beim PDF-Export",
        description: "Die PDF konnte nicht erstellt werden. Versuchen Sie es erneut.",
        variant: "destructive"
      });
    }
  };

  const handlePrint = () => {
    // Create a new window with only the preview content
    const previewElement = document.querySelector('[data-preview="obituary"]');
    if (!previewElement) {
      toast({
        title: "Fehler",
        description: "Vorschau-Element nicht gefunden",
        variant: "destructive"
      });
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Traueranzeige - ${getPersonName()}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');
            body { margin: 0; padding: 20px; font-family: 'Inter', sans-serif; }
            .font-memorial { font-family: 'Playfair Display', serif; }
            .font-elegant { font-family: 'Inter', sans-serif; }
            @media print { body { margin: 0; padding: 0; } }
          </style>
        </head>
        <body>
          ${previewElement.outerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleEmailShare = () => {
    const subject = `Traueranzeige für ${getPersonName()}`;
    const body = `Hier ist die Traueranzeige für ${getPersonName()}.\n\nLink: ${window.location.href}`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
  };

  const handleWhatsAppShare = () => {
    const text = `Traueranzeige für ${getPersonName()}\n${window.location.href}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleFacebookShare = () => {
    const url = window.location.href;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
  
      toast({
        title: "Link kopiert",
        description: "Der Link zur Traueranzeige wurde in die Zwischenablage kopiert.",
      });
    } catch (error) {
      console.error("Clipboard API failed:", error);
  
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
  
      try {
        document.execCommand("copy");
        toast({
          title: "Link kopiert",
          description: "Der Link wurde in die Zwischenablage kopiert.",
        });
      } finally {
        if (textArea.parentNode) {
          textArea.parentNode.removeChild(textArea);
        }
      }
    }
  };
  

  return (
    <div className="space-y-6 p-6 max-h-[80vh] overflow-y-auto">
      {/* Download & Druck */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold font-memorial">
            <Download className="w-5 h-5" />
            Download & Druck
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={handlePDFDownload}
            className="w-full justify-start gap-3 hover-lift text-lg"
            variant="outline"
          >
            <Download className="w-4 h-4" />
            Als PDF herunterladen
          </Button>
          <Button 
            onClick={handlePrint}
            className="w-full justify-start gap-3 hover-lift text-lg"
            variant="outline"
          >
            <Printer className="w-4 h-4" />
            Drucken
          </Button>
        </CardContent>
      </Card>

      {/* Teilen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold font-memorial">
            <Share2 className="w-5 h-5" />
            Teilen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={handleEmailShare}
            className="w-full justify-start gap-3 hover-lift text-lg"
            variant="outline"
          >
            <Mail className="w-4 h-4" />
            Per E-Mail versenden
          </Button>
          <Button 
            onClick={handleWhatsAppShare}
            className="w-full justify-start gap-3 hover-lift text-lg"
            variant="outline"
          >
            <MessageCircle className="w-4 h-4" />
            Per WhatsApp teilen
          </Button>
          <Button 
            onClick={handleFacebookShare}
            className="w-full justify-start gap-3 hover-lift text-lg"
            variant="outline"
          >
            <Facebook className="w-4 h-4" />
            Auf Facebook teilen
          </Button>
          <Button 
            onClick={handleCopyLink}
            className="w-full justify-start gap-3 hover-lift text-lg"
            variant="outline"
          >
            <Share2 className="w-4 h-4" />
            Link kopieren
          </Button>
        </CardContent>
      </Card>

      {/* Hinweise */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold font-memorial">
            Hinweise
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-lg text-muted-foreground font-elegant">
          <p>
            • Die Traueranzeige wird automatisch gespeichert
          </p>
          <p>
            • Beim PDF-Export werden alle Designelemente übernommen
          </p>
          <p>
            • Geteilte Links bleiben dauerhaft verfügbar
          </p>
          <p>
            • Für Zeitungsanzeigen empfehlen wir den PDF-Export
          </p>
        </CardContent>
      </Card>
    </div>
  );
};