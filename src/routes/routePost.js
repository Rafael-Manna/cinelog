import express from 'express';
import * as ctrl from '../controllers/controllerPost.js';
import { autenticado } from '../middlewares/auth.js';

const router = express.Router();

router.use(autenticado);

router.get('/novo', ctrl.formNovo);
router.post('/novo', ctrl.criar);

router.get('/:id', ctrl.detalhe);
router.get('/:id/editar', ctrl.formEditar);
router.post('/:id/editar', ctrl.atualizar);
router.post('/:id/excluir', ctrl.deletar);

export default router;
