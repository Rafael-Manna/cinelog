// Rotas de usuarios (perfis publicos, seguir, deixar de seguir).
// Prefixo /usuarios (definido no index.js).

import express from 'express';
import * as ctrl from '../controllers/controllerUser.js';
import { autenticado } from '../middlewares/auth.js';

const router = express.Router();

// Todas as rotas aqui exigem login.
router.use(autenticado);

// GET /usuarios/:id -> perfil publico de um usuario qualquer.
router.get('/:id', ctrl.perfilPublico);

// POST /usuarios/:id/seguir -> comecar a seguir.
router.post('/:id/seguir', ctrl.seguir);

// POST /usuarios/:id/parar-de-seguir -> deixar de seguir.
router.post('/:id/parar-de-seguir', ctrl.pararDeSeguir);

export default router;
