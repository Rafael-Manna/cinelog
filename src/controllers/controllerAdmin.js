// Controller da area administrativa. Todas as rotas que usam essas funcoes
// estao protegidas pelo middleware somenteAdmin (ver routeAdmin.js).

import { User, Post, Comment } from '../models/associacoes.js';

// GET /admin -> painel com estatisticas gerais.
export const painel = async (req, res) => {
  try {
    // count() retorna a quantidade de registros (SELECT COUNT(*)).
    // Executando tres counts separados aqui por simplicidade.
    const totalUsuarios = await User.count();
    const totalPosts = await Post.count();
    const totalComentarios = await Comment.count();

    res.render('admin/painel', { totalUsuarios, totalPosts, totalComentarios });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Erro ao carregar painel.');
    res.redirect('/');
  }
};

// GET /admin/usuarios -> lista de todos os usuarios.
export const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await User.findAll({
      // attributes limita o que vem do banco. NUNCA exponha o hash da senha.
      attributes: ['id', 'nome', 'email', 'role', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    res.render('admin/usuarios', { usuarios });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Erro ao listar usuarios.');
    res.redirect('/admin');
  }
};

// POST /admin/usuarios/:id/role -> alterna entre user e admin.
export const alternarRole = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      req.flash('error', 'Usuario nao encontrado.');
      return res.redirect('/admin/usuarios');
    }

    // Protecao: nao deixa o admin rebaixar a si mesmo (e ficar travado fora).
    if (user.id === req.session.usuario.id) {
      req.flash('error', 'Voce nao pode alterar seu proprio papel.');
      return res.redirect('/admin/usuarios');
    }

    // Inverte o papel: se era admin vira user, e vice-versa.
    user.role = user.role === 'admin' ? 'user' : 'admin';
    await user.save();

    req.flash('success', `Papel atualizado para ${user.role}.`);
    res.redirect('/admin/usuarios');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Erro ao atualizar papel.');
    res.redirect('/admin/usuarios');
  }
};

// POST /admin/usuarios/:id/excluir -> apaga um usuario.
// Como temos CASCADE nas associacoes, todos os posts e comentarios dele
// somem junto automaticamente.
export const deletarUsuario = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      req.flash('error', 'Usuario nao encontrado.');
      return res.redirect('/admin/usuarios');
    }

    // Mesma protecao do alternarRole: nao deixa o admin apagar a si mesmo.
    if (user.id === req.session.usuario.id) {
      req.flash('error', 'Voce nao pode excluir a propria conta por aqui.');
      return res.redirect('/admin/usuarios');
    }

    await user.destroy();
    req.flash('success', 'Usuario excluido.');
    res.redirect('/admin/usuarios');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Erro ao excluir usuario.');
    res.redirect('/admin/usuarios');
  }
};
