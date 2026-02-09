import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export const useAlunoProfile = () => {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["aluno-profile", profile?.nome],
    queryFn: async () => {
      if (!profile?.nome) return null;
      const { data } = await supabase
        .from("alunos")
        .select("*")
        .ilike("nome", `%${profile.nome}%`)
        //.limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!profile?.nome && (profile.role === "aluno" || profile.role === "student"),
  });
};

export const useAlunos = (turmaId: string | null) => {
  return useQuery({
    queryKey: ["alunos", turmaId],
    queryFn: async () => {
      if (!turmaId) return [];
      const { data, error } = await supabase
        .from("alunos")
        .select("*")
        .eq("turma_id", turmaId)
        .order("nome");
      if (error) throw error;
      return data;
    },
    enabled: !!turmaId,
  });
};

export const useAlunosSemTurma = () => {
  return useQuery({
    queryKey: ["alunos-sem-turma"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alunos")
        .select("*")
        .is("turma_id", null)
        .order("nome");
      if (error) throw error;
      return data;
    },
  });
};

export const useAssignTurma = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ alunoId, turmaId }: { alunoId: string; turmaId: string }) => {
      const { error } = await supabase
        .from("alunos")
        .update({ turma_id: turmaId })
        .eq("id", alunoId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alunos"] });
      queryClient.invalidateQueries({ queryKey: ["alunos-sem-turma"] });
      toast.success("Aluno enturmado com sucesso!");
    },
    onError: () => toast.error("Erro ao enturmar aluno"),
  });
};

export const useCreateAluno = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ nome, matricula, turmaId }: { nome: string; matricula?: string; turmaId: string }) => {
      const { data, error } = await supabase
        .from("alunos")
        .insert({ nome, matricula: matricula || null, turma_id: turmaId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alunos"] });
      toast.success("Aluno adicionado!");
    },
    onError: () => toast.error("Erro ao adicionar aluno"),
  });
};

export const useDeleteAluno = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      // Delete notas first
      await supabase.from("notas").delete().eq("aluno_id", id);
      const { error } = await supabase.from("alunos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alunos"] });
      queryClient.invalidateQueries({ queryKey: ["notas"] });
      toast.success("Aluno excluído!");
    },
    onError: () => toast.error("Erro ao excluir aluno"),
  });
};
