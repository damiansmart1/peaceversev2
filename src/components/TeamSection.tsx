import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Linkedin, Twitter, Mail } from 'lucide-react';

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
    bio: "Leading PeaceVerse's mission to amplify youth voices and build bridges across communities.",
    social: {
      linkedin: "#",
      email: "damian@peaceverse.org"
    }
  },
  {
    name: "Brian Kinuthia",
    role: "Visuals & Design Lead",
    bio: "Creating engaging, youth-centered experiences that make peacebuilding fun and accessible.",
    social: {
      linkedin: "#",
      email: "brian@peaceverse.org"
    }
  },
  {
    name: "Stanley Kinuthia",
    role: "Tech Engineer",
    bio: "Engineering innovative features that empower communities to connect and collaborate.",
    social: {
      linkedin: "#"
    }
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
    <section className="py-12">
      <div className="text-center mb-12">
        <Badge variant="secondary" className="mb-4 px-4 py-1.5 rounded-full">
          Our Team
        </Badge>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          <span className="bg-peace-gradient bg-clip-text text-transparent">
            Meet the People Behind PeaceVerse
          </span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          A diverse team of peacebuilders, technologists, and community leaders dedicated to amplifying youth voices.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
    </section>
  );
};

export default TeamSection;
