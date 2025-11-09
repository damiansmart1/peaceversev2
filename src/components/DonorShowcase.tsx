import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Users, 
  MapPin, 
  Mic, 
  Award, 
  Heart,
  Download,
  Share2,
  BarChart3
} from "lucide-react";

const DonorShowcase = () => {
  const impactMetrics = [
    {
      icon: <Users className="w-6 h-6" />,
      value: "2,847",
      label: "Youth Engaged",
      change: "+23% this month",
      color: "text-primary"
    },
    {
      icon: <Mic className="w-6 h-6" />,
      value: "1,256",
      label: "Stories Shared",
      change: "+45% this month",
      color: "text-voice-active"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      value: "94",
      label: "Communities Reached",
      change: "+12% this month",
      color: "text-accent"
    },
    {
      icon: <Award className="w-6 h-6" />,
      value: "15,829",
      label: "Peace Actions",
      change: "+67% this month",
      color: "text-warning"
    }
  ];

  const featuredStories = [
    {
      id: 1,
      title: "Building Bridges in Rural Kenya",
      author: "Amina, 19",
      location: "Rift Valley, Kenya",
      impact: "Connected 3 communities from different tribes",
      duration: "3:24",
      reactions: 89
    },
    {
      id: 2,
      title: "Youth Voices for Peace in Kibera",
      author: "John, 17",
      location: "Kibera, Nairobi",
      impact: "Led 50+ peace dialogues",
      duration: "4:12",
      reactions: 156
    },
    {
      id: 3,
      title: "Breaking the Cycle of Violence in Turkana",
      author: "Grace, 20",
      location: "Lodwar, Turkana",
      impact: "Reached 500+ youth",
      duration: "2:48",
      reactions: 203
    }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-foreground">Measurable Impact</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See how your support creates real change in Kenyan communities
          </p>
        </div>

        {/* Impact Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {impactMetrics.map((metric, index) => (
            <Card key={index} className="p-6 text-center bg-card/80 backdrop-blur-sm border-accent/20 shadow-story hover:shadow-warm transition-all duration-300">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                metric.color === 'text-primary' ? 'bg-primary/10' :
                metric.color === 'text-voice-active' ? 'bg-voice-active/10' :
                metric.color === 'text-accent' ? 'bg-accent/10' :
                'bg-warning/10'
              }`}>
                <div className={metric.color}>{metric.icon}</div>
              </div>
              <div className="text-2xl font-bold text-card-foreground mb-1">{metric.value}</div>
              <div className="text-sm text-muted-foreground mb-2">{metric.label}</div>
              <Badge className="bg-success/10 text-success text-xs">{metric.change}</Badge>
            </Card>
          ))}
        </div>

        {/* Featured Stories */}
        <Card className="mb-12 p-8 bg-card/80 backdrop-blur-sm border-accent/20 shadow-story">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold text-card-foreground">Featured Peace Stories</h3>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4" />
              Share Collection
            </Button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {featuredStories.map((story) => (
              <Card key={story.id} className="p-6 bg-muted/50 border-accent/20 hover:shadow-warm transition-all duration-300">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 bg-voice-active rounded-full flex items-center justify-center">
                      <Mic className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <Badge className="bg-primary/10 text-primary text-xs">{story.duration}</Badge>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-card-foreground mb-2 leading-tight">{story.title}</h4>
                    <p className="text-sm text-muted-foreground">by {story.author}</p>
                    <p className="text-xs text-muted-foreground flex items-center mt-1">
                      <MapPin className="w-3 h-3 mr-1" />
                      {story.location}
                    </p>
                  </div>
                  
                  <div className="pt-3 border-t border-border">
                    <p className="text-sm font-medium text-accent mb-2">{story.impact}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Heart className="w-4 h-4 mr-1 text-destructive" />
                        {story.reactions} reactions
                      </div>
                      <Button variant="ghost" size="sm">
                        Listen
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        {/* Donor Dashboard */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="p-8 bg-peace-gradient border-none shadow-peace text-primary-foreground">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-8 h-8" />
                <h3 className="text-2xl font-bold">Live Impact Dashboard</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="opacity-90">Active Communities</span>
                  <span className="font-bold">94</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="opacity-90">Stories This Week</span>
                  <span className="font-bold">347</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="opacity-90">Peace Actions</span>
                  <span className="font-bold">1,829</span>
                </div>
              </div>
              
              <Button variant="secondary" className="w-full">
                <Download className="w-4 h-4" />
                Download Full Report
              </Button>
            </div>
          </Card>

          <Card className="p-8 bg-community-gradient border-none shadow-warm text-warning-foreground">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-8 h-8" />
                <h3 className="text-2xl font-bold">Growth Metrics</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="opacity-90">Youth Engagement</span>
                    <span className="font-bold">↑ 23%</span>
                  </div>
                  <div className="bg-warning-foreground/20 rounded-full h-2">
                    <div className="bg-warning-foreground rounded-full h-2 w-3/4"></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="opacity-90">Story Sharing</span>
                    <span className="font-bold">↑ 45%</span>
                  </div>
                  <div className="bg-warning-foreground/20 rounded-full h-2">
                    <div className="bg-warning-foreground rounded-full h-2 w-4/5"></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="opacity-90">Community Building</span>
                    <span className="font-bold">↑ 67%</span>
                  </div>
                  <div className="bg-warning-foreground/20 rounded-full h-2">
                    <div className="bg-warning-foreground rounded-full h-2 w-5/6"></div>
                  </div>
                </div>
              </div>
              
              <Button variant="secondary" className="w-full">
                <Share2 className="w-4 h-4" />
                Share Success Story
              </Button>
            </div>
          </Card>
        </div>

        {/* Call to Action for Donors */}
        <Card className="max-w-4xl mx-auto p-8 bg-story-gradient border-accent/20 shadow-story text-center">
          <div className="space-y-6">
            <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8 text-success-foreground" />
            </div>
            <h3 className="text-3xl font-bold text-card-foreground">Partner with PeaceVerse</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join leading organizations in supporting youth-driven peace building. Get detailed impact reports, 
              exclusive story collections, and recognition in our global peace community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="peace" size="lg">
                <Heart className="w-5 h-5" />
                Become a Partner
              </Button>
              <Button variant="outline" size="lg">
                <Download className="w-5 h-5" />
                Get Impact Report
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default DonorShowcase;