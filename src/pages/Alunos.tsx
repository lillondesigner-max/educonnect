import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useTurmas } from "@/hooks/useTurmas";
import { useAlunos, useCreateAluno, useDeleteAluno, useAlunosSemTurma, useAssignTurma } from "@/hooks/useAlunos";
import { useNotas } from "@/hooks/useNotas";
import { Plus, Search, Trash2, History, UserPlus, AlertTriangle } from "lucide-react";

const Alunos = () => {
  const { data: turmas = [] } = useTurmas();
  const [turmaId, setTurmaId] = useState<string>("");
  const selectedTurmaId = turmaId || turmas[0]?.id || "";
  const { data: alunos = [] } = useAlunos(selectedTurmaId);
  const { data: notas = [] } = useNotas(selectedTurmaId);
  const createAluno = useCreateAluno();
  const deleteAluno = useDeleteAluno();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [newName, setNewName] = useState("");
  const [newMatricula, setNewMatricula] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [historyStudent, setHistoryStudent] = useState<string | null>(null);

  const alunoStats = useMemo(() => {
    return alunos.map((a) => {
      const alunoNotas = notas.filter((n) => n.aluno_id === a.id);
      const media = alunoNotas.length > 0
        ? alunoNotas.reduce((s, n) => s + Number(n.nota_valor), 0) / alunoNotas.length
        : 0;
      return { ...a, media, notasCount: alunoNotas.length };
    });
  }, [alunos, notas]);

  const filtered = alunoStats
    .filter((a) => a.nome.toLowerCase().includes(search.toLowerCase()))
    .filter((a) => {
      if (filter === "aprovado") return a.notasCount > 0 && a.media >= 6;
      if (filter === "recuperacao") return a.notasCount > 0 && a.media < 6;
      return true;
    });

  const handleAdd = () => {
    if (!newName.trim()) return;
    createAluno.mutate({ nome: newName.trim(), matricula: newMatricula.trim() || undefined, turmaId: selectedTurmaId });
    setNewName("");
    setNewMatricula("");
    setAddOpen(false);
  };

  const historyNotas = useMemo(() => {
    if (!historyStudent) return [];
    return notas
      .filter((n) => n.aluno_id === historyStudent)
      .sort((a, b) => b.data_avaliacao.localeCompare(a.data_avaliacao));
  }, [historyStudent, notas]);

  const { data: semTurma = [] } = useAlunosSemTurma();
  const assignTurma = useAssignTurma();

  const handleAssign = (alunoId: string, turmaId: string) => {
    assignTurma.mutate({ alunoId, turmaId });
  };

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl lg:text-3xl font-bold">Gestão de Alunos</h2>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button><UserPlus className="w-4 h-4 mr-2" /> Novo Aluno</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Adicionar Aluno</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nome *</Label>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nome completo" className="mt-1" />
              </div>
              <div>
                <Label>Matrícula</Label>
                <Input value={newMatricula} onChange={(e) => setNewMatricula(e.target.value)} placeholder="Opcional" className="mt-1" />
              </div>
              <div>
                <Label>Turma</Label>
                <Select value={selectedTurmaId} onValueChange={setTurmaId}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {turmas.map((t) => <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAdd} className="w-full" disabled={!newName.trim()}>Adicionar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Unassigned Students Alert */}
      {semTurma.length > 0 && (
        <Card className="border-orange-500/50 bg-orange-500/10">
          <CardHeader>
            <CardTitle className="text-orange-700 dark:text-orange-400 text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Alunos Sem Turma ({semTurma.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {semTurma.map((s) => (
                <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-background/50 p-4 rounded-lg">
                  <div>
                    <p className="font-semibold">{s.nome}</p>
                    <p className="text-sm text-muted-foreground">Cadastrado sem turma</p>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Select onValueChange={(val) => handleAssign(s.id, val)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Selecione a Turma" />
                      </SelectTrigger>
                      <SelectContent>
                        {turmas.map((t) => (
                          <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Select value={selectedTurmaId} onValueChange={setTurmaId}>
              <SelectTrigger><SelectValue placeholder="Turma" /></SelectTrigger>
              <SelectContent>
                {turmas.map((t) => <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="aprovado">Aprovados</SelectItem>
              <SelectItem value="recuperacao">Em Recuperação</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">Nenhum aluno encontrado</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Nome</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-muted-foreground uppercase">Matrícula</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-muted-foreground uppercase">Notas</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-muted-foreground uppercase">Média</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-muted-foreground uppercase">Status</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-muted-foreground uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((a) => (
                    <tr key={a.id} className="animate-slide-in hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium">{a.nome}</td>
                      <td className="px-6 py-4 text-center text-muted-foreground">{a.matricula || "-"}</td>
                      <td className="px-6 py-4 text-center">{a.notasCount}</td>
                      <td className="px-6 py-4 text-center font-semibold">{a.notasCount > 0 ? a.media.toFixed(1) : "-"}</td>
                      <td className="px-6 py-4 text-center">
                        {a.notasCount > 0 ? (
                          a.media >= 6 ? (
                            <Badge className="bg-success/10 text-success border-success/20">Aprovado</Badge>
                          ) : (
                            <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">Alerta</Badge>
                          )
                        ) : "-"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => setHistoryStudent(a.id)}>
                            <History className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir {a.nome}?</AlertDialogTitle>
                                <AlertDialogDescription>Esta ação é permanente.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteAluno.mutate(a.id)} className="bg-destructive">Excluir</AlertDialogAction>
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

      {/* History Modal */}
      <Dialog open={!!historyStudent} onOpenChange={() => setHistoryStudent(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Histórico - {alunos.find((a) => a.id === historyStudent)?.nome}</DialogTitle>
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

export default Alunos;
