import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HelpCircle, MessageCircle, Book, Video, Mail, Phone } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    category: 'Getting Started',
    items: [
      { q: 'How do I create an account?', a: 'Click the "Sign In" button and select "Sign Up" to create a new account with your email.' },
      { q: 'Can I use the platform anonymously?', a: 'Yes! Click "Continue as Guest" on the sign-in page to browse anonymously.' },
      { q: 'How do I earn points?', a: 'Share stories, complete challenges, vote on proposals, and engage with the community to earn points.' },
    ],
  },
  {
    category: 'Safety & Privacy',
    items: [
      { q: 'How is my data protected?', a: 'We use end-to-end encryption and never share your personal data without consent.' },
      { q: 'What if I see inappropriate content?', a: 'Use the flag/report button on any content. Our AI and moderators review all reports within 24 hours.' },
      { q: 'Can I delete my account?', a: 'Yes, go to Profile > Settings > Account and select "Delete Account".' },
    ],
  },
  {
    category: 'Features',
    items: [
      { q: 'How do voice stories work?', a: 'Click the microphone icon, record your story (up to 5 minutes), and share with the community.' },
      { q: 'What are safe spaces?', a: 'Physical and digital locations where youth can gather safely for peacebuilding activities.' },
      { q: 'How do proposals work?', a: 'Create, discuss, and vote on policy proposals. Top proposals are sent to government officials.' },
    ],
  },
  {
    category: 'Technical Issues',
    items: [
      { q: 'The app is slow or not loading', a: 'Check your internet connection, clear browser cache, or try refreshing the page.' },
      { q: 'I can\'t upload files', a: 'Ensure files are under 10MB and in supported formats (jpg, png, mp3, mp4).' },
      { q: 'I forgot my password', a: 'Click "Forgot Password" on the sign-in page to reset via email.' },
    ],
  },
];

const tutorials = [
  { title: 'Quick Start Guide', duration: '3 min', icon: Book },
  { title: 'Recording Your First Story', duration: '5 min', icon: Video },
  { title: 'Creating Proposals', duration: '4 min', icon: Video },
  { title: 'Earning Points & Rewards', duration: '6 min', icon: Book },
];

export default function Help() {
  const [searchQuery, setSearchQuery] = useState('');

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
            <h1 className="text-4xl font-bold">Help Center</h1>
            <p className="text-muted-foreground text-lg">
              Find answers, learn features, and get support
            </p>
          </div>

          {/* Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <HelpCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search for help..."
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
              <TabsTrigger value="faq">FAQs</TabsTrigger>
              <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
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
                            <CardDescription>{tutorial.duration} read</CardDescription>
                          </div>
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" className="w-full">
                          Start Tutorial
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
                  <CardTitle>Get in Touch</CardTitle>
                  <CardDescription>Our support team is here to help you</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start gap-3 h-auto py-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">Live Chat</p>
                      <p className="text-sm text-muted-foreground">Available 9 AM - 6 PM EAT</p>
                    </div>
                  </Button>

                  <Button variant="outline" className="w-full justify-start gap-3 h-auto py-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">Email Support</p>
                      <p className="text-sm text-muted-foreground">support@peaceverse.org</p>
                    </div>
                  </Button>

                  <Button variant="outline" className="w-full justify-start gap-3 h-auto py-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">Crisis Hotline</p>
                      <p className="text-sm text-muted-foreground">24/7 Emergency: 1-800-PEACE</p>
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
