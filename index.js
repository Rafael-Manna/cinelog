// Carrega as variaveis do arquivo .env e coloca elas dentro do process.env.
// Precisa ser a primeira linha do arquivo, antes de qualquer outro require usar
// process.env (ex: a porta e o segredo da sessao).
require('dotenv').config();

// path -> modulo nativo do Node para montar caminhos de arquivo de forma
// segura (cuida da diferenca entre Windows usar \ e Linux/Mac usar /).
const path = require('path');

// express -> o framework que cria o servidor web e gerencia rotas.
const express = require('express');

// express-session -> guarda dados do usuario logado em uma sessao no servidor,
// e manda um cookie pro navegador com o identificador dessa sessao.
const session = require('express-session');

// connect-flash -> permite mostrar mensagens que aparecem UMA vez (ex: "Login feito!")
// e somem na proxima pagina. Bom para feedback rapido.
const flash = require('connect-flash');

// Importa a conexao com o banco (Sequelize + SQLite). Ver src/config/orm.js
const sequelize = require('./src/config/orm');

// Carrega os models. So o fato de "require" ja registra eles no Sequelize.
require('./src/models/User');
require('./src/models/Post');
require('./src/models/Comment');
require('./src/models/Follow');

// Carrega as associacoes entre os models (User tem Posts, Post tem Comments, etc).
// Tem que vir DEPOIS dos models acima.
require('./src/models/associacoes');

// Importa os arquivos que definem as rotas (URLs) da aplicacao.
const routeAuth = require('./src/routes/routeAuth');
const routePost = require('./src/routes/routePost');
const routeComment = require('./src/routes/routeComment');
const routeAdmin = require('./src/routes/routeAdmin');
const routeUser = require('./src/routes/routeUser');
const routeBusca = require('./src/routes/routeBusca');

// Cria a instancia do app Express. E nesse objeto que registramos rotas,
// middlewares, etc.
const app = express();

// Porta onde o servidor vai escutar. Tenta pegar do .env, se nao tiver usa 3000.
const PORT = process.env.PORT || 3000;

// Diz pro Express que vamos usar EJS como motor de template.
app.set('view engine', 'ejs');

// Diz onde ficam os arquivos .ejs (a pasta "views" na raiz do projeto).
app.set('views', path.join(__dirname, 'views'));

// Middleware que entende formularios HTML (Content-Type: application/x-www-form-urlencoded).
// Sem isso, req.body vem vazio quando voce envia um <form>.
app.use(express.urlencoded({ extended: true }));

// Middleware que entende JSON no corpo da requisicao. Util se um dia voce
// chamar a API com fetch enviando JSON.
app.use(express.json());

// Serve arquivos estaticos (CSS, imagens, JS do navegador) da pasta src/public.
// Ex: o style.css fica em src/public/css/style.css e e acessado por /css/style.css
app.use(express.static(path.join(__dirname, 'src', 'public')));

// Configura o sistema de sessao.
app.use(session({
  // Chave usada pra assinar o cookie da sessao. Em producao, NUNCA deixar no codigo.
  secret: process.env.SESSION_SECRET || 'fallback-dev-only',
  // false = nao salva a sessao no banco se nada mudou (economiza recurso).
  resave: false,
  // false = nao cria sessao vazia (so cria quando algo for guardado, tipo o login).
  saveUninitialized: false,
  // Tempo de vida do cookie no navegador: 24 horas em milissegundos.
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

// Ativa as mensagens flash (precisa vir DEPOIS do session, porque usa a sessao).
app.use(flash());

// Middleware "global" que roda em TODA requisicao. Coloca dados em res.locals
// pra ficarem disponiveis automaticamente em qualquer view EJS sem precisar
// passar manualmente.
app.use((req, res, next) => {
  // Usuario logado (ou null). Assim qualquer view pode fazer "<% if (usuario) %>"
  res.locals.usuario = req.session.usuario || null;
  // Mensagem de sucesso (some apos exibir).
  res.locals.success = req.flash('success');
  // Mensagem de erro (some apos exibir).
  res.locals.error = req.flash('error');
  // next() = "ok, pode passar pro proximo middleware/rota". Sem isso, a requisicao trava.
  next();
});

// Registra os grupos de rotas. O primeiro argumento e o "prefixo" da URL.
// Ex: /posts/novo cai dentro de routePost.
app.use('/', routeAuth);
app.use('/posts', routePost);
app.use('/comentarios', routeComment);
app.use('/admin', routeAdmin);
app.use('/usuarios', routeUser);
app.use('/api/buscar', routeBusca);

// Se nenhuma rota acima respondeu, cai aqui = 404 (pagina nao encontrada).
app.use((req, res) => {
  res.status(404).render('erro', { mensagem: 'Pagina nao encontrada' });
});

// Funcao que cria um usuario admin automaticamente se ainda nao existir nenhum.
// Util pra voce poder logar como admin no primeiro start do projeto.
async function seedAdmin() {
  const bcrypt = require('bcryptjs');
  const User = require('./src/models/User');
  const totalAdmins = await User.count({ where: { role: 'admin' } });
  if (totalAdmins === 0) {
    // bcrypt.hash transforma a senha em um hash (texto embaralhado).
    // O 10 e o "custo" do hash (mais alto = mais seguro, mais lento).
    const hash = await bcrypt.hash('admin123', 10);
    await User.create({
      nome: 'Administrador',
      email: 'admin@admin.com',
      senha: hash,
      role: 'admin'
    });
    console.log('Admin inicial criado -> email: admin@admin.com / senha: admin123');
  }
}

// sequelize.sync() -> cria as tabelas que ainda nao existem, mas NAO altera as ja criadas.
// Se voce mudar um model (adicionar coluna, etc), apague o bd.sqlite e deixe recriar.
// O alter:true brigava com SQLite + foreign keys, entao ficamos no sync simples.
sequelize.sync().then(async () => {
  await seedAdmin();
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}).catch(err => {
  // Se der erro ao conectar/criar tabelas, mostra no console.
  console.error('Erro ao sincronizar o banco:', err);
});
