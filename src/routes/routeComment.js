// Rotas dos comentarios. Prefixo /comentarios.

import express from 'express';
import * as ctrl from '../controllers/controllerComment.js';
import { autenticado } from '../middlewares/auth.js';

const router = express.Router();

// POST /comentarios/post/:postId -> novo comentario raiz numa postagem.
router.post('/post/:postId', autenticado, ctrl.criar);

// POST /comentarios/:id/responder -> responde a um comentario existente.
router.post('/:id/responder', autenticado, ctrl.responder);

// POST /comentarios/:id/excluir -> apaga um comentario.
router.post('/:id/excluir', autenticado, ctrl.deletar);

export default router;
