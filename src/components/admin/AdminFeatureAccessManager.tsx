import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Search, Shield, User, Check, X, Loader2, Save, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PLATFORM_FEATURES, useUserFeatureAccessAdmin, useUpdateUserFeatureAccess } from '@/hooks/useFeatureAccess';
import { useTranslationContext } from '@/components/TranslationProvider';

interface UserProfile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
}

export const AdminFeatureAccessManager = () => {
  const { t } = useTranslationContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [featureStates, setFeatureStates] = useState<Record<string, boolean>>({});

  const { data: userFeatures, isLoading: loadingFeatures } = useUserFeatureAccessAdmin(selectedUser?.id || null);
  const updateFeatureAccess = useUpdateUserFeatureAccess();

  // Initialize feature states when user features load
  useEffect(() => {
    if (userFeatures && userFeatures.length > 0) {
      const states: Record<string, boolean> = {};
      userFeatures.forEach(f => {
        states[f.feature_key] = f.is_enabled;
      });
      setFeatureStates(states);
    } else if (selectedUser && userFeatures?.length === 0) {
      // No restrictions - all features enabled by default
      const states: Record<string, boolean> = {};
      PLATFORM_FEATURES.forEach(f => {
        states[f.key] = true;
      });
      setFeatureStates(states);
    }
  }, [userFeatures, selectedUser]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .or(`username.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`)
        .limit(10);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      toast.error('Failed to search users');
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectUser = (user: UserProfile) => {
    setSelectedUser(user);
    setUsers([]);
    setSearchQuery('');
  };

  const handleToggleFeature = (featureKey: string) => {
    setFeatureStates(prev => ({
      ...prev,
      [featureKey]: !prev[featureKey],
    }));
  };

  const handleSelectAll = () => {
    const states: Record<string, boolean> = {};
    PLATFORM_FEATURES.forEach(f => {
      states[f.key] = true;
    });
    setFeatureStates(states);
  };

  const handleDeselectAll = () => {
    const states: Record<string, boolean> = {};
    PLATFORM_FEATURES.forEach(f => {
      states[f.key] = false;
    });
    setFeatureStates(states);
  };

  const handleSave = async () => {
    if (!selectedUser) return;

    const features = Object.entries(featureStates).map(([key, enabled]) => ({
      key,
      enabled,
    }));

    try {
      await updateFeatureAccess.mutateAsync({
        userId: selectedUser.id,
        features,
      });
      toast.success(`Feature access updated for ${selectedUser.display_name || selectedUser.username}`);
    } catch (error) {
      toast.error('Failed to update feature access');
      console.error(error);
    }
  };

  const handleReset = () => {
    if (userFeatures && userFeatures.length > 0) {
      const states: Record<string, boolean> = {};
      userFeatures.forEach(f => {
        states[f.feature_key] = f.is_enabled;
      });
      setFeatureStates(states);
    }
  };

  const enabledCount = Object.values(featureStates).filter(Boolean).length;
  const totalCount = PLATFORM_FEATURES.length;

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {t('featureAccessControl')}
          </CardTitle>
          <CardDescription>
            Control which features each user can access on the platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Search */}
          <div className="space-y-4">
            <Label>Search User</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by username or display name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} disabled={isSearching}>
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
              </Button>
            </div>

            {/* Search Results */}
            {users.length > 0 && (
              <div className="border rounded-lg divide-y">
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className="w-full p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{user.display_name || user.username || 'Unknown'}</p>
                      {user.username && <p className="text-sm text-muted-foreground">@{user.username}</p>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected User */}
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{selectedUser.display_name || selectedUser.username}</p>
                    <p className="text-sm text-muted-foreground">User ID: {selectedUser.id.slice(0, 8)}...</p>
                  </div>
                </div>
                <Badge variant="outline">
                  {enabledCount}/{totalCount} features enabled
                </Badge>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  <Check className="h-4 w-4 mr-1" />
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={handleDeselectAll}>
                  <X className="h-4 w-4 mr-1" />
                  Deselect All
                </Button>
              </div>

              {/* Feature Checkboxes */}
              {loadingFeatures ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {PLATFORM_FEATURES.map((feature) => (
                    <div
                      key={feature.key}
                      className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                        featureStates[feature.key]
                          ? 'border-primary/50 bg-primary/5'
                          : 'border-border bg-muted/20'
                      }`}
                      onClick={() => handleToggleFeature(feature.key)}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={featureStates[feature.key] || false}
                          onCheckedChange={() => handleToggleFeature(feature.key)}
                        />
                        <div>
                          <Label className="cursor-pointer font-medium">{feature.label}</Label>
                          <p className="text-xs text-muted-foreground">{feature.path}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Save/Reset Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <Button onClick={handleSave} disabled={updateFeatureAccess.isPending}>
                  {updateFeatureAccess.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button variant="ghost" onClick={() => setSelectedUser(null)}>
                  Clear Selection
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
