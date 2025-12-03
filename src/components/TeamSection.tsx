import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Linkedin, Twitter, Mail, Target, Eye, Shield, Globe, Zap, Users } from 'lucide-react';

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image?: string;
  social?: {
    linkedin?: string;
    twitter?: string;
    email?: string;
  };
}

const teamMembers: TeamMember[] = [
  {
    name: "Damian Kajwang",
    role: "Project Lead",
    bio: "Leading Peaceverse's mission to detect, verify, and prevent conflicts across Africa through innovative technology.",
    social: {
      linkedin: "#",
      email: "damian@peaceverse.org"
    }
  },
  {
    name: "Brian Kinuthia",
    role: "Visuals & Design Lead",
    bio: "Crafting intuitive interfaces that make complex early warning data accessible to all stakeholders.",
    social: {
      linkedin: "#",
      email: "brian@peaceverse.org"
    }
  },
  {
    name: "Stanley Kinuthia",
    role: "Tech Engineer",
    bio: "Building resilient systems for real-time incident reporting and AI-powered threat analysis.",
    social: {
      linkedin: "#"
    }
  }
];

const missionPillars = [
  {
    icon: Target,
    title: "Detect",
    description: "Real-time monitoring of incidents across 54 African nations using citizen reporting and AI analysis",
    color: "bg-primary"
  },
  {
    icon: Shield,
    title: "Verify",
    description: "Rigorous multi-layer verification through community validators and expert analysts",
    color: "bg-accent"
  },
  {
    icon: Eye,
    title: "Prevent",
    description: "Predictive analytics and early alerts to enable proactive intervention before conflicts escalate",
    color: "bg-success"
  }
];

const TeamSection = () => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <section className="space-y-16">
      {/* Mission Statement */}
      <div className="text-center max-w-4xl mx-auto">
        <Badge variant="secondary" className="mb-4 px-4 py-1.5 rounded-full">
          Our Mission
        </Badge>
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          <span className="bg-peace-gradient bg-clip-text text-transparent">
            Building Africa's Premier Early Warning System
          </span>
        </h2>
        <p className="text-lg text-muted-foreground leading-relaxed mb-8">
          Peaceverse is a continental early warning and rapid response platform designed to detect emerging 
          threats, verify incidents through community-driven processes, and prevent conflicts before they 
          escalate. We harness the power of citizen reporting, artificial intelligence, and cross-border 
          collaboration to protect communities across Africa.
        </p>
      </div>

      {/* Mission Pillars */}
      <div className="grid md:grid-cols-3 gap-6">
        {missionPillars.map((pillar, index) => {
          const Icon = pillar.icon;
          return (
            <Card key={index} className="p-8 text-center hover:shadow-elevated transition-all duration-300 border-2 hover:border-primary/20">
              <div className={`w-16 h-16 ${pillar.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                <Icon className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-foreground">{pillar.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{pillar.description}</p>
            </Card>
          );
        })}
      </div>

      {/* Vision Section */}
      <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <Badge variant="outline" className="mb-4">Our Vision</Badge>
            <h3 className="text-2xl font-bold mb-4 text-foreground">A Peaceful, Resilient Africa</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We envision an Africa where communities are empowered with the tools and information 
              they need to prevent conflicts, where early warnings reach decision-makers in real-time, 
              and where cross-border collaboration strengthens regional peace and security.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-primary/10 text-primary">54 Countries</Badge>
              <Badge className="bg-accent/10 text-accent">8 Regional Blocs</Badge>
              <Badge className="bg-success/10 text-success">1.4B+ People</Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-background rounded-lg border">
              <Globe className="w-8 h-8 text-primary mb-2" />
              <div className="text-2xl font-bold text-foreground">Pan-African</div>
              <div className="text-sm text-muted-foreground">Continental coverage</div>
            </div>
            <div className="p-4 bg-background rounded-lg border">
              <Zap className="w-8 h-8 text-accent mb-2" />
              <div className="text-2xl font-bold text-foreground">Real-time</div>
              <div className="text-sm text-muted-foreground">Instant alerts</div>
            </div>
            <div className="p-4 bg-background rounded-lg border">
              <Users className="w-8 h-8 text-success mb-2" />
              <div className="text-2xl font-bold text-foreground">Community</div>
              <div className="text-sm text-muted-foreground">Citizen-powered</div>
            </div>
            <div className="p-4 bg-background rounded-lg border">
              <Shield className="w-8 h-8 text-warning mb-2" />
              <div className="text-2xl font-bold text-foreground">Verified</div>
              <div className="text-sm text-muted-foreground">Trusted data</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Team Section */}
      <div>
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 px-4 py-1.5 rounded-full">
            Our Team
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-peace-gradient bg-clip-text text-transparent">
              Meet the People Behind Peaceverse
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A dedicated team of peacebuilders, technologists, and security experts working to 
            make Africa safer through innovation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {teamMembers.map((member, index) => (
            <Card 
              key={index}
              className="p-6 hover:shadow-soft transition-all duration-300 border-2 hover:border-primary/20 group"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <Avatar className="h-24 w-24 border-4 border-primary/10 group-hover:border-primary/30 transition-colors">
                  <AvatarImage src={member.image} alt={member.name} />
                  <AvatarFallback className="text-lg font-semibold bg-gradient-subtle">
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-2">
                  <h3 className="font-bold text-lg">{member.name}</h3>
                  <Badge variant="outline" className="text-xs">
                    {member.role}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {member.bio}
                </p>

                {member.social && (
                  <div className="flex gap-3 pt-2">
                    {member.social.linkedin && (
                      <a 
                        href={member.social.linkedin}
                        className="text-muted-foreground hover:text-primary transition-colors"
                        aria-label="LinkedIn"
                      >
                        <Linkedin className="w-5 h-5" />
                      </a>
                    )}
                    {member.social.twitter && (
                      <a 
                        href={member.social.twitter}
                        className="text-muted-foreground hover:text-primary transition-colors"
                        aria-label="Twitter"
                      >
                        <Twitter className="w-5 h-5" />
                      </a>
                    )}
                    {member.social.email && (
                      <a 
                        href={`mailto:${member.social.email}`}
                        className="text-muted-foreground hover:text-primary transition-colors"
                        aria-label="Email"
                      >
                        <Mail className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
