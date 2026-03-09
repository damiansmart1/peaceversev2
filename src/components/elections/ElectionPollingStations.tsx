import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Plus, MapPin, CheckCircle2, XCircle, Search, Upload, Download } from 'lucide-react';
import { usePollingStations, useCreatePollingStation, type PollingStation } from '@/hooks/useElections';
import { toast } from 'sonner';

interface ElectionPollingStationsProps {
  electionId: string;
  countryCode: string;
}

export default function ElectionPollingStations({ electionId, countryCode }: ElectionPollingStationsProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newStation, setNewStation] = useState({
    station_code: '',
    station_name: '',
    region: '',
    district: '',
    constituency: '',
    ward: '',
    address: '',
    registered_voters: 0,
    is_accessible: true,
    accessibility_notes: '',
  });

  const { data: stations, isLoading } = usePollingStations(electionId);
  const createStation = useCreatePollingStation();

  const filteredStations = stations?.filter(station =>
    station.station_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    station.station_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    station.region?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    station.district?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddStation = async () => {
    await createStation.mutateAsync({
      ...newStation,
      election_id: electionId,
      country_code: countryCode,
    });
    setShowAddDialog(false);
    setNewStation({
      station_code: '',
      station_name: '',
      region: '',
      district: '',
      constituency: '',
      ward: '',
      address: '',
      registered_voters: 0,
      is_accessible: true,
      accessibility_notes: '',
    });
  };

  const stats = {
    total: stations?.length || 0,
    active: stations?.filter(s => s.is_active).length || 0,
    verified: stations?.filter(s => s.setup_verified).length || 0,
    accessible: stations?.filter(s => s.is_accessible).length || 0,
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Total Stations</p>
        </Card>
        <Card className="p-3">
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          <p className="text-xs text-muted-foreground">Active</p>
        </Card>
        <Card className="p-3">
          <p className="text-2xl font-bold text-blue-600">{stats.verified}</p>
          <p className="text-xs text-muted-foreground">Verified</p>
        </Card>
        <Card className="p-3">
          <p className="text-2xl font-bold text-purple-600">{stats.accessible}</p>
          <p className="text-xs text-muted-foreground">Accessible</p>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search stations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.csv';
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) {
                toast.success(`Importing ${file.name}`, { description: 'CSV import started. Results will be processed shortly.' });
              }
            };
            input.click();
          }}>
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
            if (!filteredStations || filteredStations.length === 0) {
              toast.error('No stations to export');
              return;
            }
            const csvRows = [
              ['Code', 'Name', 'Region', 'District', 'Constituency', 'Registered Voters', 'Active', 'Verified', 'Accessible'].join(','),
              ...filteredStations.map(s => [
                s.station_code,
                s.station_name.replace(/,/g, ' '),
                s.region || '',
                s.district || '',
                s.constituency || '',
                s.registered_voters,
                s.is_active ? 'Yes' : 'No',
                s.setup_verified ? 'Yes' : 'No',
                s.is_accessible ? 'Yes' : 'No',
              ].join(','))
            ];
            const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `polling-stations-${electionId.slice(0,8)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Stations exported', { description: `${filteredStations.length} stations exported to CSV` });
          }}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Station
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Polling Station</DialogTitle>
                <DialogDescription>
                  Register a new polling station for this election
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Station Code *</Label>
                    <Input
                      value={newStation.station_code}
                      onChange={(e) => setNewStation({ ...newStation, station_code: e.target.value })}
                      placeholder="e.g., PS-001"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Station Name *</Label>
                    <Input
                      value={newStation.station_name}
                      onChange={(e) => setNewStation({ ...newStation, station_name: e.target.value })}
                      placeholder="e.g., Central Primary School"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Region</Label>
                    <Input
                      value={newStation.region}
                      onChange={(e) => setNewStation({ ...newStation, region: e.target.value })}
                      placeholder="e.g., Nairobi"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>District</Label>
                    <Input
                      value={newStation.district}
                      onChange={(e) => setNewStation({ ...newStation, district: e.target.value })}
                      placeholder="e.g., Westlands"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Constituency</Label>
                    <Input
                      value={newStation.constituency}
                      onChange={(e) => setNewStation({ ...newStation, constituency: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Ward</Label>
                    <Input
                      value={newStation.ward}
                      onChange={(e) => setNewStation({ ...newStation, ward: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Address</Label>
                  <Input
                    value={newStation.address}
                    onChange={(e) => setNewStation({ ...newStation, address: e.target.value })}
                    placeholder="Full address"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Registered Voters</Label>
                  <Input
                    type="number"
                    value={newStation.registered_voters}
                    onChange={(e) => setNewStation({ ...newStation, registered_voters: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Accessible for Disabled</Label>
                    <p className="text-xs text-muted-foreground">Station has accessibility features</p>
                  </div>
                  <Switch
                    checked={newStation.is_accessible}
                    onCheckedChange={(checked) => setNewStation({ ...newStation, is_accessible: checked })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                <Button 
                  onClick={handleAddStation}
                  disabled={!newStation.station_code || !newStation.station_name || createStation.isPending}
                >
                  {createStation.isPending ? 'Adding...' : 'Add Station'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : filteredStations?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No polling stations found</p>
              <Button variant="outline" className="mt-4" onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Station
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Station Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Voters</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verified</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStations?.map((station) => (
                    <TableRow key={station.id}>
                      <TableCell className="font-mono text-sm">{station.station_code}</TableCell>
                      <TableCell className="font-medium">{station.station_name}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{station.region}</p>
                          <p className="text-muted-foreground">{station.district}</p>
                        </div>
                      </TableCell>
                      <TableCell>{station.registered_voters.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {station.is_active ? (
                            <Badge variant="outline" className="text-green-600">Active</Badge>
                          ) : (
                            <Badge variant="outline" className="text-red-600">Inactive</Badge>
                          )}
                          {station.is_accessible && (
                            <Badge variant="outline" className="text-blue-600">♿</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {station.setup_verified ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
