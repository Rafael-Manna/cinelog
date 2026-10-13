import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import flash from 'connect-flash';

import sequelize from './src/config/orm.js';
import { aplicarMigracoes } from './src/config/migracoes.js';
import './src/models/User.js';
import './src/models/Post.js';
import './src/models/Comment.js';
import './src/models/Lista.js';
import './src/models/ListaMembro.js';
import './src/models/ListaItem.js';
import './src/models/ItemVoto.js';
import './src/models/Analise.js';
import './src/models/associacoes.js';

import routeAuth from './src/routes/routeAuth.js';
import routePost from './src/routes/routePost.js';
import routeComment from './src/routes/routeComment.js';
import routeBusca from './src/routes/routeBusca.js';
import routeLista from './src/routes/routeLista.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3000;
const emProducao = process.env.NODE_ENV === 'production';

// Em producao o secret de sessao tem que vir do ambiente: com o fallback,
// qualquer um consegue forjar um cookie de login.
if (emProducao && !process.env.SESSION_SECRET) {
  console.error('Defina SESSION_SECRET nas variaveis de ambiente antes de subir.');
  process.exit(1);
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Em hospedagem (Render e afins) o app fica atras de um proxy HTTPS.
// Sem isso o cookie seguro nunca e enviado.
if (emProducao) app.set('trust proxy', 1);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'src', 'public')));

// Guardar sessao em memoria perde todo mundo a cada restart (e vaza memoria em
// producao). Tendo Postgres, as sessoes ficam nele.
const sessionStore = process.env.DATABASE_URL
  ? new (connectPgSimple(session))({
      conObject: { connectionString: process.env.DATABASE_URL },
      createTableIfMissing: true
    })
  : undefined;

app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET || 'fallback-dev-only',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
    secure: emProducao
  }
}));

app.use(flash());

app.use((req, res, next) => {
  res.locals.usuario = req.session.usuario || null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

app.use('/', routeAuth);
app.use('/posts', routePost);
app.use('/comentarios', routeComment);
app.use('/listas', routeLista);
app.use('/api/buscar', routeBusca);

app.use((req, res) => {
  res.status(404).render('erro', { mensagem: 'Pagina nao encontrada' });
});

// Ultimo recurso: sem isso um erro de banco em rota async derruba o processo
app.use((err, req, res, next) => {
  console.error('Erro nao tratado:', err);
  res.status(500).render('erro', { mensagem: 'Algo deu errado. Tente de novo.' });
});

// sync() cria tabelas novas; aplicarMigracoes() adiciona as colunas que
// faltarem nas que ja existem. As duas sao idempotentes, entao rodar a cada
// boot deixa o deploy sem passo manual. Se qualquer uma falhar, o app nao sobe:
// e melhor nao subir do que atender com o banco em estado errado.
sequelize.sync()
  .then(() => aplicarMigracoes(sequelize))
  .then((aplicadas) => {
    if (aplicadas.length) console.log('Migracoes aplicadas:', aplicadas.join(', '));
    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Erro ao preparar o banco:', err);
    process.exit(1);
  });
