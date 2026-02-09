import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useNotas = (turmaId: string | null) => {
  return useQuery({
    queryKey: ["notas", turmaId],
    queryFn: async () => {
      if (!turmaId) return [];
      const { data, error } = await supabase
        .from("notas")
        .select("*")
        .eq("turma_id", turmaId)
        .order("data_avaliacao", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!turmaId,
  });
};

export const useNotasByAluno = (alunoId: string | null) => {
  return useQuery({
    queryKey: ["notas", "aluno", alunoId],
    queryFn: async () => {
      if (!alunoId) return [];
      const { data, error } = await supabase
        .from("notas")
        .select("*")
        .eq("aluno_id", alunoId)
        .order("data_avaliacao", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!alunoId,
  });
};

export const useCreateNota = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      alunoId,
      turmaId,
      notaValor,
      dataAvaliacao,
      tipoAvaliacao,
    }: {
      alunoId: string;
      turmaId: string;
      notaValor: number;
      dataAvaliacao: string;
      tipoAvaliacao: string;
    }) => {
      const { data, error } = await supabase
        .from("notas")
        .insert({
          aluno_id: alunoId,
          turma_id: turmaId,
          nota_valor: notaValor,
          data_avaliacao: dataAvaliacao,
          tipo_avaliacao: tipoAvaliacao,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notas"] });
      toast.success("Nota registrada!");
    },
    onError: () => toast.error("Erro ao registrar nota"),
  });
};

export const useDeleteNota = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notas"] });
      toast.success("Nota excluída!");
    },
    onError: () => toast.error("Erro ao excluir nota"),
  });
};
