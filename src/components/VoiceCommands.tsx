import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useTranslationContext } from '@/components/TranslationProvider';

// Extend Window interface for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function VoiceCommands() {
  const { settings, announce } = useAccessibility();
  const { t } = useTranslationContext();
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [lastCommand, setLastCommand] = useState<string>('');

  useEffect(() => {
    if (!settings.voiceNavigation) return;

    // Check for Speech Recognition API support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({
        title: t('voice.not_supported'),
        description: t('voice.not_supported_desc'),
        variant: 'destructive'
      });
      return;
    }

    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = false;
    recognitionInstance.lang = 'en-US'; // TODO: Use current language from context

    recognitionInstance.onresult = (event) => {
      const last = event.results.length - 1;
      const command = event.results[last][0].transcript.toLowerCase().trim();
      setLastCommand(command);
      handleVoiceCommand(command);
    };

    recognitionInstance.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognitionInstance.onend = () => {
      if (settings.voiceNavigation && isListening) {
        recognitionInstance.start();
      }
    };

    setRecognition(recognitionInstance);

    return () => {
      if (recognitionInstance) {
        recognitionInstance.stop();
      }
    };
  }, [settings.voiceNavigation]);

  const handleVoiceCommand = (command: string) => {
    announce(`Command recognized: ${command}`, 'polite');

    // Navigation commands
    if (command.includes('go home') || command.includes('home page')) {
      navigate('/');
      speak(t('voice.navigating_home'));
    } else if (command.includes('voice') || command.includes('stories')) {
      navigate('/voice');
      speak(t('voice.navigating_stories'));
    } else if (command.includes('community')) {
      navigate('/community');
      speak(t('voice.navigating_community'));
    } else if (command.includes('proposals')) {
      navigate('/proposals');
      speak(t('voice.navigating_proposals'));
    } else if (command.includes('challenges')) {
      navigate('/challenges');
      speak(t('voice.navigating_challenges'));
    } else if (command.includes('radio')) {
      navigate('/radio');
      speak(t('voice.navigating_radio'));
    } else if (command.includes('profile')) {
      navigate('/profile');
      speak(t('voice.navigating_profile'));
    } else if (command.includes('help')) {
      navigate('/help');
      speak(t('voice.navigating_help'));
    }
    // Action commands
    else if (command.includes('scroll down')) {
      window.scrollBy({ top: 500, behavior: 'smooth' });
      speak(t('voice.scrolling_down'));
    } else if (command.includes('scroll up')) {
      window.scrollBy({ top: -500, behavior: 'smooth' });
      speak(t('voice.scrolling_up'));
    } else if (command.includes('go back')) {
      window.history.back();
      speak(t('voice.going_back'));
    } else if (command.includes('refresh')) {
      window.location.reload();
      speak(t('voice.refreshing'));
    }
    // Unknown command
    else {
      speak(t('voice.command_not_recognized'));
    }
  };

  const speak = (text: string) => {
    if (!settings.textToSpeech) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      announce(t('voice.stopped'), 'polite');
    } else {
      recognition.start();
      setIsListening(true);
      announce(t('voice.started'), 'polite');
      speak(t('voice.listening'));
    }
  };

  const showCommands = () => {
    const commands = [
      'Go home', 'Voice', 'Community', 'Proposals', 
      'Challenges', 'Radio', 'Profile', 'Help',
      'Scroll down', 'Scroll up', 'Go back', 'Refresh'
    ];
    speak(`Available commands: ${commands.join(', ')}`);
  };

  if (!settings.voiceNavigation) return null;

  return (
    <div className="fixed bottom-24 right-4 z-50">
      <Card className="p-4 space-y-3 shadow-lg">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-primary" />
            <span className="font-semibold text-sm">{t('voice.commands')}</span>
          </div>
          <Badge variant={isListening ? 'default' : 'secondary'}>
            {isListening ? t('voice.listening') : t('voice.inactive')}
          </Badge>
        </div>
        
        {lastCommand && (
          <p className="text-xs text-muted-foreground">
            {t('voice.last_command')}: "{lastCommand}"
          </p>
        )}

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={toggleListening}
            variant={isListening ? 'destructive' : 'default'}
            className="flex-1"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span className="ml-2">
              {isListening ? t('voice.stop') : t('voice.start')}
            </span>
          </Button>
          
          <Button size="sm" variant="outline" onClick={showCommands}>
            <Volume2 className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
