// Rotas administrativas. Prefixo /admin (definido no index.js).

import express from 'express';
import * as ctrl from '../controllers/controllerAdmin.js';
import { somenteAdmin } from '../middlewares/auth.js';

const router = express.Router();

// router.use(...) sem caminho aplica o middleware a TODAS as rotas desse router.
// Aqui: nenhuma rota /admin/* roda sem passar pelo somenteAdmin.
// E mais limpo do que repetir o middleware em cada rota abaixo.
router.use(somenteAdmin);

// GET /admin -> painel principal.
router.get('/', ctrl.painel);

// GET /admin/usuarios -> lista de usuarios.
router.get('/usuarios', ctrl.listarUsuarios);

// POST /admin/usuarios/:id/role -> alterna entre user e admin.
router.post('/usuarios/:id/role', ctrl.alternarRole);

// POST /admin/usuarios/:id/excluir -> apaga um usuario.
router.post('/usuarios/:id/excluir', ctrl.deletarUsuario);

export default router;
