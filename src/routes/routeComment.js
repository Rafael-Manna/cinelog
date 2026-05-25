// Rotas dos comentarios. Prefixo /comentarios.

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/controllerComment');
const { autenticado } = require('../middlewares/auth');

// POST /comentarios/post/:postId -> novo comentario raiz numa postagem.
router.post('/post/:postId', autenticado, ctrl.criar);

// POST /comentarios/:id/responder -> responde a um comentario existente.
router.post('/:id/responder', autenticado, ctrl.responder);

// POST /comentarios/:id/excluir -> apaga um comentario.
router.post('/:id/excluir', autenticado, ctrl.deletar);

module.exports = router;
