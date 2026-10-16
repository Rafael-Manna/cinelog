// Controlador de comentários para a API móvel.
import { Comment, Post, User } from '../models/associacoes.js';

export const criar = async (req, res) => {
  const { conteudo } = req.body;
  const { postId } = req.params;

  if (!conteudo || !conteudo.trim()) {
    return res.status(400).json({ mensagem: 'Escreva algo para comentar.' });
  }

  try {
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ mensagem: 'Publicação não encontrada.' });
    }

    const comentario = await Comment.create({
      conteudo: conteudo.trim(),
      userId: req.usuario.id,
      postId: post.id
    });

    const comentarioCompleto = await Comment.findByPk(comentario.id, {
      include: [{ model: User, attributes: ['id', 'nome', 'avatarUrl'] }]
    });

    return res.status(201).json({
      mensagem: 'Comentário publicado.',
      dados: comentarioCompleto
    });
  } catch (err) {
    console.error('Erro ao criar comentário mobile:', err);
    return res.status(500).json({ mensagem: 'Erro ao salvar comentário.' });
  }
};

export const deletar = async (req, res) => {
  try {
    const comentario = await Comment.findByPk(req.params.id);
    if (!comentario) {
      return res.status(404).json({ mensagem: 'Comentário não encontrado.' });
    }
    if (comentario.userId !== req.usuario.id) {
      return res.status(403).json({ mensagem: 'Você não pode excluir esse comentário.' });
    }

    await comentario.destroy();
    return res.json({ mensagem: 'Comentário excluído com sucesso.' });
  } catch (err) {
    console.error('Erro ao excluir comentário mobile:', err);
    return res.status(500).json({ mensagem: 'Erro ao excluir comentário.' });
  }
};
