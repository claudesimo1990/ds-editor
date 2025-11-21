import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, AlertTriangle, Bug, Code } from 'lucide-react';

export default function Development() {
  const projectOverview = {
    completedFeatures: 8,
    totalFeatures: 10,
    openBugs: 0,
    fixedBugs: 15
  };

  const features = [
    { name: 'Traueranzeigen erstellen', status: 'fertig', wichtigkeit: 'sehr wichtig' },
    { name: 'PDF Export', status: 'fertig', wichtigkeit: 'sehr wichtig' },
    { name: 'Kerzen anzünden', status: 'fertig', wichtigkeit: 'wichtig' },
    { name: 'Benutzer-System', status: 'fertig', wichtigkeit: 'sehr wichtig' },
    { name: 'Gedenkportal', status: 'fertig', wichtigkeit: 'sehr wichtig' },
    { name: 'Gedenkseiten erstellen', status: 'fertig', wichtigkeit: 'sehr wichtig' },
    { name: 'Responsive Design', status: 'fertig', wichtigkeit: 'sehr wichtig' },
    { name: 'Kondolenzbuch', status: 'fertig', wichtigkeit: 'wichtig' },
    { name: 'Admin Dashboard', status: 'in Arbeit', wichtigkeit: 'wichtig' },
    { name: 'E-Mail System', status: 'geplant', wichtigkeit: 'mittel' }
  ];

  const recentFixes = [
    { name: 'RLS Policy Endlosschleife behoben', datum: '19.07.2025' },
    { name: 'Auth Deadlock Problem gelöst', datum: '19.07.2025' },
    { name: 'Gedenkportal zeigt echte Daten', datum: '19.07.2025' },
    { name: 'Routing für Traueranzeigen ergänzt', datum: '19.07.2025' },
    { name: 'Supabase RPC-Funktion hinzugefügt', datum: '19.07.2025' }
  ];

  const completionPercentage = Math.round((projectOverview.completedFeatures / projectOverview.totalFeatures) * 100);

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-memorial font-bold text-foreground">Development Dashboard</h1>
          <p className="text-xl text-muted-foreground">Das Deutschland Echo - Gedenkportal</p>
          <div className="text-sm text-muted-foreground">
            Status: {new Date().toLocaleDateString('de-DE')} • Version 2.0.0
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-sm flex items-center justify-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Fertige Features
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {projectOverview.completedFeatures}
              </div>
              <div className="text-sm text-muted-foreground">
                von {projectOverview.totalFeatures}
              </div>
              <Progress value={completionPercentage} className="mt-3 h-2" />
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="text-center p-6">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {features.filter(f => f.status === 'in Arbeit').length}
              </div>
              <div className="text-sm text-muted-foreground">In Entwicklung</div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="text-center p-6">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {projectOverview.fixedBugs}
              </div>
              <div className="text-sm text-muted-foreground">Bugs behoben</div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="text-center p-6">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {completionPercentage}%
              </div>
              <div className="text-sm text-muted-foreground">Fertigstellung</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="features" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="updates">Letzte Updates</TabsTrigger>
          </TabsList>

          <TabsContent value="features">
            <Card>
              <CardHeader>
                <CardTitle>Feature-Übersicht</CardTitle>
                <CardDescription>Alle Funktionen des Gedenkportals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        {feature.status === 'fertig' ? 
                          <CheckCircle className="h-5 w-5 text-green-600" /> :
                          feature.status === 'in Arbeit' ?
                          <Clock className="h-5 w-5 text-blue-600" /> :
                          <AlertTriangle className="h-5 w-5 text-orange-600" />
                        }
                        <span className="font-medium">{feature.name}</span>
                      </div>
                      <Badge className={
                        feature.status === 'fertig' ? 'bg-green-100 text-green-800' :
                        feature.status === 'in Arbeit' ? 'bg-blue-100 text-blue-800' :
                        'bg-orange-100 text-orange-800'
                      }>
                        {feature.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="updates">
            <Card>
              <CardHeader>
                <CardTitle>Letzte Verbesserungen</CardTitle>
                <CardDescription>Kürzlich behobene Probleme und Updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentFixes.map((fix, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="flex-1">{fix.name}</span>
                      <span className="text-sm text-muted-foreground">{fix.datum}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card>
          <CardContent className="text-center py-8">
            <h2 className="text-2xl font-memorial font-bold text-foreground mb-2">
              Projekt erfolgreich stabilisiert! 🎉
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Alle kritischen Probleme wurden behoben. Das Gedenkportal läuft stabil 
              und alle Hauptfunktionen sind voll funktionsfähig.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}