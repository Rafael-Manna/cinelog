import { Comment, Post } from '../models/associacoes.js';

export const criar = async (req, res) => {
  const { conteudo } = req.body;
  const { postId } = req.params;

  if (!conteudo?.trim()) {
    req.flash('error', 'Escreva algo para comentar.');
    return res.redirect(`/posts/${postId}`);
  }

  const post = await Post.findByPk(postId);
  if (!post) {
    req.flash('error', 'Publicacao nao encontrada.');
    return res.redirect('/');
  }

  await Comment.create({
    conteudo: conteudo.trim(),
    userId: req.session.usuario.id,
    postId: post.id
  });
  res.redirect(`/posts/${post.id}`);
};

export const deletar = async (req, res) => {
  const comment = await Comment.findByPk(req.params.id);
  if (!comment) {
    req.flash('error', 'Comentario nao encontrado.');
    return res.redirect('/');
  }
  if (comment.userId !== req.session.usuario.id) {
    req.flash('error', 'Voce nao pode excluir esse comentario.');
    return res.redirect(`/posts/${comment.postId}`);
  }
  const postId = comment.postId;
  await comment.destroy();
  req.flash('success', 'Comentario excluido.');
  res.redirect(`/posts/${postId}`);
};
