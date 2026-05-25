// Middlewares de autenticacao.
// Middleware = funcao que roda ANTES da rota principal. Pode deixar passar
// (chamando next()) ou bloquear (retornando uma resposta ou redirect).

// Verifica se tem algum usuario logado. Se nao tiver, joga pro /login.
function autenticado(req, res, next) {
  if (!req.session.usuario) {
    // flash() guarda uma mensagem que vai aparecer UMA vez na proxima pagina.
    req.flash('error', 'Faca login para continuar.');
    return res.redirect('/login');
  }
  // next() = liberado, pode continuar pra rota.
  next();
}

// Igual ao de cima, mas tambem exige que o usuario seja admin.
function somenteAdmin(req, res, next) {
  if (!req.session.usuario) {
    req.flash('error', 'Faca login para continuar.');
    return res.redirect('/login');
  }
  if (req.session.usuario.role !== 'admin') {
    req.flash('error', 'Acesso restrito a administradores.');
    return res.redirect('/');
  }
  next();
}

// Exporta os dois pra serem usados nas rotas.
module.exports = { autenticado, somenteAdmin };
