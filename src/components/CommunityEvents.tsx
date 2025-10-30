import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Clock, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const mockEvents = [
  {
    id: '1',
    title: 'Peace Workshop: Conflict Resolution',
    description: 'Learn practical skills for peaceful conflict resolution in communities',
    date: new Date(Date.now() + 86400000 * 3),
    location: 'Community Center, Nairobi',
    attendees: 45,
    maxAttendees: 100,
    category: 'Workshop',
    isOnline: false,
  },
  {
    id: '2',
    title: 'Virtual Town Hall: Youth Voices',
    description: 'Monthly gathering to discuss youth perspectives on peace-building',
    date: new Date(Date.now() + 86400000 * 7),
    location: 'Online via Zoom',
    attendees: 120,
    maxAttendees: 500,
    category: 'Town Hall',
    isOnline: true,
  },
  {
    id: '3',
    title: 'Community Art Exhibition',
    description: 'Showcase of peace-themed artwork from local artists',
    date: new Date(Date.now() + 86400000 * 14),
    location: 'National Museum, Kampala',
    attendees: 78,
    maxAttendees: 200,
    category: 'Exhibition',
    isOnline: false,
  },
];

export const CommunityEvents = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Upcoming Events</h2>
          <p className="text-muted-foreground">Join community gatherings and workshops</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create Event
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockEvents.map((event) => (
          <Card key={event.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="secondary" className="mb-2">{event.category}</Badge>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{event.title}</h3>
                  <p className="text-muted-foreground text-sm">{event.description}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDistanceToNow(event.date, { addSuffix: true })}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{event.location}</span>
                  {event.isOnline && <Badge variant="outline" className="ml-2">Online</Badge>}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{event.attendees} / {event.maxAttendees} attendees</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button className="flex-1">Register</Button>
                <Button variant="outline">Share</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
