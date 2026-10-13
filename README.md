# CineLog

Rede social de avaliacoes de filmes, series e outras obras — inspirada no Letterboxd, com foco em aprendizado de Node.js, Express e SQL relacional.

Projeto pessoal de estudo: autenticacao com sessao, CRUD completo, sistema de seguidores, comentarios com respostas, upload de avatar e integracao com a API do OMDb para autocomplete de titulos com poster.

## Stack

- **Backend:** Node.js + Express 4
- **Banco:** Sequelize 6 (ORM) — SQLite no desenvolvimento, Postgres em producao (decidido pela `DATABASE_URL`)
- **Views:** EJS (com partials reusaveis)
- **Auth:** express-session + bcryptjs
- **Upload:** multer (avatares)
- **API externa:** OMDb (busca de filmes/series com poster)
- **Icones:** Font Awesome 6 (via CDN)
- **Variaveis de ambiente:** dotenv

## Funcionalidades

- Cadastro, login, logout (com hash bcrypt)
- Perfil editavel com foto e bio
- Perfil publico de qualquer usuario
- Seguir / deixar de seguir outros usuarios
- CRUD de avaliacoes (titulo, categoria, nota 1-5, texto)
- Filtro do feed por categoria
- Autocomplete de filmes/series via OMDb, com poster automatico
- Comentarios em qualquer publicacao
- Respostas a comentarios (1 nivel, estilo Instagram)
- Listas em conjunto (mashup): voce cria a lista, convida amigos pelo email da conta
  e cada filme indicado so entra quando **todos os membros concordam** (um "nao quero"
  de qualquer membro veta o item ate a pessoa mudar o voto)
- Painel administrativo (estatisticas, gerenciamento de usuarios)

## Estrutura

```
letterbox-app/
├── src/
│   ├── config/orm.js               # conexao Sequelize + SQLite
│   ├── controllers/                # logica de cada feature
│   ├── database/bd.sqlite          # banco (gerado no 1o start, no .gitignore)
│   ├── middlewares/                # autenticacao e upload
│   ├── models/                     # tabelas (User, Post, Comment, Lista,
│   │                               #   ListaMembro, ListaItem, ItemVoto)
│   ├── public/                     # css e uploads/
│   └── routes/                     # URLs da aplicacao
├── views/                          # templates EJS
│   ├── partials/                   # header, footer, avatar, estrelas
│   └── admin/                      # views da area admin
├── .env.example                    # template das variaveis (copie para .env)
├── index.js                        # ponto de entrada
└── package.json
```

## Pre-requisitos

- **Node.js 18 ou superior** (necessario porque usamos `fetch` nativo e `--watch`)
- **Git**
- Uma conta no GitHub (se for clonar via HTTPS sem token, vai precisar)

Verifique sua versao do Node:
```bash
node -v
```

## Rodando localmente

### 1. Clone o repositorio

```bash
git clone https://github.com/Rafael-Manna/cinelog.git
cd cinelog
```

### 2. Instale as dependencias

```bash
npm install
```

### 3. Configure as variaveis de ambiente

Copie o template:

```bash
# No Windows (PowerShell):
Copy-Item .env.example .env

# No Linux/Mac:
cp .env.example .env
```

Abra o `.env` e ajuste:

```
PORT=3000
SESSION_SECRET=coloque-aqui-uma-string-longa-e-aleatoria
OMDB_API_KEY=
```

#### Como pegar a chave do OMDb (gratis)

1. Acesse http://www.omdbapi.com/apikey.aspx
2. Selecione **FREE! (1,000 daily limit)**
3. Preencha nome, email e uma descricao breve do projeto
4. Voce recebera **dois emails**: um pra ativar a chave (clique no link) e outro com a chave em si
5. Cole a chave no `.env`:
   ```
   OMDB_API_KEY=sua_chave_aqui
   ```

Sem a chave, o app funciona normalmente, mas o autocomplete de filmes fica desativado (voce pode digitar titulos manualmente).

