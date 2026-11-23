# Preparatório ENEM

Plataforma de estudos para o ENEM com questões por matéria, simulados, trilhas de aprendizagem e ferramentas para organizar a rotina de estudos.

## Funcionalidades

- Banco com **360 questões originais**, distribuídas em 9 matérias.
- Questões com cinco alternativas, gabarito e resolução comentada.
- Simulados com cronômetro e acompanhamento do desempenho.
- Trilhas de aprendizagem, redação, Pomodoro, planejador semanal e conquistas.
- Salvamento local no navegador e sincronização entre dispositivos com Supabase (opcional).
- Interface responsiva para celular e computador.

## Tecnologias

React 18 · Vite · Tailwind CSS · Lucide React · Supabase (opcional)

## Executar localmente

Requisitos: Node.js e npm.

```bash
npm install
npm run dev
```

Abra no navegador o endereço mostrado no terminal (por padrão, `http://localhost:5173`). Não abra `index.html` diretamente: o projeto precisa ser servido pelo Vite para carregar a aplicação.

### Verificações

```bash
npm run check:questions
npm run build
```

`check:questions` valida a quantidade e a estrutura das questões. `build` gera a versão de produção em `dist/`.

## Persistência e Supabase

O aplicativo funciona sem configuração adicional e salva os dados no `localStorage` do navegador. Para sincronizar os dados entre dispositivos, configure um projeto Supabase:

1. Crie um projeto no [Supabase](https://supabase.com/).
2. No **SQL Editor**, execute o conteúdo de [`supabase/schema.sql`](./supabase/schema.sql). O script cria a tabela de dados e configura as políticas de acesso.
3. Em **Project Settings → API**, obtenha a URL do projeto e a chave pública `anon`.
4. Copie `.env.example` para `.env.local` e preencha as variáveis:

   ```env
   VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
   ```

5. Reinicie o servidor de desenvolvimento após configurar as variáveis.

O login é feito por link enviado por e-mail. Em **Authentication → URL Configuration**, configure o endereço local (`http://localhost:5173/**`) e, após publicar, o domínio do site como URL de redirecionamento.

> Use somente a chave pública `anon` no front-end. Nunca exponha a chave `service_role`.

Sem as variáveis do Supabase, o aplicativo continua funcionando com dados locais.

## Publicar na Vercel

1. Importe este repositório na [Vercel](https://vercel.com/).
2. Configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` nas variáveis de ambiente do projeto, se for usar sincronização.
3. Publique. A configuração do repositório usa `npm run build` e a pasta `dist/`.
4. Se estiver usando Supabase, adicione o domínio de produção à configuração de redirecionamentos de autenticação. Ao alterar variáveis `VITE_*`, faça um novo deploy.

## Estrutura do projeto

```text
src/
  App.jsx                  layout e navegação
  components/              telas e componentes da aplicação
  context/                 contexto de sincronização e autenticação
  data/                    questões, trilhas e conquistas
  hooks/                   estado e persistência dos dados
  lib/                     integração com Supabase, armazenamento e estatísticas
  index.css                estilos globais e Tailwind CSS
  main.jsx                 ponto de entrada React
supabase/
  schema.sql               esquema e políticas do banco
scripts/
  check-questions.mjs      validação do banco de questões
```

## Adicionar ou editar questões

As questões ficam em `src/data/questions/`, organizadas por matéria. Cada questão segue o formato:

```js
["Tópico", "Fácil|Média|Difícil", "Enunciado", "alternativa correta", ["errada 1", "errada 2", "errada 3", "errada 4"], "Resolução passo a passo"]
```

A aplicação distribui as respostas corretas entre as alternativas. Depois de alterar questões, valide os dados com `npm run check:questions`.

## Sobre o conteúdo

As questões incluídas são originais e inspiradas no formato do ENEM; não são reproduções de provas oficiais do INEP.
