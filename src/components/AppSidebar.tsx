import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  GraduationCap,
  LogOut,
  BookOpen,
} from "lucide-react";
import { useMemo } from "react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { useAlunoProfile } from "@/hooks/useAlunos";
import { useNotasByAluno } from "@/hooks/useNotas";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const professorLinks = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Alunos", url: "/alunos", icon: Users },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

const alunoLinks = [
  { title: "Meu Boletim", url: "/boletim", icon: GraduationCap },
];

export function AppSidebar() {
  const { profile, signOut } = useAuth();
  const isStudent = profile?.role === "aluno" || profile?.role === "student";
  const links = isStudent ? alunoLinks : professorLinks;

  const { data: alunoRecord } = useAlunoProfile();
  const { data: notas = [] } = useNotasByAluno(alunoRecord?.id || null);

  const stats = useMemo(() => {
    if (notas.length === 0) return { media: 0, total: 0 };
    const values = notas.map((n) => Number(n.nota_valor));
    return {
      media: values.reduce((a, b) => a + b, 0) / values.length,
      total: values.length,
    };
  }, [notas]);

  return (
    <Sidebar className="border-r-0">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center overflow-hidden">
            <img src="/src/image/Simbolo_EduConnect_white.png" alt="EduConnect Logo" className="w-6 h-6 object-contain" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">EduConnect</h1>
            <p className="text-xs text-sidebar-foreground/60 capitalize">{profile?.role || "..."}</p>
          </div>
        </div>
      </div>

      <SidebarContent>
        {!isStudent && (
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {links.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === "/dashboard"}
                        className="hover:bg-sidebar-accent"
                        activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {isStudent && (
          <SidebarGroup className="mt-4">
            <SidebarGroupLabel>Minhas Estatísticas</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-4 py-2 space-y-4">
                <div className="bg-primary/5 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground uppercase font-bold">Média Geral</p>
                  <p className="text-2xl font-bold text-primary">{stats.media.toFixed(1)}</p>
                </div>
                <div className="bg-primary/5 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground uppercase font-bold">Total Avaliações</p>
                  <p className="text-2xl font-bold text-primary">{stats.total}</p>
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold text-sm">
            {profile?.nome?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{profile?.nome || "..."}</p>
            <p className="text-xs text-sidebar-foreground/60 capitalize">{profile?.role}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={signOut} className="text-sidebar-foreground/60 hover:text-destructive">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
