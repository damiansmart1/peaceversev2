import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HelpCircle, MessageCircle, Book, Video, Mail, Phone } from 'lucide-react';
import { useState } from 'react';
import { useTranslationContext } from '@/components/TranslationProvider';

export default function Help() {
  const { t } = useTranslationContext();
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      category: t('help.faq.gettingStarted'),
      items: [
        { q: t('help.faq.createAccount.q'), a: t('help.faq.createAccount.a') },
        { q: t('help.faq.anonymous.q'), a: t('help.faq.anonymous.a') },
        { q: t('help.faq.earnPoints.q'), a: t('help.faq.earnPoints.a') },
      ],
    },
    {
      category: t('help.faq.safetyPrivacy'),
      items: [
        { q: t('help.faq.dataProtected.q'), a: t('help.faq.dataProtected.a') },
        { q: t('help.faq.inappropriate.q'), a: t('help.faq.inappropriate.a') },
        { q: t('help.faq.deleteAccount.q'), a: t('help.faq.deleteAccount.a') },
      ],
    },
    {
      category: t('help.faq.features'),
      items: [
        { q: t('help.faq.voiceStories.q'), a: t('help.faq.voiceStories.a') },
        { q: t('help.faq.safeSpaces.q'), a: t('help.faq.safeSpaces.a') },
        { q: t('help.faq.proposals.q'), a: t('help.faq.proposals.a') },
      ],
    },
    {
      category: t('help.faq.technical'),
      items: [
        { q: t('help.faq.slow.q'), a: t('help.faq.slow.a') },
        { q: t('help.faq.upload.q'), a: t('help.faq.upload.a') },
        { q: t('help.faq.forgotPassword.q'), a: t('help.faq.forgotPassword.a') },
      ],
    },
  ];

  const tutorials = [
    { title: t('help.tutorials.quickStart'), duration: '3', icon: Book },
    { title: t('help.tutorials.recordingStory'), duration: '5', icon: Video },
    { title: t('help.tutorials.creatingProposals'), duration: '4', icon: Video },
    { title: t('help.tutorials.earningPoints'), duration: '6', icon: Book },
  ];

  const filteredFaqs = faqs.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.items.length > 0);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <HelpCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">{t('help.title')}</h1>
            <p className="text-muted-foreground text-lg">
              {t('help.subtitle')}
            </p>
          </div>

          {/* Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <HelpCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder={t('help.searchPlaceholder')}
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Content Tabs */}
          <Tabs defaultValue="faq" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="faq">{t('help.tabs.faq')}</TabsTrigger>
              <TabsTrigger value="tutorials">{t('help.tabs.tutorials')}</TabsTrigger>
              <TabsTrigger value="contact">{t('help.tabs.contact')}</TabsTrigger>
            </TabsList>

            <TabsContent value="faq" className="space-y-4 mt-6">
              {filteredFaqs.map((category) => (
                <Card key={category.category}>
                  <CardHeader>
                    <CardTitle>{category.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {category.items.map((item, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                          <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="tutorials" className="space-y-4 mt-6">
              <div className="grid md:grid-cols-2 gap-4">
                {tutorials.map((tutorial) => {
                  const Icon = tutorial.icon;
                  return (
                    <Card key={tutorial.title} className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                            <CardDescription>{tutorial.duration} {t('help.minRead')}</CardDescription>
                          </div>
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" className="w-full">
                          {t('help.startTutorial')}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('help.contact.title')}</CardTitle>
                  <CardDescription>{t('help.contact.subtitle')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start gap-3 h-auto py-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">{t('help.contact.liveChat')}</p>
                      <p className="text-sm text-muted-foreground">{t('help.contact.liveChatHours')}</p>
                    </div>
                  </Button>

                  <Button variant="outline" className="w-full justify-start gap-3 h-auto py-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">{t('help.contact.email')}</p>
                      <p className="text-sm text-muted-foreground">support@peaceverse.org</p>
                    </div>
                  </Button>

                  <Button variant="outline" className="w-full justify-start gap-3 h-auto py-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">{t('help.contact.hotline')}</p>
                      <p className="text-sm text-muted-foreground">{t('help.contact.hotlineNumber')}</p>
                    </div>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
