import { Post, User, Comment } from '../models/associacoes.js';

export const listar = async (req, res) => {
  const posts = await Post.findAll({
    include: [{ model: User, attributes: ['id', 'nome', 'avatarUrl'] }],
    order: [['createdAt', 'DESC']]
  });
  res.render('index', { posts });
};

export const formNovo = (req, res) => res.render('novaPostagem');

export const criar = async (req, res) => {
  const { titulo, categoria, nota, conteudo, posterUrl, imdbId } = req.body;
  if (!titulo || !categoria || !nota || !conteudo) {
    req.flash('error', 'Preencha todos os campos.');
    return res.redirect('/posts/novo');
  }
  await Post.create({
    titulo,
    categoria: categoria.trim().toLowerCase(),
    nota: parseInt(nota, 10),
    conteudo,
    posterUrl: posterUrl?.trim() || null,
    imdbId: imdbId?.trim() || null,
    userId: req.session.usuario.id
  });
  req.flash('success', 'Publicacao criada.');
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
