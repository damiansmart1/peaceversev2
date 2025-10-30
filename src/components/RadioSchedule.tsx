import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Radio, Mic, Music, Calendar } from 'lucide-react';

const schedule = {
  monday: [
    { time: '06:00', title: 'Morning Peace', host: 'Sarah K.', duration: '2h', type: 'Music' },
    { time: '08:00', title: 'Youth Voices', host: 'John M.', duration: '1h', type: 'Talk' },
    { time: '12:00', title: 'Midday Stories', host: 'Amina S.', duration: '1h', type: 'Stories' },
    { time: '18:00', title: 'Evening Reflection', host: 'David O.', duration: '2h', type: 'Mixed' },
  ],
  tuesday: [
    { time: '06:00', title: 'Rise & Shine', host: 'Grace N.', duration: '2h', type: 'Music' },
    { time: '10:00', title: 'Community Chat', host: 'Peter L.', duration: '1h', type: 'Talk' },
    { time: '15:00', title: 'Cultural Hour', host: 'Fatima H.', duration: '1h', type: 'Culture' },
    { time: '20:00', title: 'Night Beats', host: 'Alex R.', duration: '2h', type: 'Music' },
  ],
};

const typeColors: Record<string, string> = {
  Music: 'bg-purple-500/10 text-purple-500',
  Talk: 'bg-blue-500/10 text-blue-500',
  Stories: 'bg-green-500/10 text-green-500',
  Mixed: 'bg-orange-500/10 text-orange-500',
  Culture: 'bg-pink-500/10 text-pink-500',
};

export const RadioSchedule = () => {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-5 h-5 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Program Schedule</h2>
      </div>

      <Tabs defaultValue="monday" className="w-full">
        <TabsList className="grid w-full grid-cols-7 mb-6">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <TabsTrigger key={day} value={day.toLowerCase()}>
              {day}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="monday" className="space-y-3">
          {schedule.monday.map((program, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground min-w-[60px]">
                  <Clock className="w-4 h-4" />
                  {program.time}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{program.title}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Mic className="w-3 h-3" />
                    <span>{program.host}</span>
                    <span>•</span>
                    <span>{program.duration}</span>
                  </div>
                </div>
              </div>
              <Badge className={typeColors[program.type]}>{program.type}</Badge>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="tuesday" className="space-y-3">
          {schedule.tuesday.map((program, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground min-w-[60px]">
                  <Clock className="w-4 h-4" />
                  {program.time}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{program.title}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Mic className="w-3 h-3" />
                    <span>{program.host}</span>
                    <span>•</span>
                    <span>{program.duration}</span>
                  </div>
                </div>
              </div>
              <Badge className={typeColors[program.type]}>{program.type}</Badge>
            </div>
          ))}
        </TabsContent>

        {['wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
          <TabsContent key={day} value={day} className="text-center py-8 text-muted-foreground">
            Schedule coming soon for {day.charAt(0).toUpperCase() + day.slice(1)}
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  );
};
