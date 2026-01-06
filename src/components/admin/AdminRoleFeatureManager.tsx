import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Shield, Check, X, Loader2, Save, RotateCcw, 
  Users, UserCheck, Building2, Landmark, Crown,
  AlertTriangle, Radio, Heart, Globe, Map, Award,
  MessageSquare, Zap, Plug, Volume2
} from 'lucide-react';
import { 
  PLATFORM_FEATURES, 
  useAllRoleFeatureAccess, 
  useUpdateRoleFeatureAccess,
  RoleType 
} from '@/hooks/useRoleFeatureAccess';
import { useTranslationContext } from '@/components/TranslationProvider';
import { motion, AnimatePresence } from 'framer-motion';

const ROLES: { key: RoleType; label: string; icon: React.ElementType; description: string; color: string }[] = [
  { key: 'citizen', label: 'Citizen', icon: Users, description: 'Regular platform users', color: 'bg-blue-500' },
  { key: 'verifier', label: 'Verifier', icon: UserCheck, description: 'Report verification team', color: 'bg-green-500' },
  { key: 'partner', label: 'Partner', icon: Building2, description: 'Partner organizations', color: 'bg-purple-500' },
  { key: 'government', label: 'Government', icon: Landmark, description: 'Government officials', color: 'bg-amber-500' },
  { key: 'admin', label: 'Admin', icon: Crown, description: 'Platform administrators', color: 'bg-red-500' },
];

const FEATURE_ICONS: Record<string, React.ElementType> = {
  'incidents': AlertTriangle,
  'community': MessageSquare,
  'peace-pulse': Globe,
  'proposals': Map,
  'safety': Shield,
  'radio': Radio,
  'challenges': Award,
  'voice': Volume2,
  'verification': UserCheck,
  'integrations': Plug,
  'early-warning': Zap,
};

