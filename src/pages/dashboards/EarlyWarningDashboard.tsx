import Navigation from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, TrendingUp, Bell, Network, Users } from 'lucide-react';
import RiskDashboard from '@/components/early-warning/RiskDashboard';
import PredictiveHotspotMap from '@/components/early-warning/PredictiveHotspotMap';
import AlertSystem from '@/components/early-warning/AlertSystem';
const EarlyWarningDashboard = () => {
  return <div className="min-h-screen bg-hero-gradient">
      <Navigation />
      <div className="container mx-auto px-4 py-20 text-lime-800">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-3 text-yellow-400">
              Early Warning System
            </h1>
            <p className="text-lg text-neutral-50 bg-transparent">
              AI-Powered Conflict Prevention & Risk Analysis
            </p>
          </div>

          <Tabs defaultValue="risk" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="risk">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Risk Analysis
              </TabsTrigger>
              <TabsTrigger value="hotspots">
                <TrendingUp className="w-4 h-4 mr-2" />
                Predictive Hotspots
              </TabsTrigger>
              <TabsTrigger value="alerts">
                <Bell className="w-4 h-4 mr-2" />
                Alerts
              </TabsTrigger>
            </TabsList>

            <TabsContent value="risk">
              <RiskDashboard />
            </TabsContent>

            <TabsContent value="hotspots">
              <PredictiveHotspotMap />
            </TabsContent>

            <TabsContent value="alerts">
              <AlertSystem />
            </TabsContent>
          </Tabs>

          {/* System Status */}
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <Network className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold">AI Analysis</p>
                <p className="text-xs text-muted-foreground">Operational</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold">Prediction Engine</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold">Alert System</p>
                <p className="text-xs text-muted-foreground">Monitoring</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold">Response Teams</p>
                <p className="text-xs text-muted-foreground">Ready</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>;
};
export default EarlyWarningDashboard;