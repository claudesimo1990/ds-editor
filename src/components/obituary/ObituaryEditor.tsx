import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { ObituaryData } from '@/types/obituary';
import { DesignPanel } from './DesignPanel';

import { TextPanel } from './TextPanel';
import { ObituaryPreview } from './ObituaryPreview';
import { ExportPanel } from './ExportPanel';
import { PublishingPanel } from './PublishingPanel';
import { 
  Palette, 
  Type, 
  Eye, 
  Download, 
  RotateCcw, 
  Smartphone,
  Monitor,
  Tablet,
  Undo,
  Redo,
  HelpCircle,
  CheckCircle2,
  Clock,
  AlertCircle,
  Cog,
  Globe,
  ArrowLeft,
  ArrowRight,
  List,
} from 'lucide-react';
import { templates } from './Templates';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import EditorSwitcher from '../layout/EditorSwitcher';

interface ObituaryEditorProps {
  obituary: ObituaryData;
  onUpdate: (obituary: ObituaryData) => void;
}

type PreviewMode = 'desktop' | 'tablet' | 'mobile' | any;

export const ObituaryEditor: React.FC<ObituaryEditorProps> = ({
  obituary,
  onUpdate
}) => {
  const [activeTab, setActiveTab] = useState('design');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [history, setHistory] = useState<ObituaryData[]>([obituary]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const { toast } = useToast();

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    setIsAutoSaving(true);
    try {
      // Simulate save delay
      await new Promise(resolve => setTimeout(resolve, 500));
      localStorage.setItem('obituary-draft', JSON.stringify(obituary));
      setUnsavedChanges(false);
      
      toast({
        title: "Automatisch gespeichert",
        description: "Ihre Änderungen wurden lokal gespeichert.",
        duration: 2000,
      });
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsAutoSaving(false);
    }
  }, [obituary, toast]);

  // Load saved draft on component mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('obituary-draft');
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        onUpdate(parsedDraft);
        toast({
          title: "Entwurf geladen",
          description: "Ein gespeicherter Entwurf wurde wiederhergestellt.",
        });
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  }, []);

  // Auto-save after changes
  useEffect(() => {
    if (unsavedChanges) {
      const timeoutId = setTimeout(autoSave, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [unsavedChanges, autoSave]);

  const updateObituary = useCallback((updates: Partial<ObituaryData>) => {
    const newObituary = { ...obituary, ...updates };
    
    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newObituary);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    onUpdate(newObituary);
    setUnsavedChanges(true);
  }, [obituary, history, historyIndex, onUpdate]);

  const updateTexts = useCallback((textUpdates: Partial<ObituaryData['texts']>) => {
    updateObituary({
      texts: { ...obituary.texts, ...textUpdates }
    });
  }, [obituary.texts, updateObituary]);

  const updateDeceased = useCallback((deceasedUpdates: Partial<ObituaryData['deceased']>) => {
    updateObituary({
      deceased: { ...obituary.deceased, ...deceasedUpdates }
    });
  }, [obituary.deceased, updateObituary]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      onUpdate(history[newIndex]);
      setUnsavedChanges(true);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      onUpdate(history[newIndex]);
      setUnsavedChanges(true);
    }
  };

  const resetToDefault = () => {
    const defaultObituary: any = {
      obituaryWidth: '1180',
      obituaryHeight: '650',
      type: 'todesanzeige',
      format: '16x9',
      backgroundImage: '',
      symbolImage: '',
      fontFamily: '',
      frameStyle: '',
      colorTheme: '',
      deceased: {
        firstName: '',
        lastName: '',
        additionalName: '',
        birthDate: '',
        deathDate: ''
      },
      texts: {
        locationDate: '',
        trauerspruch: '',
        introduction: '',
        mainText: '',
        sideTexts: '',
        additionalTexts: '',
        lastResidence: ''
      },
      photoUrl: '',
      photoUrlOpacity: 0,
      photoUrlSize: 0,
      symbolImageOpacity: 0,
      symbolImageSize: 0,
      orientation: '',
      fullnameFontSize: 0,
      datesColor: '',
      datesFontFamily: '',

      additionalNamePosition: { x: 0, y: 0 },
      additionalTextsPosition: { x: 0, y: 0 },
      datesPosition: { x: 0, y: 0 },
      firstnamePosition: { x: 0, y: 0 },
      fullnamePosition: { x: 0, y: 0 },
      introductionPosition: { x: 0, y: 0 },
      lastnamePosition: { x: 0, y: 0 },
      locationDatePosition: { x: 0, y: 0 },
      mainTextPosition: { x: 0, y: 0 },
      photoUrlPosition: { x: 0, y: 0 },
      sideTextsPosition: { x: 0, y: 0 },
      symbolImagePosition: { x: 0, y: 0 },
      trauerspruchPosition: { x: 0, y: 0 },
      symbols: [],
      photos: []
    };
    updateObituary(defaultObituary);
    toast({
      title: "Zurückgesetzt",
      description: "Die Traueranzeige wurde auf die Standardwerte zurückgesetzt.",
    });
  };

  const [selectTemplate, setSelectTemplate] = useState(null)

  const handleSelectTemplate = (id) => {
    const selected: any = templates.find(t => t.id === id);
    if (selected) setSelectTemplate(selected);
    updateObituary(selected);
  }

  useEffect(() => {
    if(selectTemplate) handleSelectTemplate('template-1');
  }, [selectTemplate]);

  const getPreviewModeIcon = () => {
    switch (previewMode) {
      case 'mobile': return Smartphone;
      case 'tablet': return Tablet;
      default: return Monitor;
    }
  };

  const getCompletionStatus = useMemo(() => {
    const deceased = obituary.deceased;
    const texts = obituary.texts;
    
    const required = {
      name:  deceased.firstName && deceased.lastName,
      text: texts.mainText
    };
    
    const optional = {
      design: obituary.backgroundImage || !!obituary.symbolImage,
      dates: deceased.birthDate && deceased.deathDate,
      location: texts.locationDate,
      quote: texts.trauerspruch,
      family: texts.sideTexts
    };
    
    const requiredComplete = Object.values(required).filter(Boolean).length;
    const optionalComplete = Object.values(optional).filter(Boolean).length;
    const totalComplete = requiredComplete + optionalComplete;
    const totalPossible = Object.keys(required).length + Object.keys(optional).length;
    
    return {
      required,
      optional,
      completion: Math.round((totalComplete / totalPossible) * 100),
      isReady: requiredComplete === Object.keys(required).length
    };
  }, [obituary]);

  const getTabBadge = (tab: string) => {
    switch (tab) {
      case 'design':
        return getCompletionStatus.optional.design ? 
          <CheckCircle2 className="w-3 h-3 ml-1 text-green-500" /> : 
          <div className="w-2 h-2 rounded-full bg-muted-foreground/30 ml-1" />;
      case 'text':
        const textComplete = getCompletionStatus.required.name && getCompletionStatus.required.text;
        return textComplete ? 
          <CheckCircle2 className="w-3 h-3 ml-1 text-green-500" /> : 
          <AlertCircle className="w-3 h-3 ml-1 text-orange-500" />;
      default:
        return null;
    }
  };

  const PreviewModeIcon = getPreviewModeIcon();

  const [hideSidebar, setHideSidebar] = useState(false)

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const [scale, setScale] = useState(100);

  // custom
  const [isF2Pressed, setIsF2Pressed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "F2") {
        setIsF2Pressed(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1300px] mx-auto px-4 py-6">

        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[1.2em] mb-6">
          <div className="p-4 bg-white shadow-sm rounded-sm">
            <span className="text-red-600 font-semibold">Persönlich.</span> Stilvoll & erschwinglich. 
            Bietet Hinterbliebenen zeitnahe Informationen ohne Zeitungsabo – weltweit.
          </div>

          <div className="p-4 bg-white shadow-sm rounded-sm">
            <span className="text-red-600 font-semibold">Versandfertig.</span> 
            Senden Sie die Traueranzeige per WhatsApp oder E-Mail, speichern Sie sie als PDF oder drucken Sie sie selbst aus.
          </div>

          <div className="p-4 bg-white shadow-sm rounded-sm">
            <span className="text-red-600 font-semibold">Günstiger.</span> 
            Die Traueranzeige bleibt drei Jahre lang verfügbar. Eine einmalige Gebühr von 35,00 € ist erforderlich.
          </div>
        </div> */}

        {/* Header with improved controls */}
        <div className="mb-8">
          {/* <EditorSwitcher /> */}

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-memorial font-semibold text-foreground mb-2">
              Gedenkseiten-Editor
              </h1>
              <p className="text-muted-foreground font-elegant mb-3">
                Erstellen Sie eine würdevolle Traueranzeige mit unserer eleganten Bearbeitungsoberfläche
              </p>
              
              {/* Progress indicator */}
              <div className="flex items-center gap-3 max-w-md">
                <Progress value={getCompletionStatus.completion} className="flex-1 h-2" />
                <div className="flex items-center gap-1 text-sm">
                  <span className="font-medium">{getCompletionStatus.completion}%</span>
                  {getCompletionStatus.isReady ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <Clock className="w-4 h-4 text-orange-500" />
                  )}
                </div>
              </div>
            </div>
            
          </div>

          {/* Preview Mode Selector - Mobile Only */}
          <div className="lg:hidden mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Vorschau:</span>
              <div className="flex gap-1">
                {['desktop', 'tablet', 'mobile'].map((mode) => {
                  const Icon = mode === 'mobile' ? Smartphone : mode === 'tablet' ? Tablet : Monitor;
                  return (
                    <Button
                      key={mode}
                      variant={previewMode === mode ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPreviewMode(mode as PreviewMode)}
                      className="h-8 w-8 p-0"
                    >
                      <Icon className="h-4 w-4" />
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        
        {selectTemplate && (
          <>
          <Button
              onClick={() => setHideSidebar(!hideSidebar)}
              className="h-8 w-12 my-4 hidden lg:inline-block"
          >
              {hideSidebar ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
          </Button>
          </>
        )}

        <div className="grid grid-cols-1 gap-4">
          <Card className="shadow-memorial">
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Tabs List */}
              <TabsList
                className={`w-full grid mb-4 p-2 ${
                  isF2Pressed
                    ? "grid-cols-5 sm:grid-cols-4"
                    : "grid-cols-4 sm:grid-cols-3"
                }`}
              >
                <TabsTrigger value="design" className="flex items-center gap-2 text-xl">
                  <Palette className="w-4 h-4" />
                  {getTabBadge("design")}
                </TabsTrigger>

                {isF2Pressed && (
                  <TabsTrigger value="text" className="flex items-center gap-2 text-xl">
                    <Type className="w-4 h-4" />
                    {getTabBadge("text")}
                  </TabsTrigger>
                )}

                <TabsTrigger value="publish" className="flex items-center gap-2 text-xl">
                  <Globe className="w-4 h-4" />
                </TabsTrigger>

                <TabsTrigger
                  value="preview"
                  className="flex items-center gap-2 text-xl lg:hidden"
                >
                  <PreviewModeIcon className="w-4 h-4" />
                </TabsTrigger>

                <TabsTrigger value="export" className="flex items-center gap-2 text-xl">
                  <Download className="w-4 h-4" />
                </TabsTrigger>
              </TabsList>

              {/* Always show preview under tabs */}
              <div className="border rounded-xl shadow-sm m-6 mb-6 bg-white">
                <div className="flex justify-between items-center mb-4 border-b">
                  <h3 className="text-lg font-memorial font-medium flex items-center gap-2 p-4">
                    <Eye className="w-5 h-5" />
                    Live-Vorschau
                  </h3>
                  {unsavedChanges && (
                    <Badge
                      variant="outline"
                      className={`${
                        isAutoSaving
                          ? "text-blue-600 border-blue-600"
                          : "text-yellow-600 border-yellow-600"
                      } animate-pulse mr-4`}
                    >
                      {isAutoSaving ? (
                        <>
                          <Clock className="w-3 h-3 mr-1" />
                          Speichert...
                        </>
                      ) : (
                        "Ungespeichert"
                      )}
                    </Badge>
                  )}

                  <div className="flex justify-center items-center absolute left-1/2 transform -translate-x-1/2">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleUndo}
                          disabled={historyIndex <= 0}
                          className="h-8 w-8 p-0"
                        >
                          <Undo className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRedo}
                          disabled={historyIndex >= history.length - 1}
                          className="h-8 w-8 p-0"
                        >
                          <Redo className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={resetToDefault}
                          className="hidden sm:flex"
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Zurücksetzen
                        </Button>
                      </div>
                    </div>
                </div>

                {/* Preview itself */}
                <div className="overflow-x-auto px-4">
                  <ObituaryPreview
                    obituary={obituary}
                    previewMode={previewMode}
                    onUpdate={updateObituary}
                    isEditable={windowWidth > 1000}
                  />
                </div>

                {/* Templates carousel */}
                <div className="flex overflow-x-auto space-x-4 p-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent bg-muted/30 border border-gray-200 rounded-lg">
                  {templates.map((temp, index) => {
                    const tempItem: any = temp;
                    return (
                      <div
                        key={`templ-${index}`}
                        className="flex-none flex items-center gap-4 p-3 cursor-pointer hover:bg-gray-50 transition rounded-lg"
                        onClick={() => onUpdate(tempItem)}
                      >
                        <img
                          src={temp.image}
                          alt={temp.title}
                          className="w-12 h-12 object-cover rounded-md shadow-sm"
                        />
                        <h3 className="text-base font-sans font-medium text-gray-800 truncate max-w-[150px]">
                          {temp.title}
                        </h3>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tabs Content below preview */}
              <TabsContent value="design" className="space-y-6">
                <DesignPanel obituary={obituary} onUpdate={updateObituary} />
              </TabsContent>

              {isF2Pressed && (
                <TabsContent value="text" className="space-y-6">
                  <TextPanel
                    obituary={obituary}
                    onUpdateTexts={updateTexts}
                    onUpdateDeceased={updateDeceased}
                    onUpdate={updateObituary}
                  />
                </TabsContent>
              )}

              <TabsContent value="publish" className="space-y-6">
                <PublishingPanel
                  obituary={obituary}
                  onPublish={(published) => {
                    if (published) {
                      toast({
                        title: "Erfolgreich veröffentlicht",
                        description: "Ihre Traueranzeige ist nun öffentlich sichtbar.",
                      });
                    }
                  }}
                />
              </TabsContent>

              <TabsContent value="export" className="space-y-6">
                <ExportPanel obituary={obituary} />
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        



          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Card */}
            <Card className="bg-muted/30">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  {getCompletionStatus.isReady ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                  )}
                  <h4 className="font-medium text-sm">
                    {getCompletionStatus.isReady ? 'Bereit zum Export' : 'Noch nicht vollständig'}
                  </h4>
                </div>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Name der Person</span>
                    {getCompletionStatus.required.name ? (
                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                    ) : (
                      <div className="w-3 h-3 rounded-full border border-orange-500" />
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span>Haupttext</span>
                    {getCompletionStatus.required.text ? (
                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                    ) : (
                      <div className="w-3 h-3 rounded-full border border-orange-500" />
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Tips Card */}
            <Card className="bg-muted/30">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm text-foreground mb-1">Tipps für eine würdevolle Traueranzeige</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Beginnen Sie mit Name und Haupttext</li>
                      <li>• Nutzen Sie die Vorschläge als Inspiration</li>
                      <li>• Die Live-Vorschau zeigt alle Änderungen</li>
                      <li>• Ihre Arbeit wird automatisch gespeichert</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          </div>

      </div>
    </div>
  );
};