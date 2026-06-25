import express from 'express';
import * as ctrl from '../controllers/controllerComment.js';
import { autenticado } from '../middlewares/auth.js';

const router = express.Router();

router.use(autenticado);

router.post('/post/:postId', ctrl.criar);
router.post('/:id/excluir', ctrl.deletar);

export default router;
