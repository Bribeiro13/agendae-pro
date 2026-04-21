import { Calendar, LayoutDashboard, Users, Scissors, UserCog, Link2, Settings, LogOut, Sparkles } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const itensPrincipais = [
  { titulo: "Painel", url: "/app", icon: LayoutDashboard },
  { titulo: "Agenda", url: "/app/agenda", icon: Calendar },
  { titulo: "Clientes", url: "/app/clientes", icon: Users },
];

const itensGestao = [
  { titulo: "Serviços", url: "/app/servicos", icon: Scissors },
  { titulo: "Profissionais", url: "/app/profissionais", icon: UserCog },
  { titulo: "Link público", url: "/app/link-publico", icon: Link2 },
  { titulo: "Configurações", url: "/app/configuracoes", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { org, signOut, user } = useAuth();

  const isActive = (url: string) =>
    url === "/app" ? location.pathname === "/app" : location.pathname.startsWith(url);

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="bg-gradient-sidebar px-4 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-display text-base font-bold leading-tight text-sidebar-accent-foreground">Agendae</p>
              <p className="truncate text-xs text-sidebar-foreground">{org?.nome ?? "—"}</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-gradient-sidebar">
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-sidebar-foreground/60">Principal</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {itensPrincipais.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}
                    className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground hover:bg-sidebar-accent/60">
                    <NavLink to={item.url} end={item.url === "/app"}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.titulo}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-sidebar-foreground/60">Gestão</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {itensGestao.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}
                    className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground hover:bg-sidebar-accent/60">
                    <NavLink to={item.url}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.titulo}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-gradient-sidebar p-3">
        {!collapsed && (
          <div className="mb-2 rounded-xl border border-sidebar-border/40 bg-sidebar-accent/40 p-3">
            <p className="truncate text-xs text-sidebar-foreground">{user?.email}</p>
          </div>
        )}
        <Button variant="ghost" size={collapsed ? "icon" : "sm"} onClick={signOut}
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Sair</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
