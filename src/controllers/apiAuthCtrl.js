// Controlador de autenticação e perfil para a API consumida pelo aplicativo móvel.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/associacoes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function gerarToken(usuario) {
  const segredo = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'chave-secreta-cinelog';
  return jwt.sign(
    { id: usuario.id, email: usuario.email },
    segredo,
    { expiresIn: '30d' }
  );
}

export const registro = async (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha) {
    return res.status(400).json({ mensagem: 'Preencha nome, e-mail e senha.' });
  }

  try {
    const existente = await User.findOne({ where: { email: email.trim().toLowerCase() } });
    if (existente) {
      return res.status(400).json({ mensagem: 'E-mail já cadastrado.' });
    }

    const hash = await bcrypt.hash(senha, 10);
    const usuario = await User.create({
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      senha: hash
    });

    const token = gerarToken(usuario);
    return res.status(201).json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        bio: usuario.bio,
        avatarUrl: usuario.avatarUrl
      }
    });
  } catch (err) {
    console.error('Erro no cadastro mobile:', err);
    return res.status(500).json({ mensagem: 'Erro interno ao criar conta.' });
  }
};

export const login = async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ mensagem: 'Informe seu e-mail e sua senha.' });
  }

  try {
    const usuario = await User.findOne({ where: { email: email.trim().toLowerCase() } });
    if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
      return res.status(401).json({ mensagem: 'E-mail ou senha incorretos.' });
    }

    const token = gerarToken(usuario);
    return res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        bio: usuario.bio,
        avatarUrl: usuario.avatarUrl
      }
    });
  } catch (err) {
    console.error('Erro no login mobile:', err);
    return res.status(500).json({ mensagem: 'Erro interno ao realizar login.' });
  }
};

export const perfil = async (req, res) => {
  try {
    const usuario = await User.findByPk(req.usuario.id, {
      attributes: ['id', 'nome', 'email', 'bio', 'avatarUrl', 'createdAt']
    });
    if (!usuario) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    }
    return res.json({ dados: usuario });
  } catch (err) {
    console.error('Erro ao buscar perfil mobile:', err);
    return res.status(500).json({ mensagem: 'Erro ao consultar perfil.' });
  }
};

export const atualizarPerfil = async (req, res) => {
  try {
    const { nome, bio } = req.body;
    const usuario = await User.findByPk(req.usuario.id);
    if (!usuario) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    }

    if (nome && nome.trim()) usuario.nome = nome.trim();
    if (bio !== undefined) usuario.bio = bio ? bio.trim() : null;

    await usuario.save();

    return res.json({
      mensagem: 'Perfil atualizado com sucesso.',
      dados: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        bio: usuario.bio,
        avatarUrl: usuario.avatarUrl
      }
    });
  } catch (err) {
    console.error('Erro ao atualizar perfil mobile:', err);
    return res.status(500).json({ mensagem: 'Erro ao atualizar perfil.' });
  }
};

export const uploadAvatar = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ mensagem: 'Envie uma imagem válida (máximo 2MB).' });
  }

  try {
    const usuario = await User.findByPk(req.usuario.id);
    if (!usuario) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    }

    if (usuario.avatarUrl) {
      const antigo = path.join(__dirname, '..', 'public', usuario.avatarUrl);
      if (fs.existsSync(antigo)) {
        try {
          fs.unlinkSync(antigo);
        } catch (e) {
          console.warn('Não foi possível apagar avatar antigo:', e.message);
        }
      }
    }

    const caminho = `/uploads/avatars/${req.file.filename}`;
    usuario.avatarUrl = caminho;
    await usuario.save();

    return res.json({
      mensagem: 'Avatar atualizado.',
      dados: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        bio: usuario.bio,
        avatarUrl: usuario.avatarUrl
      }
    });
  } catch (err) {
    console.error('Erro no upload de avatar mobile:', err);
    return res.status(500).json({ mensagem: 'Erro ao salvar novo avatar.' });
  }
};
