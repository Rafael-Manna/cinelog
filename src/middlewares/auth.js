import { User } from '../models/associacoes.js';

export async function autenticado(req, res, next) {
  if (!req.session.usuario) {
    req.flash('error', 'Faca login para continuar.');
    return res.redirect('/login');
  }

  try {
    // A sessao pode apontar para um usuario que nao existe mais (conta excluida ou
    // banco recriado). Sem checar aqui, qualquer insert com esse id quebra a FK.
    const existe = await User.findByPk(req.session.usuario.id, { attributes: ['id'] });
    if (!existe) {
      return req.session.destroy(() => res.redirect('/login'));
    }
    next();
  } catch (err) {
    next(err);
  }
}
