import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Globe, Languages, MapPin, ShieldCheck, Clock } from 'lucide-react';
import { useApprovedMediators, MEDIATOR_CATEGORY_LABELS } from '@/hooks/useMediators';
import EmptyState from '@/components/EmptyState';
import { Handshake } from 'lucide-react';

const MediatorDirectory = () => {
  const { data: mediators = [], isLoading } = useApprovedMediators();

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading mediator directory…</p>;

  if (mediators.length === 0) {
    return (
      <EmptyState
        icon={Handshake}
        title="No approved mediators yet"
        description="Approved mediators appear here once administrators verify their credentials."
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {mediators.map((m) => (
        <Card key={m.id} className="surface-quiet">
          <CardContent className="pt-4 space-y-2.5 text-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium truncate">{m.full_name}</p>
                {m.organization && <p className="text-xs text-muted-foreground">{m.organization}</p>}
              </div>
              <Badge variant="outline" className="shrink-0 text-[11px]">
                {MEDIATOR_CATEGORY_LABELS[m.mediator_category]}
              </Badge>
            </div>

            {m.bio && <p className="text-muted-foreground line-clamp-2">{m.bio}</p>}

            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              {m.credential_verified && (
                <span className="inline-flex items-center gap-1 text-green-600">
                  <ShieldCheck className="w-3.5 h-3.5" /> Credentials verified
                </span>
              )}
              {m.languages.length > 0 && (
                <span className="inline-flex items-center gap-1"><Languages className="w-3.5 h-3.5" /> {m.languages.slice(0, 3).join(', ')}</span>
              )}
              {m.locations_served.length > 0 && (
                <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {m.locations_served.slice(0, 3).join(', ')}</span>
              )}
              {m.availability && (
                <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {m.availability}</span>
              )}
              <span className="inline-flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> {m.active_cases}/{m.max_active_cases} active cases</span>
            </div>

            {m.specializations.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {m.specializations.slice(0, 4).map((s) => (
                  <Badge key={s} variant="secondary" className="text-[11px] font-normal">{s}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MediatorDirectory;
