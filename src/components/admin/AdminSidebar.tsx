import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, FileStack, MapPinned, ShieldCheck, Medal,
  MessagesSquare, Gamepad2, HeartHandshake, SlidersHorizontal, Siren,
  ChevronDown, BrainCircuit, Home, Plug, Radio, Vote,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from '@/components/ui/sidebar';
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useState } from 'react';
import peaceverselogo from '@/assets/peaceverse-logo.png';

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, singleItem: true },
  {
    id: 'users-management', label: 'Users & Roles', icon: Users,
    children: [
      { id: 'users', label: 'Users' },
      { id: 'roles', label: 'Role Management' },
      { id: 'feature-access', label: 'Feature Access' },
    ],
  },
  {
    id: 'content', label: 'Content', icon: FileStack,
    children: [
      { id: 'cms', label: 'Website Content (CMS)' },
      { id: 'content', label: 'Stories & Posts' },
      { id: 'moderation', label: 'Moderation Queue' },
    ],
  },
  {
    id: 'peace-intelligence', label: 'Peace Intelligence', icon: Siren,
    children: [
      { id: 'incidents', label: 'Incident Reports' },
      { id: 'incident-timeline', label: 'Timeline Tracker' },
      { id: 'elections', label: 'Election Monitoring' },
      { id: 'safe-spaces', label: 'Safe Spaces' },
      { id: 'peace-metrics', label: 'Peace Metrics' },
      { id: 'nuru-ai', label: 'NuruAI Civic Intel' },
      { id: 'constitutions', label: 'Constitutions' },
    ],
  },
  {
    id: 'communication', label: 'Communication', icon: Radio,
    children: [
      { id: 'comm-hub', label: 'Communication Hub' },
      { id: 'broadcasts', label: 'Broadcasts' },
      { id: 'ocha-docs', label: 'OCHA Documents' },
      { id: 'field-reports', label: 'Field Reports' },
    ],
  },
  {
    id: 'engagement', label: 'Engagement', icon: MessagesSquare,
    children: [
      { id: 'proposals', label: 'Proposals' },
      { id: 'challenges', label: 'Challenges' },
      { id: 'gamification', label: 'Gamification' },
    ],
  },
  {
    id: 'configuration', label: 'Configuration', icon: SlidersHorizontal,
    children: [
      { id: 'ai-analytics', label: 'AI Analytics' },
      { id: 'api-analytics', label: 'API Usage' },
      { id: 'integrations', label: 'Integrations' },
      { id: 'sponsors', label: 'Sponsors' },
      { id: 'settings', label: 'System Settings' },
    ],
  },
];

export function AdminSidebar({ activeSection, onSectionChange }: AdminSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const [openGroups, setOpenGroups] = useState<string[]>(['engagement', 'configuration', 'peace-intelligence']);
  const navigate = useNavigate();

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  return (
    <Sidebar className="border-r border-border/50 bg-card">
      <SidebarContent>
        {/* Brand Header */}
        <div className="px-4 py-5 border-b border-border/50">
          <div className="flex items-center gap-3 mb-3">
            <img src={peaceverselogo} alt="PeaceVerse" className="h-8 w-auto" />
            {!collapsed && (
              <div>
                <span className="text-sm font-bold text-primary">Peace</span>
                <span className="text-sm font-bold text-gold">Verse</span>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="w-full justify-start gap-2 h-8 text-xs text-muted-foreground hover:text-foreground"
          >
            <Home className="h-3.5 w-3.5" />
            {!collapsed && <span>Back to Homepage</span>}
          </Button>
        </div>

        {/* Navigation Label */}
        {!collapsed && (
          <div className="px-4 pt-4 pb-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Admin Portal
            </span>
          </div>
        )}

        <SidebarGroup>
          <SidebarMenu>
            {menuItems.map((item) => {
              if (item.singleItem) {
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onSectionChange(item.id)}
                      isActive={activeSection === item.id}
                      className={`w-full transition-all duration-200 ${
                        activeSection === item.id 
                          ? 'bg-primary/10 text-primary font-semibold border-l-2 border-primary' 
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.label}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              }

              const isGroupActive = item.children?.some(c => c.id === activeSection);

              return (
                <Collapsible
                  key={item.id}
                  open={openGroups.includes(item.id)}
                  onOpenChange={() => toggleGroup(item.id)}
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className={`w-full transition-all duration-200 ${
                        isGroupActive ? 'text-primary font-medium' : ''
                      }`}>
                        <item.icon className={`h-4 w-4 ${isGroupActive ? 'text-primary' : ''}`} />
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-left">{item.label}</span>
                            <ChevronDown
                              className={`h-3.5 w-3.5 transition-transform duration-200 ${
                                openGroups.includes(item.id) ? 'rotate-180' : ''
                              }`}
                            />
                          </>
                        )}
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                  </SidebarMenuItem>
                  {!collapsed && (
                    <CollapsibleContent className="animate-accordion-down">
                      <SidebarGroupContent>
                        <SidebarMenu>
                          {item.children?.map((child) => (
                            <SidebarMenuItem key={child.id} className="ml-2">
                              <SidebarMenuButton
                                onClick={() => onSectionChange(child.id)}
                                isActive={activeSection === child.id}
                                className={`w-full pl-6 transition-all duration-200 text-sm ${
                                  activeSection === child.id
                                    ? 'bg-primary/10 text-primary font-medium border-l-2 border-gold'
                                    : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                                }`}
                              >
                                <span>{child.label}</span>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))}
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </CollapsibleContent>
                  )}
                </Collapsible>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
