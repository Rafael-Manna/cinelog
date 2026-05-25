// Rotas de usuarios (perfis publicos, seguir, deixar de seguir).
// Prefixo /usuarios (definido no index.js).

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/controllerUser');
const { autenticado } = require('../middlewares/auth');

// Todas as rotas aqui exigem login.
router.use(autenticado);

// GET /usuarios/:id -> perfil publico de um usuario qualquer.
router.get('/:id', ctrl.perfilPublico);

// POST /usuarios/:id/seguir -> comecar a seguir.
router.post('/:id/seguir', ctrl.seguir);

// POST /usuarios/:id/parar-de-seguir -> deixar de seguir.
router.post('/:id/parar-de-seguir', ctrl.pararDeSeguir);

module.exports = router;
