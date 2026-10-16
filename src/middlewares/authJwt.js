// Confiro a credencial enviada pelo aplicativo no cabeçalho Authorization.
import jwt from 'jsonwebtoken';
import { User } from '../models/associacoes.js';

// Verifico o token Bearer em requisições feitas pela API do aplicativo móvel.
export async function autenticadoApi(req, res, next) {
  const autorizacao = req.headers.authorization;
  if (!autorizacao || !autorizacao.startsWith('Bearer ')) {
    return res.status(401).json({ mensagem: 'Sessão não informada ou formato inválido.' });
  }

  const token = autorizacao.split(' ')[1];
  const segredo = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'chave-secreta-cinelog';

  try {
    const decodificado = jwt.verify(token, segredo);
    const usuario = await User.findByPk(decodificado.id);
    if (!usuario) {
      return res.status(401).json({ mensagem: 'Usuário não encontrado.' });
    }

    req.usuario = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      avatarUrl: usuario.avatarUrl,
      bio: usuario.bio
    };
    next();
  } catch (erro) {
    return res.status(401).json({ mensagem: 'Sessão expirada ou inválida.' });
  }
}
