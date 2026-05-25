# CineLog

Rede social de avaliacoes de filmes, series e outras obras — inspirada no Letterboxd, com foco em aprendizado de Node.js, Express e SQL relacional.

Projeto pessoal de estudo: autenticacao com sessao, CRUD completo, sistema de seguidores, comentarios com respostas, upload de avatar e integracao com a API do OMDb para autocomplete de titulos com poster.

## Stack

- **Backend:** Node.js + Express 4
- **Banco:** SQLite via Sequelize 6 (ORM)
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
- Painel administrativo (estatisticas, gerenciamento de usuarios)

## Estrutura

```
letterbox-app/
├── src/
│   ├── config/orm.js               # conexao Sequelize + SQLite
│   ├── controllers/                # logica de cada feature
│   ├── database/bd.sqlite          # banco (gerado no 1o start, no .gitignore)
│   ├── middlewares/                # autenticacao e upload
│   ├── models/                     # tabelas (User, Post, Comment, Follow)
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

## Observacoes para desenvolvimento

### Atualizando o banco apos mudar models

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
