export function autenticado(req, res, next) {
  if (!req.session.usuario) {
    req.flash('error', 'Faca login para continuar.');
    return res.redirect('/login');
  }
  next();
}
