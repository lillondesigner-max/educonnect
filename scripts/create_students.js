
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ttjduaakqqazdgjatwke.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0amR1YWFrcXFhemRnamF0d2tlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2Njg5NjMsImV4cCI6MjA4NjI0NDk2M30.3l4cUgqAYjgSUnR2uj_E-uu0uzLmA_UkRgT4Bt_ezCU';
const supabase = createClient(supabaseUrl, supabaseKey);

const students = [{ "idx": 0, "id": "035a05e8-d4e7-4dc0-9821-ade8ff49118d", "nome": "Estêvão Ferreira", "matricula": "20244067", "turma_id": "1811abdb-b538-48f6-90da-cf2756df7c47", "created_at": "2026-02-09 21:58:50.752975+00" }, { "idx": 1, "id": "072f27c5-dffb-49c4-bb57-15e27d6ff322", "nome": "Ana Silva", "matricula": "20248937", "turma_id": "1811abdb-b538-48f6-90da-cf2756df7c47", "created_at": "2026-02-09 21:58:50.752975+00" }, { "idx": 2, "id": "1dcab42f-74bf-4b2a-bdc9-00b926b8c2fb", "nome": "Felipe Lima", "matricula": "196325", "turma_id": "79702246-27b9-44a2-b994-e31c75c50137", "created_at": "2026-02-09 22:53:21.998922+00" }, { "idx": 3, "id": "2ae4945e-7c94-4991-a3e1-0dcee215573b", "nome": "Gabriela Rocha", "matricula": "254904", "turma_id": "79702246-27b9-44a2-b994-e31c75c50137", "created_at": "2026-02-09 22:53:22.436521+00" }, { "idx": 4, "id": "3e43734e-a079-410d-9a07-0b11b0a6fac8", "nome": "Diana Costa", "matricula": "20241838", "turma_id": "1811abdb-b538-48f6-90da-cf2756df7c47", "created_at": "2026-02-09 21:58:50.752975+00" }, { "idx": 5, "id": "63fab476-87f4-42f0-a703-b7732465aac8", "nome": "Carla Dias", "matricula": "536314", "turma_id": "79702246-27b9-44a2-b994-e31c75c50137", "created_at": "2026-02-09 22:53:20.563494+00" }, { "idx": 6, "id": "6c7a1a1f-303e-407d-9e43-bbe969747cc4", "nome": "Ana Silva", "matricula": "723976", "turma_id": "79702246-27b9-44a2-b994-e31c75c50137", "created_at": "2026-02-09 22:53:19.569377+00" }, { "idx": 7, "id": "a10bc719-de90-4ba9-b6c0-4a2e42f17292", "nome": "Bruno Costa", "matricula": "389495", "turma_id": "79702246-27b9-44a2-b994-e31c75c50137", "created_at": "2026-02-09 22:53:20.111947+00" }, { "idx": 8, "id": "a87e124d-d3ac-45c3-85fb-11be1905ce98", "nome": "Bruno Santos", "matricula": "20241953", "turma_id": "1811abdb-b538-48f6-90da-cf2756df7c47", "created_at": "2026-02-09 21:58:50.752975+00" }, { "idx": 9, "id": "afc95360-66d3-4c30-9f53-f670a33c7660", "nome": "Daniel Souza", "matricula": "243365", "turma_id": "79702246-27b9-44a2-b994-e31c75c50137", "created_at": "2026-02-09 22:53:21.129933+00" }, { "idx": 10, "id": "b6b605de-3369-4cd3-8eeb-70c5cd1e62b7", "nome": "João Alves", "matricula": "948577", "turma_id": "79702246-27b9-44a2-b994-e31c75c50137", "created_at": "2026-02-09 22:53:23.948556+00" }, { "idx": 11, "id": "ba176ff8-0c24-4ce3-89b1-932345d43904", "nome": "Elena Martins", "matricula": "729616", "turma_id": "79702246-27b9-44a2-b994-e31c75c50137", "created_at": "2026-02-09 22:53:21.604559+00" }, { "idx": 12, "id": "cdc674a6-b688-47ac-9d3c-d84ccdda435b", "nome": "Hugo Santos", "matricula": "107839", "turma_id": "79702246-27b9-44a2-b994-e31c75c50137", "created_at": "2026-02-09 22:53:22.838965+00" }, { "idx": 13, "id": "d3011904-87e8-417a-a015-81e05c757984", "nome": "Isabela Ferreira", "matricula": "517796", "turma_id": "79702246-27b9-44a2-b994-e31c75c50137", "created_at": "2026-02-09 22:53:23.49971+00" }, { "idx": 14, "id": "f54c15d3-c320-4dae-935c-31a5d076cc7c", "nome": "Carlos Oliveira", "matricula": "20247579", "turma_id": "1811abdb-b538-48f6-90da-cf2756df7c47", "created_at": "2026-02-09 21:58:50.752975+00" }];

async function createUsers() {
    console.log('Starting user creation process...');

    for (const student of students) {
        if (!student.matricula) {
            console.log(`Skipping ${student.nome} - No matricula`);
            continue;
        }

        const email = `${student.matricula}@educonnect.com`;
        const password = '123456'; // Default password

        // Check if user already exists
        // We can't easily check auth users with client key, so we try to sign up
        // and catch the error if it says "User already registered"

        console.log(`Creating user for ${student.nome} (${email})...`);

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    nome: student.nome,
                    role: 'student' // This triggers the mapping in AuthContext or profile creation
                }
            }
        });

        if (error) {
            console.error(`Error creating ${student.nome}:`, error.message);
        } else {
            if (data.user) {
                console.log(`Success! User created: ${data.user.id}`);
                // The profile trigger in Supabase should handle the profile creation.
                // However, since we already have the ALUNO record, we might want to ensure they link?
                // The current logic links by NAME match in useAlunos logic.
                // So creating the profile with the SAME NAME is crucial.
            } else {
                console.log(`User creation initiated (check email confirmation if enabled): ${student.nome}`);
            }
        }

        // Small delay to avoid rate limits
        await new Promise(r => setTimeout(r, 500));
    }

    console.log('Process completed.');
}

createUsers();
