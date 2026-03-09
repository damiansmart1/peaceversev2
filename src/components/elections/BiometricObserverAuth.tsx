import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { 
  Fingerprint, 
  Shield, 
  CheckCircle2, 
  XCircle,
  Smartphone,
  Key,
  Users,
  Clock,
  AlertTriangle,
  Lock,
  Unlock,
  Camera,
  ScanFace,
  ShieldCheck,
  UserCheck,
  RefreshCw,
  Settings,
  Activity
} from 'lucide-react';

interface BiometricCredential {
  id: string;
  observerId: string;
  observerName: string;
  credentialType: 'fingerprint' | 'face' | 'webauthn';
  deviceName: string;
  registeredAt: string;
  lastUsed: string;
  isActive: boolean;
  trustLevel: 'high' | 'medium' | 'low';
}

interface AuthenticationLog {
  id: string;
  observerId: string;
  observerName: string;
  method: string;
  success: boolean;
  timestamp: string;
  location?: string;
  deviceInfo?: string;
  failureReason?: string;
}

interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  value?: string | number;
}

const BiometricObserverAuth: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [isRegistering, setIsRegistering] = useState(false);
  const [webAuthnSupported, setWebAuthnSupported] = useState(
    typeof window !== 'undefined' && !!window.PublicKeyCredential
  );

  const [credentials] = useState<BiometricCredential[]>([
    {
      id: '1',
      observerId: 'OBS-001',
      observerName: 'Dr. Sarah Kimani',
      credentialType: 'webauthn',
      deviceName: 'MacBook Pro Touch ID',
      registeredAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      lastUsed: new Date(Date.now() - 3600000).toISOString(),
      isActive: true,
      trustLevel: 'high'
    },
    {
      id: '2',
      observerId: 'OBS-002',
      observerName: 'James Okonkwo',
      credentialType: 'fingerprint',
      deviceName: 'Samsung Galaxy S23',
      registeredAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      lastUsed: new Date(Date.now() - 7200000).toISOString(),
      isActive: true,
      trustLevel: 'high'
    },
    {
      id: '3',
      observerId: 'OBS-003',
      observerName: 'Maria Santos',
      credentialType: 'face',
      deviceName: 'iPhone 15 Pro',
      registeredAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      lastUsed: new Date(Date.now() - 18000000).toISOString(),
      isActive: true,
      trustLevel: 'medium'
    }
  ]);

  const [authLogs] = useState<AuthenticationLog[]>([
    {
      id: '1',
      observerId: 'OBS-001',
      observerName: 'Dr. Sarah Kimani',
      method: 'WebAuthn (Touch ID)',
      success: true,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      location: 'Nairobi, Kenya',
      deviceInfo: 'MacBook Pro, Safari'
    },
    {
      id: '2',
      observerId: 'OBS-004',
      observerName: 'Unknown Attempt',
      method: 'WebAuthn',
      success: false,
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      location: 'Lagos, Nigeria',
      failureReason: 'Invalid credential signature'
    },
    {
      id: '3',
      observerId: 'OBS-002',
      observerName: 'James Okonkwo',
      method: 'Fingerprint',
      success: true,
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      location: 'Kampala, Uganda',
      deviceInfo: 'Samsung Galaxy S23, Chrome'
    }
  ]);

  const [securityPolicies, setSecurityPolicies] = useState<SecurityPolicy[]>([
    {
      id: '1',
      name: 'Require Biometric for Result Submission',
      description: 'All result submissions must be authenticated with biometric verification',
      isEnabled: true
    },
    {
      id: '2',
      name: 'Multi-Factor Authentication',
      description: 'Require both biometric and PIN for critical operations',
      isEnabled: true
    },
    {
      id: '3',
      name: 'Device Binding',
      description: 'Lock credentials to registered devices only',
      isEnabled: true
    },
    {
      id: '4',
      name: 'Session Timeout',
      description: 'Automatically require re-authentication after inactivity',
      isEnabled: true,
      value: 30
    },
    {
      id: '5',
      name: 'Location Verification',
      description: 'Verify observer location matches assigned polling station',
      isEnabled: false
    }
  ]);

  const stats = {
    totalCredentials: 847,
    activeObservers: 823,
    authSuccess: 98.7,
    failedAttempts: 12,
    registeredDevices: 892,
    webAuthnEnabled: 76
  };

  const handleRegisterWebAuthn = async () => {
    if (!webAuthnSupported) {
      toast({
        title: 'WebAuthn Not Supported',
        description: 'Your browser does not support WebAuthn authentication',
        variant: 'destructive'
      });
      return;
    }

    setIsRegistering(true);
    
    try {
      // WebAuthn registration would happen here
      // This is a simulation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Biometric Registered',
        description: 'Your biometric credential has been successfully registered'
      });
    } catch (error) {
      toast({
        title: 'Registration Failed',
        description: 'Could not register biometric credential. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleAuthenticateWebAuthn = async () => {
    if (!webAuthnSupported) {
      toast({
        title: 'WebAuthn Not Supported',
        description: 'Your browser does not support WebAuthn authentication',
        variant: 'destructive'
      });
      return;
    }

    try {
      // WebAuthn authentication would happen here
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: 'Authentication Successful',
        description: 'Biometric verification completed'
      });
    } catch (error) {
      toast({
        title: 'Authentication Failed',
        description: 'Biometric verification failed. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const togglePolicy = (id: string) => {
    setSecurityPolicies(prev => 
      prev.map(p => p.id === id ? { ...p, isEnabled: !p.isEnabled } : p)
    );
  };

  const getCredentialIcon = (type: string) => {
    switch (type) {
      case 'fingerprint':
        return <Fingerprint className="h-4 w-4" />;
      case 'face':
        return <ScanFace className="h-4 w-4" />;
      case 'webauthn':
        return <Key className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getTrustBadge = (level: string) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'outline'; color: string }> = {
      high: { variant: 'default', color: 'text-green-500' },
      medium: { variant: 'secondary', color: 'text-yellow-500' },
      low: { variant: 'outline', color: 'text-red-500' }
    };
    const c = config[level] || config.low;
    return <Badge variant={c.variant}>{level.toUpperCase()}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Fingerprint className="h-6 w-6" />
            Biometric Observer Authentication
          </h2>
          <p className="text-muted-foreground">
            WebAuthn/FIDO2 passwordless authentication for election observers
          </p>
        </div>
        <div className="flex items-center gap-2">
          {webAuthnSupported ? (
            <Badge variant="default" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              WebAuthn Supported
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1">
              <XCircle className="h-3 w-3" />
              WebAuthn Not Supported
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeObservers}</p>
                <p className="text-xs text-muted-foreground">Active Observers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-green-500/10">
                <ShieldCheck className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.authSuccess}%</p>
                <p className="text-xs text-muted-foreground">Auth Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Smartphone className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.registeredDevices}</p>
                <p className="text-xs text-muted-foreground">Registered Devices</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.failedAttempts}</p>
                <p className="text-xs text-muted-foreground">Failed Attempts (24h)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="credentials">Credentials</TabsTrigger>
          <TabsTrigger value="logs">Auth Logs</TabsTrigger>
          <TabsTrigger value="policies">Security Policies</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Authentication</CardTitle>
                <CardDescription>Test biometric authentication flow</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full gap-2" 
                  size="lg"
                  onClick={handleAuthenticateWebAuthn}
                  disabled={!webAuthnSupported}
                >
                  <Fingerprint className="h-5 w-5" />
                  Authenticate with Biometric
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={handleRegisterWebAuthn}
                  disabled={isRegistering || !webAuthnSupported}
                >
                  {isRegistering ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <>
                      <Key className="h-4 w-4" />
                      Register New Credential
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Supported Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Supported Authentication Methods</CardTitle>
                <CardDescription>FIDO2/WebAuthn compatible authenticators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Fingerprint className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Fingerprint</p>
                        <p className="text-xs text-muted-foreground">Touch ID, Windows Hello</p>
                      </div>
                    </div>
                    <Badge variant="default">Supported</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <ScanFace className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium">Face Recognition</p>
                        <p className="text-xs text-muted-foreground">Face ID, Windows Hello Face</p>
                      </div>
                    </div>
                    <Badge variant="default">Supported</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Key className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="font-medium">Security Key</p>
                        <p className="text-xs text-muted-foreground">YubiKey, Google Titan</p>
                      </div>
                    </div>
                    <Badge variant="default">Supported</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium">Platform Authenticator</p>
                        <p className="text-xs text-muted-foreground">Built-in device biometrics</p>
                      </div>
                    </div>
                    <Badge variant="default">Supported</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Registration Stats */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Credential Distribution</CardTitle>
                <CardDescription>Breakdown of registered authentication methods</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg border bg-muted/30">
                    <Fingerprint className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">412</p>
                    <p className="text-sm text-muted-foreground">Fingerprint</p>
                    <Progress value={49} className="mt-2 h-1" />
                  </div>
                  <div className="text-center p-4 rounded-lg border bg-muted/30">
                    <ScanFace className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <p className="text-2xl font-bold">298</p>
                    <p className="text-sm text-muted-foreground">Face ID</p>
                    <Progress value={35} className="mt-2 h-1" />
                  </div>
                  <div className="text-center p-4 rounded-lg border bg-muted/30">
                    <Key className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                    <p className="text-2xl font-bold">137</p>
                    <p className="text-sm text-muted-foreground">Security Key</p>
                    <Progress value={16} className="mt-2 h-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="credentials" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Registered Credentials</CardTitle>
                  <CardDescription>All registered biometric credentials</CardDescription>
                </div>
                <Input placeholder="Search observers..." className="w-64" />
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {credentials.map(cred => (
                    <div key={cred.id} className="p-4 rounded-lg border bg-card">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {cred.observerName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{cred.observerName}</p>
                            <p className="text-xs text-muted-foreground">
                              Observer ID: {cred.observerId}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getTrustBadge(cred.trustLevel)}
                          <Badge variant={cred.isActive ? 'default' : 'secondary'}>
                            {cred.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Type</p>
                          <div className="flex items-center gap-1">
                            {getCredentialIcon(cred.credentialType)}
                            <span className="capitalize">{cred.credentialType}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Device</p>
                          <p>{cred.deviceName}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Registered</p>
                          <p>{new Date(cred.registeredAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Last Used</p>
                          <p>{new Date(cred.lastUsed).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Authentication Logs</CardTitle>
              <CardDescription>Recent authentication attempts</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {authLogs.map(log => (
                    <div key={log.id} className="p-4 rounded-lg border bg-card">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {log.success ? (
                            <div className="p-2 rounded-full bg-green-500/10">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            </div>
                          ) : (
                            <div className="p-2 rounded-full bg-red-500/10">
                              <XCircle className="h-4 w-4 text-red-500" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{log.observerName}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(log.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant={log.success ? 'default' : 'destructive'}>
                          {log.success ? 'Success' : 'Failed'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Method</p>
                          <p>{log.method}</p>
                        </div>
                        {log.location && (
                          <div>
                            <p className="text-muted-foreground">Location</p>
                            <p>{log.location}</p>
                          </div>
                        )}
                        {log.deviceInfo && (
                          <div>
                            <p className="text-muted-foreground">Device</p>
                            <p>{log.deviceInfo}</p>
                          </div>
                        )}
                      </div>
                      {log.failureReason && (
                        <div className="mt-3 p-2 rounded bg-red-500/10 text-sm text-red-500">
                          <AlertTriangle className="h-4 w-4 inline mr-1" />
                          {log.failureReason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Security Policies
              </CardTitle>
              <CardDescription>
                Configure authentication requirements and security settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityPolicies.map(policy => (
                  <div 
                    key={policy.id} 
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${policy.isEnabled ? 'bg-green-500/10' : 'bg-muted'}`}>
                        {policy.isEnabled ? (
                          <Lock className="h-4 w-4 text-green-500" />
                        ) : (
                          <Unlock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{policy.name}</p>
                        <p className="text-sm text-muted-foreground">{policy.description}</p>
                        {policy.value && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Current value: {policy.value} minutes
                          </p>
                        )}
                      </div>
                    </div>
                    <Switch 
                      checked={policy.isEnabled} 
                      onCheckedChange={() => togglePolicy(policy.id)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BiometricObserverAuth;
