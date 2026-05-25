// Rotas das postagens. Todas comecam com /posts (prefixo definido no index.js
// quando fazemos app.use('/posts', routePost)).
// Ex: aqui escrevemos router.get('/novo') = URL final fica /posts/novo

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/controllerPost');
const { autenticado } = require('../middlewares/auth');

// /posts/novo -> formulario e envio de nova avaliacao.
// IMPORTANTE: rota "/novo" tem que vir ANTES da rota "/:id". Senao o Express
// pensaria que "novo" e um ID e mandaria pra detalhe.
router.get('/novo', autenticado, ctrl.formNovo);
router.post('/novo', autenticado, ctrl.criar);

// /posts/:id -> ":id" e parametro dinamico. Ex: /posts/5 -> req.params.id === '5'
router.get('/:id', autenticado, ctrl.detalhe);

// /posts/:id/editar -> formulario e envio de edicao.
router.get('/:id/editar', autenticado, ctrl.formEditar);
router.post('/:id/editar', autenticado, ctrl.atualizar);

// /posts/:id/excluir -> apaga. Usamos POST (nao DELETE) porque formularios HTML
// so suportam GET e POST de forma nativa.
router.post('/:id/excluir', autenticado, ctrl.deletar);

module.exports = router;
