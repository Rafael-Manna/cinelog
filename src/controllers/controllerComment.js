// Controller dos comentarios feitos nas postagens.

import { Comment, Post } from '../models/associacoes.js';

// POST /comentarios/post/:postId -> cria um comentario em uma postagem.
export const criar = async (req, res) => {
  const { conteudo } = req.body;
  const { postId } = req.params;

  if (!conteudo || !conteudo.trim()) {
    req.flash('error', 'Escreva algo para comentar.');
    return res.redirect(`/posts/${postId}`);
  }

  try {
    const post = await Post.findByPk(postId);
    if (!post) {
      req.flash('error', 'Publicacao nao encontrada.');
      return res.redirect('/');
    }

    await Comment.create({
      conteudo: conteudo.trim(),
      userId: req.session.usuario.id,
      postId: post.id,
      parentId: null // comentario raiz, sem pai
    });

    res.redirect(`/posts/${post.id}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Erro ao comentar.');
    res.redirect(`/posts/${postId}`);
  }
};

// POST /comentarios/:id/responder -> cria uma resposta a um comentario existente.
// O :id aqui e o ID do comentario PAI (o que esta sendo respondido).
export const responder = async (req, res) => {
  const { conteudo } = req.body;
  const parentId = req.params.id;

  if (!conteudo || !conteudo.trim()) {
    req.flash('error', 'Escreva algo para responder.');
    return res.redirect('/');
  }

  try {
    // Busca o comentario pai pra garantir que ele existe e pra pegar o postId.
    const pai = await Comment.findByPk(parentId);
    if (!pai) {
      req.flash('error', 'Comentario nao encontrado.');
      return res.redirect('/');
    }

    // Regra: respostas so podem ser feitas em comentarios "raiz", nao em outras
    // respostas. Isso mantem o nivel de aninhamento sempre em 1.
    // Se alguem tentar responder a uma resposta (pai.parentId nao e null),
    // a gente "redireciona" a resposta pro comentario raiz.
    const idRealDoPai = pai.parentId === null ? pai.id : pai.parentId;

    await Comment.create({
      conteudo: conteudo.trim(),
      userId: req.session.usuario.id,
      postId: pai.postId,
      parentId: idRealDoPai
    });

    res.redirect(`/posts/${pai.postId}#comentario-${idRealDoPai}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Erro ao responder.');
    res.redirect('/');
  }
};

// POST /comentarios/:id/excluir -> apaga um comentario.
// Por causa do CASCADE nas associacoes, se for um comentario raiz, suas
// respostas tambem somem juntas.
export const deletar = async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) {
      req.flash('error', 'Comentario nao encontrado.');
      return res.redirect('/');
    }

    const ehDono = comment.userId === req.session.usuario.id;
    const ehAdmin = req.session.usuario.role === 'admin';
    if (!ehDono && !ehAdmin) {
      req.flash('error', 'Voce nao pode excluir esse comentario.');
      return res.redirect(`/posts/${comment.postId}`);
    }

    const postId = comment.postId;
    await comment.destroy();

    req.flash('success', 'Comentario excluido.');
    res.redirect(`/posts/${postId}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Erro ao excluir comentario.');
    res.redirect('/');
  }
};
