import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useTurmas, useCreateTurma } from "@/hooks/useTurmas";
import { useAlunos, useCreateAluno } from "@/hooks/useAlunos";
import { useNotas, useCreateNota } from "@/hooks/useNotas";
import { Users, BarChart3, AlertTriangle, Plus, Zap, Search, History, Trash2 } from "lucide-react";
import { useDeleteAluno } from "@/hooks/useAlunos";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const COLORS = ["hsl(152, 69%, 40%)", "hsl(239, 84%, 67%)", "hsl(38, 92%, 50%)", "hsl(270, 76%, 58%)", "hsl(0, 84%, 60%)"];

const Dashboard = () => {
  const { data: turmas = [] } = useTurmas();
  const createTurma = useCreateTurma();
  const [turmaId, setTurmaId] = useState<string>("");
  const [newTurmaName, setNewTurmaName] = useState("");
  const [newTurmaOpen, setNewTurmaOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [historyStudent, setHistoryStudent] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const selectedTurmaId = turmaId || turmas[0]?.id || "";
  const { data: alunos = [] } = useAlunos(selectedTurmaId);
  const { data: notas = [] } = useNotas(selectedTurmaId);
  const createNota = useCreateNota();
  const deleteAluno = useDeleteAluno();

  // Grade form state
  const [gradeStudent, setGradeStudent] = useState("");
  const [gradeValue, setGradeValue] = useState("");
  const [gradeDate, setGradeDate] = useState(new Date().toISOString().split("T")[0]);
  const [gradeType, setGradeType] = useState("prova");

  // Stats
  const alunoStats = useMemo(() => {
    return alunos.map((a) => {
      const alunoNotas = notas.filter((n) => n.aluno_id === a.id);
      const media = alunoNotas.length > 0
        ? alunoNotas.reduce((s, n) => s + Number(n.nota_valor), 0) / alunoNotas.length
        : 0;
      const lastNota = alunoNotas[0];
      return { ...a, media, lastNota, notasCount: alunoNotas.length };
    });
  }, [alunos, notas]);

  const totalAlunos = alunos.length;
  const mediaGeral = alunoStats.length > 0
    ? alunoStats.reduce((s, a) => s + a.media, 0) / alunoStats.length
    : 0;
  const emRecuperacao = alunoStats.filter((a) => a.media < 6 && a.notasCount > 0).length;

  // Chart data
  const gradeDistribution = useMemo(() => {
    const ranges = [
      { name: "A (9-10)", min: 9, max: 10 },
      { name: "B (7-8.9)", min: 7, max: 8.9 },
      { name: "C (5-6.9)", min: 5, max: 6.9 },
      { name: "D (3-4.9)", min: 3, max: 4.9 },
      { name: "F (0-2.9)", min: 0, max: 2.9 },
    ];
    return ranges.map((r) => ({
      name: r.name,
      value: notas.filter((n) => Number(n.nota_valor) >= r.min && Number(n.nota_valor) <= r.max).length,
    }));
  }, [notas]);

  // Evolution chart data
  const evolutionData = useMemo(() => {
    const dateMap = new Map<string, { date: string; [key: string]: number | string }>();
    const topStudents = alunoStats.slice(0, 5);

    topStudents.forEach((student) => {
      const studentNotas = notas
        .filter((n) => n.aluno_id === student.id)
        .sort((a, b) => a.data_avaliacao.localeCompare(b.data_avaliacao));

      studentNotas.forEach((n) => {
        const existing = dateMap.get(n.data_avaliacao) || { date: n.data_avaliacao };
        existing[student.nome] = Number(n.nota_valor);
        dateMap.set(n.data_avaliacao, existing);
      });
    });

    return Array.from(dateMap.values()).sort((a, b) => (a.date as string).localeCompare(b.date as string));
  }, [notas, alunoStats]);

  const topStudentNames = alunoStats.slice(0, 5).map((s) => s.nome);

  const filteredAlunos = alunoStats.filter((a) =>
    a.nome.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddGrade = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(gradeValue);
    if (isNaN(val) || val < 0 || val > 10) {
      toast.error("Nota deve ser entre 0 e 10");
      return;
    }
    createNota.mutate({
      alunoId: gradeStudent,
      turmaId: selectedTurmaId,
      notaValor: val,
      dataAvaliacao: gradeDate,
      tipoAvaliacao: gradeType,
    });
    setGradeValue("");
    setGradeStudent("");
  };

  const handleCreateTurma = () => {
    if (!newTurmaName.trim()) return;
    createTurma.mutate(newTurmaName);
    setNewTurmaName("");
    setNewTurmaOpen(false);
  };

  const generateDemo = async () => {
    if (!selectedTurmaId) {
      toast.error("Selecione uma turma primeiro");
      return;
    }
    const names = ["Ana Silva", "Bruno Costa", "Carla Dias", "Daniel Souza", "Elena Martins", "Felipe Lima", "Gabriela Rocha", "Hugo Santos", "Isabela Ferreira", "João Alves"];
    const tipos = ["prova", "trabalho", "participacao"];

    for (const name of names) {
      const { data: aluno } = await supabase
        .from("alunos")
        .insert({ nome: name, turma_id: selectedTurmaId, matricula: Math.floor(100000 + Math.random() * 900000).toString() })
        .select()
        .single();

      if (aluno) {
        const numNotas = 3 + Math.floor(Math.random() * 4);
        const notasInsert = [];
        for (let i = 0; i < numNotas; i++) {
          const d = new Date();
          d.setDate(d.getDate() - Math.floor(Math.random() * 90));
          notasInsert.push({
            aluno_id: aluno.id,
            turma_id: selectedTurmaId,
            nota_valor: Math.round((Math.random() * 10) * 10) / 10,
            data_avaliacao: d.toISOString().split("T")[0],
            tipo_avaliacao: tipos[Math.floor(Math.random() * tipos.length)],
          });
        }
        await supabase.from("notas").insert(notasInsert);
      }
    }
    queryClient.invalidateQueries({ queryKey: ["alunos"] });
    queryClient.invalidateQueries({ queryKey: ["notas"] });
    toast.success("Dados demo gerados!");
  };

  // History modal data
  const historyNotas = useMemo(() => {
    if (!historyStudent) return [];
    return notas
      .filter((n) => n.aluno_id === historyStudent)
      .sort((a, b) => b.data_avaliacao.localeCompare(a.data_avaliacao));
  }, [historyStudent, notas]);

  const turmaName = turmas.find((t) => t.id === selectedTurmaId)?.nome || "";

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground">Dashboard</h2>
          <p className="text-muted-foreground mt-1">{turmaName}</p>
        </div>
        <Button onClick={generateDemo} className="bg-accent hover:bg-accent/90">
          <Zap className="w-4 h-4 mr-2" /> Demo
        </Button>
      </div>

      {/* Turma Selector */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <Label>Selecione a Turma</Label>
            <Select value={selectedTurmaId} onValueChange={setTurmaId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {turmas.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Dialog open={newTurmaOpen} onOpenChange={setNewTurmaOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" /> Nova Turma</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Turma</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Nome da Turma</Label>
                  <Input
                    value={newTurmaName}
                    onChange={(e) => setNewTurmaName(e.target.value)}
                    placeholder="Ex: 9º Ano A"
                    className="mt-1"
                  />
                </div>
                <Button onClick={handleCreateTurma} className="w-full">Criar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="hover:-translate-y-1 transition-transform">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Alunos</p>
              <p className="text-3xl font-bold">{totalAlunos}</p>
            </div>
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Users className="w-7 h-7 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="hover:-translate-y-1 transition-transform">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Média Geral</p>
              <p className="text-3xl font-bold">{mediaGeral.toFixed(1)}</p>
            </div>
            <div className="w-14 h-14 bg-success/10 rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-7 h-7 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card className="hover:-translate-y-1 transition-transform">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Em Recuperação</p>
              <p className="text-3xl font-bold">{emRecuperacao}</p>
            </div>
            <div className="w-14 h-14 bg-warning/10 rounded-2xl flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Add Grade Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" /> Adicionar Nota
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddGrade} className="space-y-4">
                <div>
                  <Label>Aluno</Label>
                  <Select value={gradeStudent} onValueChange={setGradeStudent}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {alunos.map((a) => (
                        <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Nota (0-10)</Label>
                  <Input type="number" min="0" max="10" step="0.1" value={gradeValue} onChange={(e) => setGradeValue(e.target.value)} className="mt-1" required />
                </div>
                <div>
                  <Label>Data</Label>
                  <Input type="date" value={gradeDate} onChange={(e) => setGradeDate(e.target.value)} className="mt-1" required />
                </div>
                <div>
                  <Label>Tipo</Label>
                  <Select value={gradeType} onValueChange={setGradeType}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prova">Prova</SelectItem>
                      <SelectItem value="trabalho">Trabalho</SelectItem>
                      <SelectItem value="participacao">Participação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={!gradeStudent || !gradeValue}>
                  <Plus className="w-4 h-4 mr-2" /> Registrar Nota
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Distribuição de Notas</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={gradeDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={80}>
                    {gradeDistribution.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-1 mt-2">
                {gradeDistribution.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-muted-foreground">{d.name}: {d.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="xl:col-span-2 space-y-6">
          {/* Students Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="text-lg">Lista de Alunos</CardTitle>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar aluno..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 w-full sm:w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredAlunos.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>Nenhum aluno encontrado</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Aluno</th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-muted-foreground uppercase">Última Nota</th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-muted-foreground uppercase">Média</th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-muted-foreground uppercase">Status</th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-muted-foreground uppercase">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredAlunos.map((a) => (
                        <tr key={a.id} className="animate-slide-in hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-sm">
                                {a.nome.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium">{a.nome}</p>
                                {a.matricula && <p className="text-xs text-muted-foreground">{a.matricula}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {a.lastNota ? Number(a.lastNota.nota_valor).toFixed(1) : "-"}
                          </td>
                          <td className="px-6 py-4 text-center font-semibold">
                            {a.notasCount > 0 ? a.media.toFixed(1) : "-"}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {a.notasCount > 0 ? (
                              a.media >= 6 ? (
                                <Badge className="bg-success/10 text-success border-success/20">Aprovado</Badge>
                              ) : (
                                <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">Alerta</Badge>
                              )
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button variant="ghost" size="icon" onClick={() => setHistoryStudent(a.id)}>
                                <History className="w-4 h-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-destructive">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Excluir aluno?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta ação excluirá {a.nome} e todas as suas notas permanentemente.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteAluno.mutate(a.id)} className="bg-destructive">
                                      Excluir
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Evolution Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Evolução de Desempenho</CardTitle>
            </CardHeader>
            <CardContent>
              {evolutionData.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Registre notas para ver a evolução</p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={evolutionData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    {topStudentNames.map((name, i) => (
                      <Line key={name} type="monotone" dataKey={name} stroke={COLORS[i]} strokeWidth={2} dot={{ r: 3 }} connectNulls />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* History Modal */}
      <Dialog open={!!historyStudent} onOpenChange={() => setHistoryStudent(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Histórico de Notas - {alunos.find((a) => a.id === historyStudent)?.nome}</DialogTitle>
          </DialogHeader>
          {historyNotas.length === 0 ? (
            <p className="text-muted-foreground py-4">Sem notas registradas.</p>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {historyNotas.map((n) => (
                <div key={n.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium capitalize">{n.tipo_avaliacao}</p>
                    <p className="text-xs text-muted-foreground">{n.data_avaliacao}</p>
                  </div>
                  <span className={`text-lg font-bold ${Number(n.nota_valor) >= 6 ? "text-success" : "text-destructive"}`}>
                    {Number(n.nota_valor).toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
