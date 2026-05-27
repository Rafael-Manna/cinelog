// Controller de autenticacao: cuida de cadastro, login, logout e perfil.
// Controller = funcoes que recebem a requisicao, conversam com o banco
// e devolvem uma resposta (renderiza view ou redireciona).

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// bcryptjs = biblioteca pra fazer HASH de senhas. Nunca guardamos senha em texto plano.
import bcrypt from 'bcryptjs';
import { User, Follow } from '../models/associacoes.js';

// Recriacao do __dirname pra ESM (precisamos pra apagar avatar antigo do disco).
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GET /login -> mostra o formulario de login.
export const formLogin = (req, res) => {
  res.render('login');
};

// GET /registro -> mostra o formulario de cadastro.
export const formRegistro = (req, res) => {
  res.render('registro');
};

// POST /registro -> processa o cadastro de um novo usuario.
export const registrar = async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    req.flash('error', 'Preencha todos os campos.');
    return res.redirect('/registro');
  }

  try {
    const existente = await User.findOne({ where: { email } });
    if (existente) {
      req.flash('error', 'Email ja cadastrado.');
      return res.redirect('/registro');
    }

    const hash = await bcrypt.hash(senha, 10);
    await User.create({ nome, email, senha: hash, role: 'user' });

    req.flash('success', 'Conta criada! Faca login.');
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Erro ao criar conta.');
    res.redirect('/registro');
  }
};

// POST /login -> processa o login.
export const login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      req.flash('error', 'Email ou senha invalidos.');
      return res.redirect('/login');
    }

    const ok = await bcrypt.compare(senha, user.senha);
    if (!ok) {
      req.flash('error', 'Email ou senha invalidos.');
      return res.redirect('/login');
    }

    // Salva os dados do usuario na sessao. avatarUrl tambem vai junto pra
    // navbar conseguir mostrar a foto sem precisar consultar o banco a cada request.
    req.session.usuario = {
      id: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl
    };

    req.flash('success', `Bem-vindo, ${user.nome}!`);
    res.redirect('/');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Erro ao fazer login.');
    res.redirect('/login');
  }
};

// POST /logout -> destroi a sessao (desloga o usuario).
export const logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};

// GET /perfil -> pagina de edicao do meu proprio perfil.
export const perfil = async (req, res) => {
  try {
    const user = await User.findByPk(req.session.usuario.id);

    // Pega tambem os totais de seguidores/seguindo pra mostrar na pagina.
    const totalSeguidores = await Follow.count({
      where: { followingId: user.id }
    });
    const totalSeguindo = await Follow.count({
      where: { followerId: user.id }
    });

    res.render('perfil', { user, totalSeguidores, totalSeguindo });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Erro ao carregar perfil.');
    res.redirect('/');
  }
};

// POST /perfil -> salva alteracoes no perfil (nome e bio).
export const atualizarPerfil = async (req, res) => {
  const { nome, bio } = req.body;
  try {
    const user = await User.findByPk(req.session.usuario.id);
    user.nome = nome || user.nome;
    user.bio = bio;
    await user.save();

    req.session.usuario.nome = user.nome;

    req.flash('success', 'Perfil atualizado.');
    res.redirect('/perfil');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Erro ao atualizar perfil.');
    res.redirect('/perfil');
  }
};

// POST /perfil/avatar -> recebe o upload da foto de perfil.
// O middleware do multer ja salvou o arquivo no disco antes dessa funcao rodar.
// Os dados do arquivo ficam disponiveis em req.file.
export const uploadAvatar = async (req, res) => {
  try {
    // Se o multer rejeitou (nao e imagem, ou maior que 2MB), req.file vem vazio.
    if (!req.file) {
      req.flash('error', 'Envie uma imagem valida (max 2MB).');
      return res.redirect('/perfil');
    }

    const user = await User.findByPk(req.session.usuario.id);

    // Se ja tinha avatar antigo, apaga o arquivo do disco pra nao acumular lixo.
    if (user.avatarUrl) {
      const caminhoAntigo = path.join(__dirname, '..', 'public', user.avatarUrl);
      // existsSync verifica se o arquivo existe; unlinkSync apaga.
      // Usamos try/catch interno pra nao quebrar se o arquivo nao existir mais.
      try {
        if (fs.existsSync(caminhoAntigo)) fs.unlinkSync(caminhoAntigo);
      } catch (e) {
        console.error('Nao foi possivel apagar avatar antigo:', e.message);
      }
    }

    // O multer salvou em src/public/uploads/avatars/{filename}.
    // No model salvamos so o caminho relativo a /public, que e como
    // o navegador vai acessar (graças ao express.static no index.js).
    const caminhoRelativo = `/uploads/avatars/${req.file.filename}`;
    user.avatarUrl = caminhoRelativo;
    await user.save();

    // Atualiza tambem a sessao, senao a navbar continuaria mostrando o avatar antigo.
    req.session.usuario.avatarUrl = caminhoRelativo;

    req.flash('success', 'Foto atualizada.');
    res.redirect('/perfil');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Erro ao salvar a foto.');
    res.redirect('/perfil');
  }
};

// POST /perfil/avatar/remover -> remove a foto de perfil atual.
export const removerAvatar = async (req, res) => {
  try {
    const user = await User.findByPk(req.session.usuario.id);

    if (user.avatarUrl) {
      const caminho = path.join(__dirname, '..', 'public', user.avatarUrl);
      try {
        if (fs.existsSync(caminho)) fs.unlinkSync(caminho);
      } catch (e) {
        console.error('Nao foi possivel apagar avatar:', e.message);
      }
    }

    user.avatarUrl = null;
    await user.save();
    req.session.usuario.avatarUrl = null;

    req.flash('success', 'Foto removida.');
    res.redirect('/perfil');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Erro ao remover a foto.');
    res.redirect('/perfil');
  }
};