export const AdminRoleFeatureManager = () => {
  const { t } = useTranslationContext();
  const [selectedRole, setSelectedRole] = useState<RoleType>('citizen');
  const [featureStates, setFeatureStates] = useState<Record<string, Record<string, boolean>>>({});
  const [hasChanges, setHasChanges] = useState(false);

  const { data: allFeatureAccess, isLoading } = useAllRoleFeatureAccess();
  const updateFeatureAccess = useUpdateRoleFeatureAccess();

  // Initialize feature states from database
  useEffect(() => {
    if (allFeatureAccess) {
      const states: Record<string, Record<string, boolean>> = {};
      
      ROLES.forEach(role => {
        states[role.key] = {};
        PLATFORM_FEATURES.forEach(feature => {
          const access = allFeatureAccess.find(
            a => a.role === role.key && a.feature_key === feature.key
          );
          states[role.key][feature.key] = access ? access.is_enabled : true;
        });
      });
      
      setFeatureStates(states);
      setHasChanges(false);
    }
  }, [allFeatureAccess]);

  const handleToggleFeature = (role: RoleType, featureKey: string) => {
    // Admin role cannot be modified (always has all features)
    if (role === 'admin') {
      toast.info('Admin role always has access to all features');
      return;
    }

    setFeatureStates(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [featureKey]: !prev[role]?.[featureKey],
      },
    }));
    setHasChanges(true);
  };

  const handleSelectAll = (role: RoleType) => {
    if (role === 'admin') return;
    
    setFeatureStates(prev => ({
      ...prev,
      [role]: PLATFORM_FEATURES.reduce((acc, f) => ({ ...acc, [f.key]: true }), {}),
    }));
    setHasChanges(true);
  };

  const handleDeselectAll = (role: RoleType) => {
    if (role === 'admin') return;
    
    setFeatureStates(prev => ({
      ...prev,
      [role]: PLATFORM_FEATURES.reduce((acc, f) => ({ ...acc, [f.key]: false }), {}),
    }));
    setHasChanges(true);
  };

  const handleSave = async (role: RoleType) => {
    const features = Object.entries(featureStates[role] || {}).map(([key, enabled]) => ({
      key,
      enabled,
    }));

    try {
      await updateFeatureAccess.mutateAsync({ role, features });
      toast.success(`Feature access updated for ${role} role`);
      setHasChanges(false);
    } catch (error) {
      toast.error('Failed to update feature access');
      console.error(error);
    }
  };

  const handleSaveAll = async () => {
    try {
      for (const role of ROLES) {
        if (role.key === 'admin') continue; // Skip admin
        
        const features = Object.entries(featureStates[role.key] || {}).map(([key, enabled]) => ({
          key,
          enabled,
        }));
        
        await updateFeatureAccess.mutateAsync({ role: role.key, features });
      }
      toast.success('All role feature access updated successfully');
      setHasChanges(false);
    } catch (error) {
      toast.error('Failed to update feature access');
      console.error(error);
    }
  };

  const handleReset = () => {
    if (allFeatureAccess) {
      const states: Record<string, Record<string, boolean>> = {};
      
      ROLES.forEach(role => {
        states[role.key] = {};
        PLATFORM_FEATURES.forEach(feature => {
          const access = allFeatureAccess.find(
            a => a.role === role.key && a.feature_key === feature.key
          );
          states[role.key][feature.key] = access ? access.is_enabled : true;
        });
      });
      
      setFeatureStates(states);
      setHasChanges(false);
    }
  };

  const getEnabledCount = (role: RoleType) => {
    return Object.values(featureStates[role] || {}).filter(Boolean).length;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Role-Based Feature Access Control
              </CardTitle>
              <CardDescription>
                Configure which features are available for each user role across the platform
              </CardDescription>
            </div>
            {hasChanges && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
                <Button size="sm" onClick={handleSaveAll} disabled={updateFeatureAccess.isPending}>
                  {updateFeatureAccess.isPending ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-1" />
                  )}
                  Save All Changes
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedRole} onValueChange={(v) => setSelectedRole(v as RoleType)}>
            <TabsList className="grid grid-cols-5 mb-6">
              {ROLES.map(role => {
                const Icon = role.icon;
                const enabledCount = getEnabledCount(role.key);
                return (
                  <TabsTrigger 
                    key={role.key} 
                    value={role.key}
                    className="flex items-center gap-2 relative"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{role.label}</span>
                    <Badge variant="secondary" className="text-xs ml-1">
                      {enabledCount}/{PLATFORM_FEATURES.length}
                    </Badge>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {ROLES.map(role => {
              const Icon = role.icon;
              const isAdmin = role.key === 'admin';
              
              return (
                <TabsContent key={role.key} value={role.key} className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full ${role.color} flex items-center justify-center`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold">{role.label}</p>
                        <p className="text-sm text-muted-foreground">{role.description}</p>
                      </div>
                    </div>
                    {!isAdmin && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleSelectAll(role.key)}>
                          <Check className="h-4 w-4 mr-1" />
                          Enable All
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeselectAll(role.key)}>
                          <X className="h-4 w-4 mr-1" />
                          Disable All
                        </Button>
                      </div>
                    )}
                  </div>

                  {isAdmin && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-3">
                      <Crown className="h-5 w-5 text-amber-500" />
                      <p className="text-sm text-amber-600 dark:text-amber-400">
                        Admin role always has access to all features and cannot be restricted.
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <AnimatePresence>
                      {PLATFORM_FEATURES.map((feature, index) => {
                        const FeatureIcon = FEATURE_ICONS[feature.key] || Shield;
                        const isEnabled = isAdmin || (featureStates[role.key]?.[feature.key] ?? true);
                        
                        return (
                          <motion.div
                            key={feature.key}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className={`p-4 rounded-lg border transition-all cursor-pointer ${
                              isEnabled
                                ? 'border-primary/50 bg-primary/5 hover:bg-primary/10'
                                : 'border-border bg-muted/20 hover:bg-muted/40 opacity-60'
                            } ${isAdmin ? 'cursor-default' : ''}`}
                            onClick={() => !isAdmin && handleToggleFeature(role.key, feature.key)}
                          >
                            <div className="flex items-start gap-3">
                              <Checkbox
                                checked={isEnabled}
                                disabled={isAdmin}
                                onCheckedChange={() => !isAdmin && handleToggleFeature(role.key, feature.key)}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <FeatureIcon className={`h-4 w-4 ${isEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
                                  <Label className={`font-medium ${isAdmin ? 'cursor-default' : 'cursor-pointer'}`}>
                                    {feature.label}
                                  </Label>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                                <p className="text-xs text-muted-foreground/70 mt-0.5">{feature.path}</p>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>

                  {!isAdmin && (
                    <div className="flex gap-2 pt-4 border-t">
                      <Button 
                        onClick={() => handleSave(role.key)} 
                        disabled={updateFeatureAccess.isPending}
                      >
                        {updateFeatureAccess.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save {role.label} Settings
                      </Button>
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>

          {/* Feature Access Matrix Overview */}
          <div className="mt-8 pt-6 border-t">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Feature Access Matrix Overview
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium">Feature</th>
                    {ROLES.map(role => (
                      <th key={role.key} className="text-center py-2 px-3 font-medium">
                        {role.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PLATFORM_FEATURES.map(feature => (
                    <tr key={feature.key} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-2 px-3">{feature.label}</td>
                      {ROLES.map(role => {
                        const isEnabled = role.key === 'admin' || (featureStates[role.key]?.[feature.key] ?? true);
                        return (
                          <td key={role.key} className="text-center py-2 px-3">
                            {isEnabled ? (
                              <Check className="h-4 w-4 text-green-500 mx-auto" />
                            ) : (
                              <X className="h-4 w-4 text-red-500 mx-auto" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
