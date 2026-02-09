import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useTurmas } from "@/hooks/useTurmas";
import { useAlunos } from "@/hooks/useAlunos";
import { useNotas } from "@/hooks/useNotas";
import { Download, Trophy } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const Relatorios = () => {
  const { data: turmas = [] } = useTurmas();
  const [turmaId, setTurmaId] = useState("");
  const selectedTurmaId = turmaId || turmas[0]?.id || "";
  const { data: alunos = [] } = useAlunos(selectedTurmaId);
  const { data: notas = [] } = useNotas(selectedTurmaId);

  const alunoStats = useMemo(() => {
    return alunos.map((a) => {
      const alunoNotas = notas.filter((n) => n.aluno_id === a.id);
      const media = alunoNotas.length > 0
        ? alunoNotas.reduce((s, n) => s + Number(n.nota_valor), 0) / alunoNotas.length
        : 0;
      return { ...a, media, notasCount: alunoNotas.length };
    }).sort((a, b) => b.media - a.media);
  }, [alunos, notas]);

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
      quantidade: notas.filter((n) => Number(n.nota_valor) >= r.min && Number(n.nota_valor) <= r.max).length,
    }));
  }, [notas]);

  const exportCSV = () => {
    const headers = "Nome,Matrícula,Média,Status\n";
    const rows = alunoStats.map((a) =>
      `"${a.nome}","${a.matricula || ""}","${a.media.toFixed(1)}","${a.media >= 6 ? "Aprovado" : "Recuperação"}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "relatorio-alunos.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl lg:text-3xl font-bold">Relatórios</h2>
        <div className="flex gap-2">
          <Select value={selectedTurmaId} onValueChange={setTurmaId}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Turma" /></SelectTrigger>
            <SelectContent>
              {turmas.map((t) => <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportCSV}>
            <Download className="w-4 h-4 mr-2" /> CSV
          </Button>
        </div>
      </div>

      {/* Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Distribuição por Faixa de Notas</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={gradeDistribution}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="quantidade" fill="hsl(239, 84%, 67%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Ranking */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-warning" /> Ranking de Desempenho
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {alunoStats.filter((a) => a.notasCount > 0).length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">Sem dados para exibir</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-muted-foreground uppercase w-16">#</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Aluno</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-muted-foreground uppercase">Média</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {alunoStats.filter((a) => a.notasCount > 0).map((a, i) => (
                    <tr key={a.id} className="animate-slide-in hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 text-center text-lg">
                        {i < 3 ? medals[i] : i + 1}
                      </td>
                      <td className="px-6 py-4 font-medium">{a.nome}</td>
                      <td className="px-6 py-4 text-center font-bold">{a.media.toFixed(1)}</td>
                      <td className="px-6 py-4 text-center">
                        {a.media >= 6 ? (
                          <Badge className="bg-success/10 text-success border-success/20">Aprovado</Badge>
                        ) : (
                          <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">Alerta</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Relatorios;
