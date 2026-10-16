// Controlador de postagens e avaliações em conjunto para a API móvel.
import { Post, User, Comment, Analise, Lista, ListaMembro } from '../models/associacoes.js';

export const listar = async (req, res) => {
  try {
    const { categoria } = req.query;
    const condicao = {};
    if (categoria && categoria !== 'todos') {
      condicao.categoria = categoria.trim().toLowerCase();
    }

    const posts = await Post.findAll({
      where: condicao,
      include: [
        { model: User, attributes: ['id', 'nome', 'avatarUrl'] },
        { model: Analise, include: [{ model: Lista, attributes: ['id', 'nome'] }] }
      ],
      order: [['createdAt', 'DESC']]
    });

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

    for (const grupo of grupos) {
      if (grupo.tipo !== 'analise') continue;
      grupo.totalMembros = await ListaMembro.count({ where: { listaId: grupo.analise.listaId } });
    }

    return res.json({ dados: grupos });
  } catch (err) {
    console.error('Erro ao listar posts mobile:', err);
    return res.status(500).json({ mensagem: 'Erro ao listar publicações.' });
  }
};

export const criar = async (req, res) => {
  const { titulo, categoria, nota, conteudo, posterUrl, imdbId, analiseId } = req.body;

  if (!titulo || !categoria || nota === undefined || !conteudo) {
    return res.status(400).json({ mensagem: 'Preencha todos os campos obrigatórios.' });
  }

  try {
    let analise = null;
    if (analiseId) {
      analise = await Analise.findByPk(analiseId);
      if (!analise) {
        return res.status(404).json({ mensagem: 'Análise conjunta não encontrada.' });
      }
      const membro = await ListaMembro.findOne({
        where: { listaId: analise.listaId, userId: req.usuario.id }
      });
      if (!membro) {
        return res.status(403).json({ mensagem: 'Você não participa da lista desta análise.' });
      }
      const jaEscreveu = await Post.findOne({
        where: { analiseId: analise.id, userId: req.usuario.id }
      });
      if (jaEscreveu) {
        return res.status(400).json({ mensagem: 'Você já escreveu a sua parte desta análise.' });
      }
    }

    const post = await Post.create({
      titulo: titulo.trim(),
      categoria: categoria.trim().toLowerCase(),
      nota: parseInt(nota, 10),
      conteudo: conteudo.trim(),
      posterUrl: posterUrl ? posterUrl.trim() : null,
      imdbId: imdbId ? imdbId.trim() : null,
      userId: req.usuario.id,
      analiseId: analise ? analise.id : null
    });

    const postCriado = await Post.findByPk(post.id, {
      include: [
        { model: User, attributes: ['id', 'nome', 'avatarUrl'] },
        { model: Analise, include: [{ model: Lista, attributes: ['id', 'nome'] }] }
      ]
    });

    return res.status(201).json({
      mensagem: analise ? 'Sua parte da análise foi publicada.' : 'Publicação criada com sucesso.',
      dados: postCriado
    });
  } catch (err) {
    console.error('Erro ao criar post mobile:', err);
    return res.status(500).json({ mensagem: 'Erro interno ao salvar publicação.' });
  }
};

export const detalhe = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [
        { model: User, attributes: ['id', 'nome', 'avatarUrl'] },
        { model: Analise, include: [{ model: Lista, attributes: ['id', 'nome'] }] },
        {
          model: Comment,
          include: [{ model: User, attributes: ['id', 'nome', 'avatarUrl'] }]
        }
      ],
      order: [[Comment, 'createdAt', 'ASC']]
    });

    if (!post) {
      return res.status(404).json({ mensagem: 'Publicação não encontrada.' });
    }

    return res.json({ dados: post });
  } catch (err) {
    console.error('Erro ao buscar detalhe do post mobile:', err);
    return res.status(500).json({ mensagem: 'Erro ao carregar detalhes.' });
  }
};

export const atualizar = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) {
      return res.status(404).json({ mensagem: 'Publicação não encontrada.' });
    }
    if (post.userId !== req.usuario.id) {
      return res.status(403).json({ mensagem: 'Você não tem permissão para editar esta publicação.' });
    }

    const { titulo, categoria, nota, conteudo } = req.body;
    if (titulo) post.titulo = titulo.trim();
    if (categoria) post.categoria = categoria.trim().toLowerCase();
    if (nota !== undefined) post.nota = parseInt(nota, 10);
    if (conteudo) post.conteudo = conteudo.trim();

    await post.save();

    return res.json({
      mensagem: 'Publicação atualizada com sucesso.',
      dados: post
    });
  } catch (err) {
    console.error('Erro ao atualizar post mobile:', err);
    return res.status(500).json({ mensagem: 'Erro ao atualizar publicação.' });
  }
};

export const deletar = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) {
      return res.status(404).json({ mensagem: 'Publicação não encontrada.' });
    }
    if (post.userId !== req.usuario.id) {
      return res.status(403).json({ mensagem: 'Você não tem permissão para excluir esta publicação.' });
    }

    await post.destroy();
    return res.json({ mensagem: 'Publicação excluída com sucesso.' });
  } catch (err) {
    console.error('Erro ao excluir post mobile:', err);
    return res.status(500).json({ mensagem: 'Erro ao excluir publicação.' });
  }
};
