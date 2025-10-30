import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Accessibility } from 'lucide-react';
import AccessibilityPanel from './AccessibilityPanel';
import { useTranslationContext } from './TranslationProvider';

export default function AccessibilityMenu() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslationContext();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed left-4 top-1/2 -translate-y-1/2 z-50 rounded-full shadow-lg"
          aria-label={t('accessibility.open_menu')}
        >
          <Accessibility className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t('accessibility.menu_title')}</SheetTitle>
          <SheetDescription>
            {t('accessibility.menu_description')}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <AccessibilityPanel />
        </div>
      </SheetContent>
    </Sheet>
  );
}
