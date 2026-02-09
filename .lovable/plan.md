

# EduConnect - Sistema de Gestão Escolar

Reconstrução completa do EduConnect como aplicação React profissional com backend Supabase.

## 1. Autenticação e Login
- Tela de login com seleção de papel (Professor / Aluno)
- Autenticação via Supabase Auth (email + senha)
- Redirecionamento automático baseado no perfil do usuário
- Logout funcional com limpeza de sessão

## 2. Layout Principal
- Sidebar elegante com navegação (gradiente navy/indigo)
- Menu adaptativo por papel (Professor vê Dashboard/Alunos/Relatórios/Configurações; Aluno vê apenas Boletim)
- Toggle de Dark Mode
- Layout responsivo com menu hamburger no mobile
- Avatar e informações do usuário na sidebar

## 3. Dashboard do Professor
- **Cards de estatísticas**: Total de Alunos, Média Geral, Alunos em Recuperação
- **Seletor de Turma**: Dropdown para alternar entre turmas + botão "Nova Turma"
- **Formulário de Nota**: Selecionar aluno, nota (0-10), data, tipo de avaliação (Prova/Trabalho/Participação)
- **Gráfico de distribuição de notas** (rosca/doughnut com faixas A-F)
- **Tabela de alunos**: Nome, última nota, média, status (badge verde "Aprovado" / vermelho "Alerta"), ações
- **Gráfico de evolução temporal** das notas dos alunos
- **Botão Demo**: Gerar dados aleatórios para apresentações

## 4. Gestão de Alunos
- Cadastro de novos alunos com validação
- Listagem com busca por nome e filtros (Todos/Aprovados/Em Recuperação)
- Cálculo automático de média no frontend
- Exclusão de alunos com modal de confirmação
- Histórico de notas por aluno (modal com timeline)
- Geração de QR Code individual com boletim digital

## 5. Boletim do Aluno
- Painel simplificado com informações pessoais
- Cards: Total de Notas e Média Final
- Status de aprovação visual (aprovado/recuperação)
- Gráfico de evolução pessoal das notas

## 6. Relatórios
- Gráfico de barras com distribuição por faixa de notas
- Ranking de desempenho com medalhas (🥇🥈🥉)
- Exportação CSV e PDF da lista de alunos

## 7. Configurações
- Nome da escola e turma
- Nota mínima de aprovação (customizável)
- Nota para recuperação (customizável)
- Status de conexão com Supabase

## 8. Funcionalidades Transversais
- Feedback visual com toasts ao salvar/excluir
- Animações de entrada nas linhas da tabela
- Sincronização em tempo real via Supabase Realtime
- Validação de formulários (notas entre 0-10, campos obrigatórios)
- Design responsivo completo (mobile e desktop)