### 4. Inicie o servidor

Modo desenvolvimento (com auto-reload ao salvar arquivos):
```bash
npm run dev
```

Modo producao (sem auto-reload):
```bash
npm start
```

Acesse **http://localhost:3000**.

### 5. Login inicial

Na primeira execucao, um admin e criado automaticamente:

- **Email:** admin@admin.com
- **Senha:** admin123

Troque a senha (ou crie outra conta admin) antes de usar em qualquer ambiente real.

## Colocando no ar de graca (Render + Neon)

O plano gratuito do Render tem **disco efemero**: o arquivo do SQLite seria apagado
a cada restart ou deploy. Por isso em producao o banco e um Postgres gerenciado.
Nao e preciso mudar nada no codigo — o `src/config/orm.js` usa Postgres quando
existe `DATABASE_URL` e cai no SQLite local quando ela nao existe.

1. **Banco:** crie um projeto gratuito no [Neon](https://neon.com) e copie a
   connection string (algo como `postgresql://...@...neon.tech/neondb?sslmode=require`).
   Evite o Postgres gratuito do proprio Render: ele expira depois de alguns meses.
2. **Repositorio:** suba o projeto para o GitHub.
3. **App:** no [Render](https://render.com), crie um **Blueprint** apontando para o
   repositorio — ele le o `render.yaml` daqui e ja configura build, start e
   `NODE_ENV`, alem de gerar o `SESSION_SECRET` sozinho.
4. **Variaveis:** no painel, preencha `DATABASE_URL` (passo 1) e `OMDB_API_KEY`.
5. Na primeira subida o `sequelize.sync()` cria as tabelas no Postgres, e o
   `connect-pg-simple` cria a tabela de sessoes. E so acessar a URL e se cadastrar.

O que esperar do plano gratuito:

- O servico **dorme depois de 15 minutos** sem acesso; a visita seguinte espera
  uns 30-60s pra acordar.
- **Avatares enviados somem** em cada restart, porque continuam indo pro disco
  local. Pra resolver de verdade, trocar o `src/middlewares/upload.js` por um
  servico de imagens (Cloudinary tem free tier). As avaliacoes, listas e votos
  nao sao afetados — tudo isso esta no Postgres.
- Se o seu provedor de Postgres usar certificado proprio (nao e o caso de Neon
  nem Render), a conexao vai falhar na validacao do SSL; nesse caso ajuste o
  `dialectOptions.ssl` no `src/config/orm.js`.

## Observacoes para desenvolvimento

### Atualizando o banco apos mudar models

A pasta `src/database/` e o arquivo `bd.sqlite` sao criados sozinhos no primeiro start (o SQLite nao cria o diretorio do arquivo, entao quem cria e o `src/config/orm.js`). As foreign keys tambem sao ligadas por conexao ali, com `PRAGMA foreign_keys = ON` — sem isso o `onDelete: CASCADE` dos models e ignorado.

O projeto usa `sequelize.sync()` simples (nao `alter:true`) porque o `alter:true` briga com SQLite + foreign keys. Quando voce **alterar a estrutura de algum model** (adicionar coluna, mudar tipo, etc), apague o banco e deixe ser recriado:

```bash
# Windows (PowerShell):
Remove-Item src\database\bd.sqlite

# Linux/Mac:
rm src/database/bd.sqlite
```

O admin sera recriado pelo seed automatico, mas usuarios e posts cadastrados serao perdidos.

### Solucao para o erro "running scripts is disabled" no Windows

Se ao rodar `npm` no PowerShell aparecer erro de execution policy, rode uma vez:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Feche e reabra o terminal.

### Upload de avatares

Arquivos enviados ficam em `src/public/uploads/avatars/`. Essa pasta esta no `.gitignore` — cada maquina tem seus proprios uploads. Em producao, voce usaria um servico tipo S3 ou Cloudinary.

## Licenca

Projeto pessoal de estudo, sem fins comerciais.
