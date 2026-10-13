import express from 'express';
import * as ctrl from '../controllers/controllerLista.js';
import { autenticado } from '../middlewares/auth.js';
import { wrap } from '../middlewares/async.js';

const router = express.Router();

router.use(autenticado);

router.get('/', wrap(ctrl.listar));

router.get('/nova', ctrl.formNova);
router.post('/nova', wrap(ctrl.criar));

router.post('/itens/:itemId/votar', wrap(ctrl.votar));
router.post('/itens/:itemId/excluir', wrap(ctrl.removerItem));

router.get('/:id', wrap(ctrl.detalhe));
router.post('/:id/excluir', wrap(ctrl.excluir));
router.post('/:id/sair', wrap(ctrl.sair));
router.post('/:id/itens', wrap(ctrl.adicionarItem));
router.post('/:id/membros', wrap(ctrl.adicionarMembro));
router.post('/:id/membros/:userId/remover', wrap(ctrl.removerMembro));

export default router;
