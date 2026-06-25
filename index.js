import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import session from 'express-session';
import flash from 'connect-flash';

import sequelize from './src/config/orm.js';
import './src/models/User.js';
import './src/models/Post.js';
import './src/models/Comment.js';
import './src/models/associacoes.js';

import routeAuth from './src/routes/routeAuth.js';
import routePost from './src/routes/routePost.js';
import routeComment from './src/routes/routeComment.js';
import routeBusca from './src/routes/routeBusca.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'src', 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-dev-only',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
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
app.use('/api/buscar', routeBusca);

app.use((req, res) => {
  res.status(404).render('erro', { mensagem: 'Pagina nao encontrada' });
});

sequelize.sync()
  .then(() => app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  }))
  .catch(err => console.error('Erro ao sincronizar o banco:', err));
