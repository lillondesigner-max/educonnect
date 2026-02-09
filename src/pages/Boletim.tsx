import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useNotasByAluno } from "@/hooks/useNotas";
import { useAlunoProfile } from "@/hooks/useAlunos";
import { GraduationCap, CheckCircle, AlertTriangle, LineChart as LineChartIcon } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const Boletim = () => {
  const { user, profile } = useAuth();
  const { data: alunoRecord } = useAlunoProfile();
  const { data: notas = [] } = useNotasByAluno(alunoRecord?.id || null);

  const stats = useMemo(() => {
    if (notas.length === 0) return { media: 0, maior: 0, menor: 0, total: 0 };
    const values = notas.map((n) => Number(n.nota_valor));
    return {
      media: values.reduce((a, b) => a + b, 0) / values.length,
      maior: Math.max(...values),
      menor: Math.min(...values),
      total: values.length,
    };
  }, [notas]);

  const chartData = useMemo(() => {
    return notas
      .sort((a, b) => new Date(a.data_avaliacao).getTime() - new Date(b.data_avaliacao).getTime())
      .map((n) => ({
        date: new Date(n.data_avaliacao).toLocaleDateString("pt-BR"),
        nota: Number(n.nota_valor),
        fullDate: n.data_avaliacao, // For tooltip if needed
        subject: n.tipo_avaliacao // simplified for now
      }));
  }, [notas]);

  const approved = stats.media >= 6;

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-primary" /> Meu Boletim
          </h2>
          <p className="text-muted-foreground mt-1">
            Olá, <span className="font-semibold text-foreground">{profile?.nome}</span>. Acompanhe seu desempenho escolar.
          </p>
        </div>
        <Badge variant={approved ? "default" : "destructive"} className="text-sm px-4 py-1 h-fit self-start md:self-center">
          {approved ? "Situação Regular" : "Atenção Necessária"}
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Média Geral</p>
            <p className={`text-3xl font-bold mt-2 ${approved ? "text-primary" : "text-destructive"}`}>
              {stats.media.toFixed(1)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Maior Nota</p>
            <p className="text-3xl font-bold mt-2 text-success">
              {stats.maior.toFixed(1)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Menor Nota</p>
            <p className="text-3xl font-bold mt-2 text-orange-500">
              {stats.menor.toFixed(1)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Avaliações</p>
            <p className="text-3xl font-bold mt-2 text-foreground">
              {stats.total}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Evolution Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <LineChartIcon className="w-5 h-5 text-primary" /> Evolução de Desempenho
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-lg">
                Sem dados suficientes para o gráfico.
              </div>
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorNota" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-20" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis
                      domain={[0, 10]}
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="nota"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorNota)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
            <p className="text-xs text-muted-foreground text-center mt-4">
              Visualização da sua trajetória de notas ao longo do tempo.
            </p>
          </CardContent>
        </Card>

        {/* Recent Activity / Details */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Últimas Avaliações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {notas.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Nenhuma avaliação.</p>
            ) : (
              notas.slice().reverse().slice(0, 5).map((n) => (
                <div key={n.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  <div>
                    <p className="font-semibold text-sm capitalize">{n.tipo_avaliacao}</p>
                    <p className="text-xs text-muted-foreground">{new Date(n.data_avaliacao).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div className={`text-lg font-bold ${Number(n.nota_valor) >= 6 ? "text-success" : "text-destructive"}`}>
                    {Number(n.nota_valor).toFixed(1)}
                  </div>
                </div>
              ))
            )}
            {notas.length > 5 && (
              <Button variant="ghost" className="w-full text-xs text-muted-foreground mt-2">
                Ver todo o histórico
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Boletim;
