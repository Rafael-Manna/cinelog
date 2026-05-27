// Controller das postagens (avaliacoes). Aqui mora o CRUD completo:
// Create, Read, Update, Delete.

import { Post, User, Comment } from '../models/associacoes.js';

// Atributos do User que mostramos junto com os posts/comentarios.
// Centralizamos aqui pra ficar consistente em todas as queries.
const camposAutor = ['id', 'nome', 'avatarUrl'];

// GET / -> lista todas as postagens (feed da home).
export const listar = async (req, res) => {
  try {
    const filtroCategoria = req.query.categoria;
    const where = filtroCategoria ? { categoria: filtroCategoria } : {};

    const posts = await Post.findAll({
      where,
      // Inclui o autor (com avatar) pra mostrar a foto no feed.
      include: [{ model: User, attributes: camposAutor }],
      order: [['createdAt', 'DESC']]
    });

    const categorias = await Post.findAll({
      attributes: ['categoria'],
      group: ['categoria']
    });

    res.render('index', {
      posts,
      categorias: categorias.map(c => c.categoria),
      categoriaAtual: filtroCategoria || null
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Erro ao carregar publicacoes.');
    res.redirect('/login');
  }
};

// GET /posts/novo -> formulario pra criar avaliacao.
export const formNovo = (req, res) => {
  res.render('novaPostagem');
};

// POST /posts/novo -> salva a nova avaliacao no banco.
export const criar = async (req, res) => {
  // posterUrl e imdbId chegam aqui se o usuario escolheu um titulo via autocomplete.
  // Sao opcionais: se digitou o titulo a mao, ficam null.
  const { titulo, categoria, nota, conteudo, posterUrl, imdbId } = req.body;

  if (!titulo || !categoria || !nota || !conteudo) {
    req.flash('error', 'Preencha todos os campos.');
    return res.redirect('/posts/novo');
  }

  try {
    await Post.create({
      titulo,
      categoria: categoria.trim().toLowerCase(),
      nota: parseInt(nota, 10),
      conteudo,
      // Se nao vier nada, deixamos null. trim() pra evitar string vazia salva como ""
      posterUrl: posterUrl && posterUrl.trim() ? posterUrl.trim() : null,
      imdbId: imdbId && imdbId.trim() ? imdbId.trim() : null,
      userId: req.session.usuario.id
    });

    req.flash('success', 'Publicacao criada.');
    res.redirect('/');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Erro ao criar publicacao.');
    res.redirect('/posts/novo');
  }
};

// GET /posts/:id -> pagina de detalhe de uma postagem (com comentarios e respostas).
export const detalhe = async (req, res) => {
  try {
    // Query complexa: trazer o post + autor + comentarios "raiz" (sem pai)
    // + para cada comentario, suas respostas + para cada um, o autor.
    const post = await Post.findByPk(req.params.id, {
      include: [
        // Autor do post.
        { model: User, attributes: camposAutor },

        // Comentarios "raiz" (parentId null) e suas respostas.
        {
          model: Comment,
          // required: false -> ainda traz o post mesmo se nao tiver comentarios.
          required: false,
          where: { parentId: null },
          include: [
            // Autor do comentario.
            { model: User, attributes: camposAutor },
            // As respostas desse comentario.
            {
              model: Comment,
              as: 'Respostas',
              include: [{ model: User, attributes: camposAutor }]
            }
          ]
        }
      ],
      // Ordena os comentarios e as respostas pelo mais antigo primeiro.
      order: [
        [Comment, 'createdAt', 'ASC'],
        [Comment, { model: Comment, as: 'Respostas' }, 'createdAt', 'ASC']
      ]
    });

    if (!post) {
      req.flash('error', 'Publicacao nao encontrada.');
      return res.redirect('/');
    }

    res.render('detalhePostagem', { post });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Erro ao carregar publicacao.');
    res.redirect('/');
  }
};

// GET /posts/:id/editar -> formulario de edicao.
export const formEditar = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) {
      req.flash('error', 'Publicacao nao encontrada.');
      return res.redirect('/');
    }

    const ehDono = post.userId === req.session.usuario.id;
    const ehAdmin = req.session.usuario.role === 'admin';
    if (!ehDono && !ehAdmin) {
      req.flash('error', 'Voce nao pode editar essa publicacao.');
      return res.redirect('/');
    }

    res.render('editarPostagem', { post });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
};

// POST /posts/:id/editar -> salva a edicao.
export const atualizar = async (req, res) => {
  const { titulo, categoria, nota, conteudo, posterUrl, imdbId } = req.body;
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) {
      req.flash('error', 'Publicacao nao encontrada.');
      return res.redirect('/');
    }

    const ehDono = post.userId === req.session.usuario.id;
    const ehAdmin = req.session.usuario.role === 'admin';
    if (!ehDono && !ehAdmin) {
      req.flash('error', 'Voce nao pode editar essa publicacao.');
      return res.redirect('/');
    }

    post.titulo = titulo;
    post.categoria = categoria.trim().toLowerCase();
    post.nota = parseInt(nota, 10);
    post.conteudo = conteudo;
    // Atualiza poster/imdb so se o usuario escolheu outro titulo na edicao.
    // Se os campos vierem vazios, MANTEM o que ja estava (nao apaga).
    if (posterUrl && posterUrl.trim()) post.posterUrl = posterUrl.trim();
    if (imdbId && imdbId.trim()) post.imdbId = imdbId.trim();
    await post.save();

    req.flash('success', 'Publicacao atualizada.');
    res.redirect(`/posts/${post.id}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Erro ao atualizar publicacao.');
    res.redirect('/');
  }
};

// POST /posts/:id/excluir -> deleta a postagem.
export const deletar = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) {
      req.flash('error', 'Publicacao nao encontrada.');
      return res.redirect('/');
    }

    const ehDono = post.userId === req.session.usuario.id;
    const ehAdmin = req.session.usuario.role === 'admin';
    if (!ehDono && !ehAdmin) {
      req.flash('error', 'Voce nao pode excluir essa publicacao.');
      return res.redirect('/');
    }

    await post.destroy();
    req.flash('success', 'Publicacao excluida.');
    res.redirect('/');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Erro ao excluir publicacao.');
    res.redirect('/');
  }
};
