import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, User, ArrowLeft, Loader2 } from "lucide-react";

type Role = "professor" | "aluno" | null;
type Mode = "login" | "signup";

const Login = () => {
  const { signIn, signUp } = useAuth();
  const [role, setRole] = useState<Role>(null);
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (mode === "signup") {
      if (!nome.trim()) {
        setError("Nome é obrigatório");
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, nome, role!);
      if (error) setError(error.message);
      else setError("Verifique seu email para confirmar o cadastro!");
    } else {
      const { error } = await signIn(email, password);
      if (error) setError("Email ou senha inválidos");
    }
    setLoading(false);
  };

  if (!role) {
    return (
      <div className="min-h-screen bg-sidebar flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-2xl mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-sidebar-foreground mb-2">EduConnect</h1>
            <p className="text-sidebar-accent-foreground/70">Sistema de Gestão Escolar</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setRole("professor")}
              className="group relative overflow-hidden bg-card rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-card-foreground mb-1">Professor</h3>
                <p className="text-sm text-muted-foreground">Gerenciar turmas</p>
              </div>
            </button>

            <button
              onClick={() => setRole("aluno")}
              className="group relative overflow-hidden bg-card rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-success/20 transition-colors">
                  <User className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-xl font-bold text-card-foreground mb-1">Aluno</h3>
                <p className="text-sm text-muted-foreground">Ver boletim</p>
              </div>
            </button>
          </div>

          <p className="text-center mt-8 text-sidebar-foreground/50 text-sm">EduConnect v3.0</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sidebar flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-xl mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-sidebar-foreground">EduConnect</h1>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader>
            <button
              onClick={() => { setRole(null); setError(""); }}
              className="text-primary hover:text-primary/80 font-medium text-sm flex items-center gap-1 mb-2"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
            <CardTitle>{mode === "login" ? "Login" : "Cadastro"} - {role === "professor" ? "Professor" : "Aluno"}</CardTitle>
            <CardDescription>
              {mode === "login" ? "Acesse o painel de controle" : "Crie sua conta"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Seu nome"
                    className="mt-1"
                    required
                  />
                </div>
              )}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1"
                  minLength={6}
                  required
                />
              </div>

              {error && (
                <p className={`text-sm ${error.includes("Verifique") ? "text-success" : "text-destructive"}`}>
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {mode === "login" ? "Entrar" : "Cadastrar"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                {mode === "login" ? "Não tem conta? " : "Já tem conta? "}
                <button
                  type="button"
                  onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
                  className="text-primary hover:underline font-medium"
                >
                  {mode === "login" ? "Cadastre-se" : "Faça login"}
                </button>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
