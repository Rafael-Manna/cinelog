import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { User } from '../models/associacoes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const formLogin = (req, res) => res.render('login');

export const formRegistro = (req, res) => res.render('registro');

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
    await User.create({ nome, email, senha: hash });
    req.flash('success', 'Conta criada! Faca login.');
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Erro ao criar conta.');
    res.redirect('/registro');
  }
};

export const login = async (req, res) => {
  const { email, senha } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(senha, user.senha))) {
      req.flash('error', 'Email ou senha invalidos.');
      return res.redirect('/login');
    }
    req.session.usuario = {
      id: user.id,
      nome: user.nome,
      email: user.email,
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

export const logout = (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
};

export const perfil = async (req, res) => {
  const user = await User.findByPk(req.session.usuario.id);
  res.render('perfil', { user });
};

export const atualizarPerfil = async (req, res) => {
  const { nome, bio } = req.body;
  const user = await User.findByPk(req.session.usuario.id);
  user.nome = nome || user.nome;
  user.bio = bio;
  await user.save();
  req.session.usuario.nome = user.nome;
  req.flash('success', 'Perfil atualizado.');
  res.redirect('/perfil');
};

export const uploadAvatar = async (req, res) => {
  if (!req.file) {
    req.flash('error', 'Envie uma imagem valida (max 2MB).');
    return res.redirect('/perfil');
  }
  const user = await User.findByPk(req.session.usuario.id);

  if (user.avatarUrl) {
    const antigo = path.join(__dirname, '..', 'public', user.avatarUrl);
    if (fs.existsSync(antigo)) fs.unlinkSync(antigo);
  }

  const caminho = `/uploads/avatars/${req.file.filename}`;
  user.avatarUrl = caminho;
  await user.save();
  req.session.usuario.avatarUrl = caminho;
  req.flash('success', 'Foto atualizada.');
  res.redirect('/perfil');
};
