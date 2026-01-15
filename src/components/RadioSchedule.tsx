import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Radio, Mic, Music, Calendar } from 'lucide-react';
import { useTranslationContext } from './TranslationProvider';

const schedule = {
  monday: [
    { time: '06:00', titleKey: 'radio.schedule.morningPeace', host: 'Sarah K.', duration: '2h', type: 'Music' },
    { time: '08:00', titleKey: 'radio.schedule.youthVoices', host: 'John M.', duration: '1h', type: 'Talk' },
    { time: '12:00', titleKey: 'radio.schedule.middayStories', host: 'Amina S.', duration: '1h', type: 'Stories' },
    { time: '18:00', titleKey: 'radio.schedule.eveningReflection', host: 'David O.', duration: '2h', type: 'Mixed' },
  ],
  tuesday: [
    { time: '06:00', titleKey: 'radio.schedule.riseAndShine', host: 'Grace N.', duration: '2h', type: 'Music' },
    { time: '10:00', titleKey: 'radio.schedule.communityChat', host: 'Peter L.', duration: '1h', type: 'Talk' },
    { time: '15:00', titleKey: 'radio.schedule.culturalHour', host: 'Fatima H.', duration: '1h', type: 'Culture' },
    { time: '20:00', titleKey: 'radio.schedule.nightBeats', host: 'Alex R.', duration: '2h', type: 'Music' },
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
  const { t } = useTranslationContext();
  
  const days = [
    { key: 'mon', label: t('time.days.mon') },
    { key: 'tue', label: t('time.days.tue') },
    { key: 'wed', label: t('time.days.wed') },
    { key: 'thu', label: t('time.days.thu') },
    { key: 'fri', label: t('time.days.fri') },
    { key: 'sat', label: t('time.days.sat') },
    { key: 'sun', label: t('time.days.sun') },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-5 h-5 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">{t('radio.schedule.title')}</h2>
      </div>

      <Tabs defaultValue="mon" className="w-full">
        <TabsList className="grid w-full grid-cols-7 mb-6">
          {days.map((day) => (
            <TabsTrigger key={day.key} value={day.key}>
              {day.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="mon" className="space-y-3">
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
                  <h4 className="font-semibold text-foreground">{t(program.titleKey)}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Mic className="w-3 h-3" />
                    <span>{program.host}</span>
                    <span>•</span>
                    <span>{program.duration}</span>
                  </div>
                </div>
              </div>
              <Badge className={typeColors[program.type]}>{t(`radio.schedule.types.${program.type.toLowerCase()}`)}</Badge>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="tue" className="space-y-3">
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
                  <h4 className="font-semibold text-foreground">{t(program.titleKey)}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Mic className="w-3 h-3" />
                    <span>{program.host}</span>
                    <span>•</span>
                    <span>{program.duration}</span>
                  </div>
                </div>
              </div>
              <Badge className={typeColors[program.type]}>{t(`radio.schedule.types.${program.type.toLowerCase()}`)}</Badge>
            </div>
          ))}
        </TabsContent>

        {['wed', 'thu', 'fri', 'sat', 'sun'].map((day) => (
          <TabsContent key={day} value={day} className="text-center py-8 text-muted-foreground">
            {t('radio.schedule.comingSoon')}
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  );
};
