import { Post, User, Comment, Analise, Lista, ListaMembro } from '../models/associacoes.js';

export const listar = async (req, res) => {
  const posts = await Post.findAll({
    include: [
      { model: User, attributes: ['id', 'nome', 'avatarUrl'] },
      { model: Analise, include: [{ model: Lista, attributes: ['id', 'nome'] }] }
    ],
    order: [['createdAt', 'DESC']]
  });

  // Postagens da mesma analise viram um card so, exibidas lado a lado.
  // O grupo ocupa no feed a posicao da postagem mais recente dele.
  const grupos = [];
  const porAnalise = new Map();

  for (const post of posts) {
    if (!post.analiseId || !post.Analise) {
      grupos.push({ tipo: 'post', post });
      continue;
    }
    let grupo = porAnalise.get(post.analiseId);
    if (!grupo) {
      grupo = { tipo: 'analise', analise: post.Analise, posts: [] };
      porAnalise.set(post.analiseId, grupo);
      grupos.push(grupo);
    }
    grupo.posts.push(post);
  }

  // para saber se ainda falta alguem da lista escrever a parte dele
  for (const grupo of grupos) {
    if (grupo.tipo !== 'analise') continue;
    grupo.totalMembros = await ListaMembro.count({ where: { listaId: grupo.analise.listaId } });
  }

  res.render('index', { grupos });
};

export const formNovo = async (req, res) => {
  const analise = req.query.analise
    ? await Analise.findByPk(req.query.analise)
    : null;

  if (analise) {
    const membro = await ListaMembro.findOne({
      where: { listaId: analise.listaId, userId: req.session.usuario.id }
    });
    if (!membro) {
      req.flash('error', 'Voce nao participa da lista dessa analise.');
      return res.redirect('/');
    }
    const jaEscreveu = await Post.findOne({
      where: { analiseId: analise.id, userId: req.session.usuario.id }
    });
    if (jaEscreveu) {
      req.flash('error', 'Voce ja escreveu a sua parte dessa analise.');
      return res.redirect(`/posts/${jaEscreveu.id}`);
    }
  }

  res.render('novaPostagem', { analise });
};

export const criar = async (req, res) => {
  const { titulo, categoria, nota, conteudo, posterUrl, imdbId, analiseId } = req.body;
  const voltarPara = analiseId ? `/posts/novo?analise=${analiseId}` : '/posts/novo';

  if (!titulo || !categoria || !nota || !conteudo) {
    req.flash('error', 'Preencha todos os campos.');
    return res.redirect(voltarPara);
  }

  // So membro da lista escreve na analise, e so uma vez
  let analise = null;
  if (analiseId) {
    analise = await Analise.findByPk(analiseId);
    if (!analise) {
      req.flash('error', 'Analise nao encontrada.');
      return res.redirect('/');
    }
    const membro = await ListaMembro.findOne({
      where: { listaId: analise.listaId, userId: req.session.usuario.id }
    });
    if (!membro) {
      req.flash('error', 'Voce nao participa da lista dessa analise.');
      return res.redirect('/');
    }
    const jaEscreveu = await Post.findOne({
      where: { analiseId: analise.id, userId: req.session.usuario.id }
    });
    if (jaEscreveu) {
      req.flash('error', 'Voce ja escreveu a sua parte dessa analise.');
      return res.redirect(`/posts/${jaEscreveu.id}`);
    }
  }

  await Post.create({
    titulo,
    categoria: categoria.trim().toLowerCase(),
    nota: parseInt(nota, 10),
    conteudo,
    posterUrl: posterUrl?.trim() || null,
    imdbId: imdbId?.trim() || null,
    userId: req.session.usuario.id,
    analiseId: analise ? analise.id : null
  });

  req.flash('success', analise
    ? 'Sua parte da analise foi publicada.'
    : 'Publicacao criada.');
  res.redirect('/');
};

export const detalhe = async (req, res) => {
  const post = await Post.findByPk(req.params.id, {
    include: [
      { model: User, attributes: ['id', 'nome', 'avatarUrl'] },
      {
        model: Comment,
        include: [{ model: User, attributes: ['id', 'nome', 'avatarUrl'] }]
      }
    ],
    order: [[Comment, 'createdAt', 'ASC']]
  });
  if (!post) {
    req.flash('error', 'Publicacao nao encontrada.');
    return res.redirect('/');
  }
  res.render('detalhePostagem', { post });
};

export const formEditar = async (req, res) => {
  const post = await Post.findByPk(req.params.id);
  if (!post || post.userId !== req.session.usuario.id) {
    req.flash('error', 'Voce nao pode editar essa publicacao.');
    return res.redirect('/');
  }
  res.render('editarPostagem', { post });
};

export const atualizar = async (req, res) => {
  const post = await Post.findByPk(req.params.id);
  if (!post || post.userId !== req.session.usuario.id) {
    req.flash('error', 'Voce nao pode editar essa publicacao.');
    return res.redirect('/');
  }
  const { titulo, categoria, nota, conteudo } = req.body;
  post.titulo = titulo;
  post.categoria = categoria.trim().toLowerCase();
  post.nota = parseInt(nota, 10);
  post.conteudo = conteudo;
  await post.save();
  req.flash('success', 'Publicacao atualizada.');
  res.redirect(`/posts/${post.id}`);
};

export const deletar = async (req, res) => {
  const post = await Post.findByPk(req.params.id);
  if (!post || post.userId !== req.session.usuario.id) {
    req.flash('error', 'Voce nao pode excluir essa publicacao.');
    return res.redirect('/');
  }
  await post.destroy();
  req.flash('success', 'Publicacao excluida.');
  res.redirect('/');
};
