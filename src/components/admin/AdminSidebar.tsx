import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronDown, ChevronRight, LayoutDashboard, Users, FileText, FileCheck, 
  AlertTriangle, MapPin, Trophy, Shield, Gamepad2, Award, Settings } from 'lucide-react';
import { useState } from 'react';

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const menuSections = [
  {
    label: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'User Management',
    items: [
      { id: 'users', label: 'Users', icon: Users },
    ],
  },
  {
    label: 'Content',
    items: [
      { id: 'content', label: 'Content Manager', icon: FileText },
      { id: 'proposals', label: 'Proposals', icon: FileCheck },
      { id: 'moderation', label: 'Moderation', icon: Shield },
    ],
  },
  {
    label: 'Peace Intelligence',
    items: [
      { id: 'incidents', label: 'Incident Reports', icon: AlertTriangle },
      { id: 'safe-spaces', label: 'Safe Spaces', icon: MapPin },
    ],
  },
  {
    label: 'Engagement',
    items: [
      { id: 'challenges', label: 'Challenges', icon: Trophy },
      { id: 'gamification', label: 'Gamification', icon: Gamepad2 },
      { id: 'sponsors', label: 'Sponsors', icon: Award },
    ],
  },
  {
    label: 'Configuration',
    items: [
      { id: 'settings', label: 'Platform Settings', icon: Settings },
    ],
  },
];

export function AdminSidebar({ activeSection, onSectionChange }: AdminSidebarProps) {
  const { user } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const [openSections, setOpenSections] = useState<string[]>(['Overview', 'Content', 'Peace Intelligence', 'Engagement', 'Configuration', 'User Management']);

  const toggleSection = (label: string) => {
    setOpenSections(prev =>
      prev.includes(label)
        ? prev.filter(s => s !== label)
        : [...prev, label]
    );
  };

  return (
    <Sidebar className={collapsed ? 'w-16' : 'w-64'} collapsible="icon">
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user?.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">
                {user?.email}
              </p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        {menuSections.map((section) => (
          <Collapsible
            key={section.label}
            open={openSections.includes(section.label)}
            onOpenChange={() => toggleSection(section.label)}
            className="mb-2"
          >
            <SidebarGroup>
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel className="flex items-center justify-between cursor-pointer hover:bg-accent rounded-md px-2 py-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    {collapsed ? section.label.charAt(0) : section.label}
                  </span>
                  {!collapsed && (
                    openSections.includes(section.label) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )
                  )}
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((item) => (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          onClick={() => onSectionChange(item.id)}
                          isActive={activeSection === item.id}
                          className="w-full"
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          {!collapsed && <span>{item.label}</span>}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
