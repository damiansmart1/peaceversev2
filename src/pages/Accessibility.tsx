import Navigation from '@/components/Navigation';
import AccessibilityPanel from '@/components/AccessibilityPanel';
import { useTranslationContext } from '@/components/TranslationProvider';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
export default function AccessibilityPage() {
 const {t}=useTranslationContext();
 return <div className="min-h-dvh bg-background"><Navigation /><main id="main-content" tabIndex={-1} className="container mx-auto max-w-3xl px-4 pt-24 pb-32 space-y-8"><h1 className="text-3xl font-bold">{t('a11y.pageTitle')}</h1><AccessibilityPanel /><Button asChild variant="outline"><Link to="/help"><HelpCircle className="h-4 w-4" />{t('a11y.help')}</Link></Button></main></div>;
}
