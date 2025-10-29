import Navigation from '@/components/Navigation';
import SectionHeader from '@/components/SectionHeader';
import VoiceRecorder from '@/components/VoiceRecorder';
import ContentUpload from '@/components/ContentUpload';
import { useTranslationContext } from '@/components/TranslationProvider';
import { Mic, Upload } from 'lucide-react';

const Voice = () => {
  const { t } = useTranslationContext();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-24">
        <SectionHeader
          badge={t('voice.badge')}
          title={t('voice.title')}
          subtitle={t('voice.subtitle')}
          icon={<Mic className="w-4 h-4" />}
        />
        
        <div className="max-w-4xl mx-auto space-y-12">
          <VoiceRecorder />
          
          <div className="border-t border-border pt-12">
            <SectionHeader
              badge={t('content.badge')}
              title={t('content.share.title')}
              subtitle={t('content.share.subtitle')}
              icon={<Upload className="w-4 h-4" />}
            />
            <ContentUpload />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Voice;
