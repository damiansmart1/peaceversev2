import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Link2, 
  Shield, 
  CheckCircle2, 
  Clock, 
  Hash, 
  FileText,
  Search,
  Download,
  ExternalLink,
  Lock,
  Fingerprint,
  Database,
  Activity,
  AlertTriangle,
  Copy,
  Eye
} from 'lucide-react';

interface AuditBlock {
  id: string;
  blockNumber: number;
  timestamp: string;
  previousHash: string;
  currentHash: string;
  merkleRoot: string;
  transactionCount: number;
  dataType: 'result' | 'incident' | 'observer' | 'verification';
  electionId: string;
  stationId?: string;
  verifiedAt?: string;
  anchoredToPublicChain?: boolean;
  publicChainTxHash?: string;
}

interface VerificationRecord {
  id: string;
  recordType: string;
  originalHash: string;
  verifiedHash: string;
  isValid: boolean;
  verifiedAt: string;
  verifiedBy: string;
}

const BlockchainAuditTrail: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('chain');
  const [searchQuery, setSearchQuery] = useState('');
  const [verifyHash, setVerifyHash] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{valid: boolean; message: string} | null>(null);

  // Mock blockchain data
  const [blocks] = useState<AuditBlock[]>([
    {
      id: '1',
      blockNumber: 1547,
      timestamp: new Date(Date.now() - 60000).toISOString(),
      previousHash: '8a7f3c2b1e9d4f6a5c3b2e1d8f7a6c5b4e3d2f1a9b8c7d6e5f4a3b2c1d0e9f8',
      currentHash: '2c4e6f8a0b1d3e5f7a9c2b4d6e8f0a1c3e5d7f9b1a3c5d7e9f1b3d5f7a9c1e3',
      merkleRoot: '5f7e9d1b3a5c7e9f1b3d5f7a9c1e3d5f7b9a1c3e5d7f9b1a3c5d7e9f1b3d5f',
      transactionCount: 12,
      dataType: 'result',
      electionId: 'KE-2024-PRES',
      stationId: 'PS-NAIROBI-001',
      anchoredToPublicChain: true,
      publicChainTxHash: '0x8f7a6c5b4e3d2f1a9b8c7d6e5f4a3b2c1d0e9f87a6c5b4e3d2f1a9b8c7d6e5f'
    },
    {
      id: '2',
      blockNumber: 1546,
      timestamp: new Date(Date.now() - 180000).toISOString(),
      previousHash: '1d3e5f7a9c2b4d6e8f0a1c3e5d7f9b1a3c5d7e9f1b3d5f7a9c1e3d5f7b9a1c',
      currentHash: '8a7f3c2b1e9d4f6a5c3b2e1d8f7a6c5b4e3d2f1a9b8c7d6e5f4a3b2c1d0e9f8',
      merkleRoot: '3a5c7e9f1b3d5f7a9c1e3d5f7b9a1c3e5d7f9b1a3c5d7e9f1b3d5f7a9c1e3d',
      transactionCount: 8,
      dataType: 'incident',
      electionId: 'KE-2024-PRES',
      anchoredToPublicChain: true,
      publicChainTxHash: '0x7a6c5b4e3d2f1a9b8c7d6e5f4a3b2c1d0e9f87a6c5b4e3d2f1a9b8c7d6e5f4'
    },
    {
      id: '3',
      blockNumber: 1545,
      timestamp: new Date(Date.now() - 300000).toISOString(),
      previousHash: '9c2b4d6e8f0a1c3e5d7f9b1a3c5d7e9f1b3d5f7a9c1e3d5f7b9a1c3e5d7f9b',
      currentHash: '1d3e5f7a9c2b4d6e8f0a1c3e5d7f9b1a3c5d7e9f1b3d5f7a9c1e3d5f7b9a1c',
      merkleRoot: '7e9f1b3d5f7a9c1e3d5f7b9a1c3e5d7f9b1a3c5d7e9f1b3d5f7a9c1e3d5f7b',
      transactionCount: 15,
      dataType: 'verification',
      electionId: 'KE-2024-PRES',
      anchoredToPublicChain: false
    }
  ]);

  const [verificationRecords] = useState<VerificationRecord[]>([
    {
      id: '1',
      recordType: 'Election Result',
      originalHash: '2c4e6f8a0b1d3e5f7a9c2b4d6e8f0a1c3e5d7f9b1a3c5d7e9f1b3d5f7a9c1e3',
      verifiedHash: '2c4e6f8a0b1d3e5f7a9c2b4d6e8f0a1c3e5d7f9b1a3c5d7e9f1b3d5f7a9c1e3',
      isValid: true,
      verifiedAt: new Date(Date.now() - 30000).toISOString(),
      verifiedBy: 'International Observer - EU EOM'
    },
    {
      id: '2',
      recordType: 'Incident Report',
      originalHash: '8a7f3c2b1e9d4f6a5c3b2e1d8f7a6c5b4e3d2f1a9b8c7d6e5f4a3b2c1d0e9f8',
      verifiedHash: '8a7f3c2b1e9d4f6a5c3b2e1d8f7a6c5b4e3d2f1a9b8c7d6e5f4a3b2c1d0e9f8',
      isValid: true,
      verifiedAt: new Date(Date.now() - 120000).toISOString(),
      verifiedBy: 'Carter Center Observer'
    }
  ]);

  const stats = {
    totalBlocks: 1547,
    transactionsRecorded: 18432,
    anchoredBlocks: 1523,
    pendingAnchor: 24,
    chainIntegrity: 100,
    lastAnchorTime: '12 minutes ago',
    publicChain: 'Ethereum Sepolia',
    hashAlgorithm: 'SHA-256'
  };

  const handleVerifyHash = async () => {
    if (!verifyHash.trim()) {
      toast({
        title: 'Hash Required',
        description: 'Please enter a hash to verify',
        variant: 'destructive'
      });
      return;
    }

    setIsVerifying(true);
    // Simulate verification
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const isValid = blocks.some(b => 
      b.currentHash === verifyHash || 
      b.merkleRoot === verifyHash ||
      b.publicChainTxHash === verifyHash
    );

    setVerificationResult({
      valid: isValid,
      message: isValid 
        ? 'Hash verified successfully. Data integrity confirmed.'
        : 'Hash not found in the audit chain. This may indicate data tampering or an invalid hash.'
    });
    setIsVerifying(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Hash copied to clipboard'
    });
  };

  const getDataTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      result: 'bg-green-500/10 text-green-500',
      incident: 'bg-orange-500/10 text-orange-500',
      observer: 'bg-blue-500/10 text-blue-500',
      verification: 'bg-purple-500/10 text-purple-500'
    };
    return (
      <Badge variant="outline" className={colors[type] || ''}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Link2 className="h-6 w-6" />
            Blockchain Audit Trail
          </h2>
          <p className="text-muted-foreground">
            Immutable cryptographic record of all election data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Database className="h-3 w-3" />
            {stats.publicChain}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Hash className="h-3 w-3" />
            {stats.hashAlgorithm}
          </Badge>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Database className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalBlocks.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Blocks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.anchoredBlocks.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Anchored to Public Chain</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <FileText className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.transactionsRecorded.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Transactions Recorded</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Shield className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.chainIntegrity}%</p>
                <p className="text-xs text-muted-foreground">Chain Integrity</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chain">Block Chain</TabsTrigger>
          <TabsTrigger value="verify">Verify Data</TabsTrigger>
          <TabsTrigger value="records">Verification Records</TabsTrigger>
          <TabsTrigger value="anchoring">Public Anchoring</TabsTrigger>
        </TabsList>

        <TabsContent value="chain" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Audit Block Chain</CardTitle>
                  <CardDescription>Chronological chain of all election data blocks</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search by hash, block, or station..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64"
                  />
                  <Button variant="outline" size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {blocks.map((block, index) => (
                    <div key={block.id} className="relative">
                      {/* Chain connector */}
                      {index < blocks.length - 1 && (
                        <div className="absolute left-6 top-full w-0.5 h-4 bg-border" />
                      )}
                      
                      <div className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-primary/10">
                              <Hash className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-bold">Block #{block.blockNumber}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(block.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getDataTypeBadge(block.dataType)}
                            {block.anchoredToPublicChain && (
                              <Badge variant="default" className="gap-1">
                                <Link2 className="h-3 w-3" />
                                Anchored
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-2">
                            <div>
                              <Label className="text-xs text-muted-foreground">Current Hash</Label>
                              <div className="flex items-center gap-2">
                                <code className="text-xs bg-muted/50 p-1 rounded truncate flex-1">
                                  {block.currentHash}
                                </code>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6"
                                  onClick={() => copyToClipboard(block.currentHash)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Previous Hash</Label>
                              <code className="text-xs bg-muted/50 p-1 rounded truncate block">
                                {block.previousHash}
                              </code>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <Label className="text-xs text-muted-foreground">Merkle Root</Label>
                              <code className="text-xs bg-muted/50 p-1 rounded truncate block">
                                {block.merkleRoot}
                              </code>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <Label className="text-xs text-muted-foreground">Transactions</Label>
                                <p className="font-medium">{block.transactionCount}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Election</Label>
                                <p className="font-mono text-xs">{block.electionId}</p>
                              </div>
                              {block.stationId && (
                                <div>
                                  <Label className="text-xs text-muted-foreground">Station</Label>
                                  <p className="font-mono text-xs">{block.stationId}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {block.publicChainTxHash && (
                          <div className="mt-4 pt-4 border-t">
                            <div className="flex items-center justify-between">
                              <div>
                                <Label className="text-xs text-muted-foreground">Public Chain TX</Label>
                                <code className="text-xs bg-muted/50 p-1 rounded block">
                                  {block.publicChainTxHash}
                                </code>
                              </div>
                              <Button variant="outline" size="sm" className="gap-1" onClick={() => {
                                window.open(`https://sepolia.etherscan.io/tx/${block.publicChainTxHash}`, '_blank', 'noopener,noreferrer');
                              }}>
                                <ExternalLink className="h-3 w-3" />
                                View on Explorer
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verify" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Fingerprint className="h-5 w-5" />
                  Hash Verification
                </CardTitle>
                <CardDescription>
                  Verify the integrity of any election data by its hash
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Enter Hash to Verify</Label>
                  <Input
                    placeholder="Enter SHA-256 hash or transaction hash..."
                    value={verifyHash}
                    onChange={(e) => setVerifyHash(e.target.value)}
                    className="mt-2 font-mono"
                  />
                </div>
                <Button 
                  onClick={handleVerifyHash} 
                  disabled={isVerifying}
                  className="w-full"
                >
                  {isVerifying ? (
                    <>
                      <Activity className="h-4 w-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Verify Hash
                    </>
                  )}
                </Button>

                {verificationResult && (
                  <div className={`p-4 rounded-lg border ${
                    verificationResult.valid 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : 'bg-red-500/10 border-red-500/30'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {verificationResult.valid ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      )}
                      <span className={`font-medium ${
                        verificationResult.valid ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {verificationResult.valid ? 'Verification Successful' : 'Verification Failed'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {verificationResult.message}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Cryptographic Standards
                </CardTitle>
                <CardDescription>
                  Security specifications for the audit trail
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 rounded-lg border bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Hash Algorithm</span>
                      <Badge>SHA-256</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      256-bit cryptographic hash function providing collision resistance
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Merkle Tree</span>
                      <Badge variant="outline">Binary Hash Tree</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Efficient verification of transaction integrity within blocks
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Public Anchoring</span>
                      <Badge variant="outline">Ethereum (Sepolia)</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Periodic anchoring to public blockchain for independent verification
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Digital Signatures</span>
                      <Badge variant="outline">ECDSA P-256</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Elliptic curve signatures for transaction authentication
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="records" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Verification Records</CardTitle>
              <CardDescription>
                Log of all external verification requests and results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {verificationRecords.map(record => (
                    <div key={record.id} className="p-4 rounded-lg border bg-card">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {record.isValid ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                          )}
                          <div>
                            <p className="font-medium">{record.recordType}</p>
                            <p className="text-xs text-muted-foreground">
                              Verified by {record.verifiedBy}
                            </p>
                          </div>
                        </div>
                        <Badge variant={record.isValid ? 'default' : 'destructive'}>
                          {record.isValid ? 'Valid' : 'Invalid'}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <Label className="text-xs text-muted-foreground">Original Hash</Label>
                          <code className="text-xs bg-muted/50 p-1 rounded block truncate">
                            {record.originalHash}
                          </code>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Verified At</Label>
                          <p>{new Date(record.verifiedAt).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anchoring" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Link2 className="h-5 w-5" />
                  Public Chain Anchoring
                </CardTitle>
                <CardDescription>
                  Status of blockchain anchoring to Ethereum
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Anchoring Progress</span>
                    <span>{Math.round((stats.anchoredBlocks / stats.totalBlocks) * 100)}%</span>
                  </div>
                  <Progress value={(stats.anchoredBlocks / stats.totalBlocks) * 100} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg border bg-muted/30 text-center">
                    <p className="text-2xl font-bold text-green-500">{stats.anchoredBlocks}</p>
                    <p className="text-xs text-muted-foreground">Anchored Blocks</p>
                  </div>
                  <div className="p-3 rounded-lg border bg-muted/30 text-center">
                    <p className="text-2xl font-bold text-orange-500">{stats.pendingAnchor}</p>
                    <p className="text-xs text-muted-foreground">Pending Anchor</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Last Anchor</span>
                    <span className="text-sm text-muted-foreground">{stats.lastAnchorTime}</span>
                  </div>
                </div>

                <Button className="w-full">
                  <Link2 className="h-4 w-4 mr-2" />
                  Trigger Manual Anchor
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Public Verification Portal
                </CardTitle>
                <CardDescription>
                  Enable independent verification by third parties
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg border bg-muted/30">
                  <p className="text-sm mb-3">
                    The public verification portal allows anyone to verify election data 
                    integrity using cryptographic proofs anchored to the Ethereum blockchain.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>No account required</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Merkle proof verification</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Cross-reference with Etherscan</span>
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="w-full gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Open Public Portal
                </Button>

                <Button variant="outline" className="w-full gap-2">
                  <Download className="h-4 w-4" />
                  Export Audit Proofs
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BlockchainAuditTrail;
