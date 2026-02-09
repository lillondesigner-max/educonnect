import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useNotasByAluno } from "@/hooks/useNotas";
import { useAlunoProfile } from "@/hooks/useAlunos";
import { GraduationCap, CheckCircle, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const Boletim = () => {
  const { user, profile } = useAuth();
  const { data: alunoRecord } = useAlunoProfile();

  const { data: notas = [] } = useNotasByAluno(alunoRecord?.id || null);

  const media = useMemo(() => {
    if (notas.length === 0) return 0;
    return notas.reduce((s, n) => s + Number(n.nota_valor), 0) / notas.length;
  }, [notas]);

  const chartData = useMemo(() => {
    return notas.map((n) => ({
      date: n.data_avaliacao,
      nota: Number(n.nota_valor),
    }));
  }, [notas]);

  const approved = media >= 6;

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
        <GraduationCap className="w-8 h-8 text-primary" /> Meu Boletim
      </h2>

      {/* Student Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl">
              {profile?.nome?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div>
              <h3 className="text-2xl font-bold">{profile?.nome || "Aluno"}</h3>
              <p className="text-muted-foreground">Matrícula: {alunoRecord?.matricula || "-"}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-primary/5 rounded-lg p-4">
              <p className="text-sm text-primary font-medium">Total de Notas</p>
              <p className="text-2xl font-bold text-primary mt-1">{notas.length}</p>
            </div>
            <div className="bg-success/5 rounded-lg p-4">
              <p className="text-sm text-success font-medium">Média Final</p>
              <p className="text-2xl font-bold text-success mt-1">{media.toFixed(1)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      <Card className={approved ? "border-success/30" : "border-destructive/30"}>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${approved ? "bg-success/10" : "bg-destructive/10"}`}>
              {approved ? <CheckCircle className="w-6 h-6 text-success" /> : <AlertTriangle className="w-6 h-6 text-destructive" />}
            </div>
            <div>
              <h4 className={`text-lg font-bold ${approved ? "text-success" : "text-destructive"}`}>
                {approved ? "Aprovado" : "Em Recuperação"}
              </h4>
              <p className="text-sm text-muted-foreground">
                {approved ? "Parabéns! Continue assim!" : "Você precisa melhorar suas notas."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Histórico de Notas</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Sem notas registradas ainda.</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="nota" stroke="hsl(239, 84%, 67%)" strokeWidth={2} dot={{ r: 4, fill: "hsl(239, 84%, 67%)" }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Notes List */}
      {notas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Detalhamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {notas.slice().reverse().map((n) => (
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
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Boletim;
