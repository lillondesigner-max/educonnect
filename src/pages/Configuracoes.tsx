import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon, Save, Database } from "lucide-react";
import { toast } from "sonner";

const Configuracoes = () => {
  const [schoolName, setSchoolName] = useState(() => localStorage.getItem("educonnect_school") || "Escola EduConnect");
  const [minApproval, setMinApproval] = useState(() => localStorage.getItem("educonnect_min_approval") || "6");
  const [minRecovery, setMinRecovery] = useState(() => localStorage.getItem("educonnect_min_recovery") || "4");

  const handleSave = () => {
    localStorage.setItem("educonnect_school", schoolName);
    localStorage.setItem("educonnect_min_approval", minApproval);
    localStorage.setItem("educonnect_min_recovery", minRecovery);
    toast.success("Configurações salvas!");
  };

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
        <SettingsIcon className="w-8 h-8 text-primary" /> Configurações
      </h2>

      <Card>
        <CardHeader>
          <CardTitle>Configurações Gerais</CardTitle>
          <CardDescription>Personalize o sistema para sua escola</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Nome da Escola</Label>
            <Input value={schoolName} onChange={(e) => setSchoolName(e.target.value)} className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nota Mínima de Aprovação</Label>
              <Input type="number" min="0" max="10" step="0.5" value={minApproval} onChange={(e) => setMinApproval(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Nota de Recuperação</Label>
              <Input type="number" min="0" max="10" step="0.5" value={minRecovery} onChange={(e) => setMinRecovery(e.target.value)} className="mt-1" />
            </div>
          </div>
          <Button onClick={handleSave}><Save className="w-4 h-4 mr-2" /> Salvar</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" /> Status do Backend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Badge className="bg-success/10 text-success border-success/20">Conectado</Badge>
            <span className="text-sm text-muted-foreground">Supabase</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sobre</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <p>EduConnect v3.0</p>
          <p>Sistema de Gestão Escolar</p>
          <p>Desenvolvido com React + Supabase</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Configuracoes;
