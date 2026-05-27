// Controller de usuarios: perfil publico de qualquer usuario, seguir e deixar de seguir.

import { User, Post, Follow } from '../models/associacoes.js';

// GET /usuarios/:id -> mostra o perfil publico de um usuario.
// Qualquer pessoa logada pode ver o perfil de qualquer outra.
export const perfilPublico = async (req, res) => {
  try {
    const usuarioPerfil = await User.findByPk(req.params.id, {
      attributes: ['id', 'nome', 'bio', 'avatarUrl', 'createdAt'],
      include: [
        // Posts feitos por esse usuario.
        {
          model: Post,
          // Ordenar os posts dentro do include precisa ser feito assim,
          // dentro do proprio include.
          separate: true,
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!usuarioPerfil) {
      req.flash('error', 'Usuario nao encontrado.');
      return res.redirect('/');
    }

    // Conta quantos seguidores esse usuario tem (quantas pessoas o seguem).
    const totalSeguidores = await Follow.count({
      where: { followingId: usuarioPerfil.id }
    });

    // Conta quantas pessoas esse usuario segue.
    const totalSeguindo = await Follow.count({
      where: { followerId: usuarioPerfil.id }
    });

    // Verifica se o usuario LOGADO ja segue esse perfil.
    // Util pra mostrar "Seguir" ou "Deixar de seguir" no botao.
    let jaSegue = false;
    const ehProprioPerfil = req.session.usuario.id === usuarioPerfil.id;

    if (!ehProprioPerfil) {
      const relacao = await Follow.findOne({
        where: {
          followerId: req.session.usuario.id,
          followingId: usuarioPerfil.id
        }
      });
      jaSegue = !!relacao; // !! transforma em booleano (null -> false, objeto -> true)
    }

    res.render('perfilPublico', {
      usuarioPerfil,
      totalSeguidores,
      totalSeguindo,
      jaSegue,
      ehProprioPerfil
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Erro ao carregar perfil.');
    res.redirect('/');
  }
};

// POST /usuarios/:id/seguir -> comeca a seguir um usuario.
export const seguir = async (req, res) => {
  const followerId = req.session.usuario.id;
  const followingId = parseInt(req.params.id, 10);

  // Nao deixa seguir a si mesmo.
  if (followerId === followingId) {
    req.flash('error', 'Voce nao pode seguir a si mesmo.');
    return res.redirect(`/usuarios/${followingId}`);
  }

  try {
    // findOrCreate evita erro caso ja exista (e idempotente).
    // Retorna [registro, criadoAgora?] mas nao precisamos disso aqui.
    await Follow.findOrCreate({
      where: { followerId, followingId }
    });

    res.redirect(`/usuarios/${followingId}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Erro ao seguir.');
    res.redirect(`/usuarios/${followingId}`);
  }
};

// POST /usuarios/:id/parar-de-seguir -> para de seguir.
export const pararDeSeguir = async (req, res) => {
  const followerId = req.session.usuario.id;
  const followingId = parseInt(req.params.id, 10);

  try {
    // Remove o registro da tabela de follows (se existir).
    await Follow.destroy({
      where: { followerId, followingId }
    });

    res.redirect(`/usuarios/${followingId}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Erro ao deixar de seguir.');
    res.redirect(`/usuarios/${followingId}`);
  }
};
