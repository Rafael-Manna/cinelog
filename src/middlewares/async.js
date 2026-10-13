// O Express 4 nao captura erros de handler async: uma promise rejeitada vira
// unhandled rejection e derruba o processo. Envolvendo o handler aqui, o erro
// vai para o middleware de erro do index.js.
export const wrap = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);
