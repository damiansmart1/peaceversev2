import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Shield, Clock } from "lucide-react";
import communityIcon from "@/assets/community-icon.jpg";

interface SafeHub {
  id: string;
  name: string;
  location: string;
  type: 'community_center' | 'school' | 'library' | 'youth_center';
  activeUsers: number;
  verified: boolean;
  distance: string;
  nextSession: string;
}

const CommunityMap = () => {
  const [selectedHub, setSelectedHub] = useState<string | null>(null);

  const safeHubs: SafeHub[] = [
    {
      id: '1',
      name: 'Amani Community Center',
      location: 'Kibera',
      type: 'community_center',
      activeUsers: 23,
      verified: true,
      distance: '0.8 km',
      nextSession: 'Today 3:00 PM'
    },
    {
      id: '2',
      name: 'Tumaini Youth Hub',
      location: 'Mathare',
      type: 'youth_center',
      activeUsers: 15,
      verified: true,
      distance: '1.2 km',
      nextSession: 'Tomorrow 10:00 AM'
    },
    {
      id: '3',
      name: 'Uhuru Library',
      location: 'Eastlands',
      type: 'library',
      activeUsers: 8,
      verified: true,
      distance: '2.1 km',
      nextSession: 'Friday 2:00 PM'
    },
    {
      id: '4',
      name: 'Harambee Secondary School',
      location: 'Kasarani',
      type: 'school',
      activeUsers: 31,
      verified: true,
      distance: '2.8 km',
      nextSession: 'Monday 4:00 PM'
    }
  ];

  const getHubTypeColor = (type: string) => {
    switch (type) {
      case 'community_center': return 'bg-primary text-primary-foreground';
      case 'youth_center': return 'bg-accent text-accent-foreground';
      case 'library': return 'bg-secondary text-secondary-foreground';
      case 'school': return 'bg-warning text-warning-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getHubTypeName = (type: string) => {
    switch (type) {
      case 'community_center': return 'Community Center';
      case 'youth_center': return 'Youth Center';
      case 'library': return 'Library';
      case 'school': return 'School';
      default: return 'Unknown';
    }
  };

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-foreground">Find Safe Spaces</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with verified community dialogue spaces near you where youth gather to build peace
          </p>
        </div>

        {/* Map Visualization */}
        <div className="max-w-6xl mx-auto mb-8">
          <Card className="p-8 bg-card/80 backdrop-blur-sm border-accent/20 shadow-story">
            <div className="relative">
              {/* Mock Map Background */}
              <div className="aspect-[16/10] bg-story-gradient rounded-lg relative overflow-hidden">
                <img
                  src={communityIcon}
                  alt="Community mapping interface"
                  className="absolute inset-0 w-full h-full object-cover opacity-20"
                />
                
                {/* Map Pins */}
                <div className="absolute inset-0 p-6">
                  {safeHubs.map((hub, index) => (
                    <div
                      key={hub.id}
                      className={`absolute cursor-pointer transition-all duration-300 ${
                        selectedHub === hub.id ? 'scale-125 z-10' : 'hover:scale-110'
                      }`}
                      style={{
                        left: `${20 + index * 20}%`,
                        top: `${30 + (index % 2) * 25}%`,
                      }}
                      onClick={() => setSelectedHub(selectedHub === hub.id ? null : hub.id)}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-warm ${
                        selectedHub === hub.id ? 'bg-primary' : 'bg-accent'
                      }`}>
                        <MapPin className="w-4 h-4 text-primary-foreground" />
                      </div>
                      {hub.verified && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-card">
                          <Shield className="w-2 h-2 text-success-foreground ml-0.5 mt-0.5" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Hub List */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {safeHubs.map((hub) => (
            <Card
              key={hub.id}
              className={`p-6 cursor-pointer transition-all duration-300 hover:shadow-warm ${
                selectedHub === hub.id
                  ? 'bg-card border-primary shadow-peace scale-105'
                  : 'bg-card/80 backdrop-blur-sm border-accent/20 shadow-story'
              }`}
              onClick={() => setSelectedHub(selectedHub === hub.id ? null : hub.id)}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-card-foreground leading-tight">{hub.name}</h3>
                  {hub.verified && (
                    <Shield className="w-4 h-4 text-success flex-shrink-0 mt-1" />
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2" />
                    {hub.location} • {hub.distance}
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4 mr-2" />
                    {hub.activeUsers} active members
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-2" />
                    {hub.nextSession}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge className={getHubTypeColor(hub.type)}>
                    {getHubTypeName(hub.type)}
                  </Badge>
                  
                  <Button variant="outline" size="sm">
                    Join
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="peace" size="lg">
            <MapPin className="w-5 h-5" />
            Add New Safe Space
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CommunityMap;