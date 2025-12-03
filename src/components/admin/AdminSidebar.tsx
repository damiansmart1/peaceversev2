import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  MapPin,
  Shield,
  Trophy,
  MessageSquare,
  Gamepad2,
  Heart,
  Settings,
  AlertTriangle,
  ChevronDown,
  Brain,
  Home,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useState } from 'react';

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const menuItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    singleItem: true,
  },
  {
    id: 'users-management',
    label: 'Users & Roles',
    icon: Users,
    children: [
      { id: 'users', label: 'Users' },
      { id: 'roles', label: 'Role Management' },
    ],
  },
  {
    id: 'content',
    label: 'Content',
    icon: FileText,
    children: [
      { id: 'content', label: 'Stories & Posts' },
      { id: 'moderation', label: 'Moderation Queue' },
    ],
  },
  {
    id: 'peace-intelligence',
    label: 'Peace Intelligence',
    icon: AlertTriangle,
    children: [
      { id: 'incidents', label: 'Incident Reports' },
      { id: 'safe-spaces', label: 'Safe Spaces' },
      { id: 'peace-metrics', label: 'Peace Metrics' },
    ],
  },
  {
    id: 'engagement',
    label: 'Engagement',
    icon: MessageSquare,
    children: [
      { id: 'proposals', label: 'Proposals' },
      { id: 'challenges', label: 'Challenges' },
      { id: 'gamification', label: 'Gamification' },
    ],
  },
  {
    id: 'configuration',
    label: 'Configuration',
    icon: Settings,
    children: [
      { id: 'ai-analytics', label: 'AI Analytics' },
      { id: 'sponsors', label: 'Sponsors' },
      { id: 'settings', label: 'System Settings' },
    ],
  },
];

export function AdminSidebar({ activeSection, onSectionChange }: AdminSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const [openGroups, setOpenGroups] = useState<string[]>(['engagement', 'configuration', 'peace-intelligence']);

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const navigate = useNavigate();

  return (
    <Sidebar className="border-r border-border">
      <SidebarContent>
        <div className="px-6 py-4">
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="Back to Homepage"
            >
              <Home className="h-4 w-4" />
            </Button>
            {!collapsed && (
              <span className="text-xs text-muted-foreground">Home</span>
            )}
          </div>
          <h2 className={`font-bold text-lg ${collapsed ? 'text-center' : ''}`}>
            {collapsed ? 'AP' : 'Admin Portal'}
          </h2>
        </div>

        <SidebarGroup>
          <SidebarMenu>
            {menuItems.map((item) => {
              if (item.singleItem) {
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onSectionChange(item.id)}
                      isActive={activeSection === item.id}
                      className="w-full"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.label}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              }

              return (
                <Collapsible
                  key={item.id}
                  open={openGroups.includes(item.id)}
                  onOpenChange={() => toggleGroup(item.id)}
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="w-full">
                        <item.icon className="h-4 w-4" />
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-left">{item.label}</span>
                            <ChevronDown
                              className={`h-4 w-4 transition-transform ${
                                openGroups.includes(item.id) ? 'rotate-180' : ''
                              }`}
                            />
                          </>
                        )}
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                  </SidebarMenuItem>
                  {!collapsed && (
                    <CollapsibleContent>
                      <SidebarGroupContent>
                        <SidebarMenu>
                          {item.children?.map((child) => (
                            <SidebarMenuItem key={child.id} className="ml-4">
                              <SidebarMenuButton
                                onClick={() => onSectionChange(child.id)}
                                isActive={activeSection === child.id}
                                className="w-full"
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
