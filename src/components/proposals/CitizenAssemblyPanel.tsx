import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Users, MapPin, Globe } from 'lucide-react';
import { useAssemblies, useRegisterForAssembly } from '@/hooks/useWorldClassProposals';
import { format } from 'date-fns';

interface Props { proposalId?: string; }

const CitizenAssemblyPanel = ({ proposalId }: Props) => {
  const { data: assemblies = [], isLoading } = useAssemblies(proposalId);
  const register = useRegisterForAssembly();

  if (isLoading) return null;
  if (!assemblies.length) return null;

  return (
    <Card className="border-blue-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 flex-wrap">
          <Users className="w-5 h-5 text-blue-600" />
          Citizen Assemblies
          <Badge variant="outline" className="text-xs">IAP2 Collaborate</Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Deliberative sessions where randomly-selected citizens shape policy together.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {assemblies.map((a: any) => (
          <div key={a.id} className="p-4 border rounded-lg space-y-2">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <h4 className="font-semibold">{a.title}</h4>
              <Badge>{a.status.replace('_', ' ')}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{a.description}</p>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{format(new Date(a.scheduled_start), 'PPp')}</span>
              <span className="flex items-center gap-1">{a.meeting_format === 'online' ? <Globe className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}{a.meeting_format}</span>
              <span className="flex items-center gap-1"><Users className="w-3 h-3" />Max {a.max_participants}</span>
            </div>
            {a.host_organization && <p className="text-xs">Hosted by: <span className="font-medium">{a.host_organization}</span></p>}
            <Button
              size="sm"
              onClick={() => register.mutate(a.id)}
              disabled={register.isPending || a.status === 'completed' || a.status === 'cancelled'}
            >
              Register Interest
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default CitizenAssemblyPanel;
