// Centralizo as rotas REST consumidas pelo aplicativo móvel CineLog.
import express from 'express';
import { autenticadoApi } from '../middlewares/authJwt.js';
import upload from '../middlewares/upload.js';
import * as apiAuth from '../controllers/apiAuthCtrl.js';
import * as apiPost from '../controllers/apiPostCtrl.js';
import * as apiComment from '../controllers/apiCommentCtrl.js';
import * as apiLista from '../controllers/apiListaCtrl.js';
import * as apiBusca from '../controllers/controllerBusca.js';

const router = express.Router();

// ===== AUTENTICAÇÃO E PERFIL =====
router.post('/auth/registro', apiAuth.registro);
router.post('/auth/login', apiAuth.login);
router.get('/auth/perfil', autenticadoApi, apiAuth.perfil);
router.put('/auth/perfil', autenticadoApi, apiAuth.atualizarPerfil);
router.post('/auth/avatar', autenticadoApi, upload.single('avatar'), apiAuth.uploadAvatar);

// ===== BUSCA EXTERNA (OMDb) =====
router.get('/buscar', apiBusca.buscar);

// ===== POSTAGENS E AVALIAÇÕES =====
router.get('/posts', apiPost.listar);
router.post('/posts', autenticadoApi, apiPost.criar);
router.get('/posts/:id', apiPost.detalhe);
router.put('/posts/:id', autenticadoApi, apiPost.atualizar);
router.delete('/posts/:id', autenticadoApi, apiPost.deletar);

// ===== COMENTÁRIOS =====
router.post('/comentarios/:postId', autenticadoApi, apiComment.criar);
router.delete('/comentarios/:id', autenticadoApi, apiComment.deletar);

// ===== LISTAS COLABORATIVAS =====
router.get('/listas', autenticadoApi, apiLista.listar);
router.post('/listas', autenticadoApi, apiLista.criar);
router.get('/listas/:id', autenticadoApi, apiLista.detalhe);
router.delete('/listas/:id', autenticadoApi, apiLista.excluir);
router.post('/listas/:id/sair', autenticadoApi, apiLista.sair);
router.post('/listas/:id/membros', autenticadoApi, apiLista.adicionarMembro);
router.delete('/listas/:id/membros/:userId', autenticadoApi, apiLista.removerMembro);

// Itens da lista e votação
router.post('/listas/:id/itens', autenticadoApi, apiLista.adicionarItem);
router.post('/listas/itens/:itemId/voto', autenticadoApi, apiLista.votar);
router.post('/listas/itens/:itemId/assistido', autenticadoApi, apiLista.marcarAssistido);
router.post('/listas/itens/:itemId/avaliar', autenticadoApi, apiLista.avaliarJunto);
router.delete('/listas/itens/:itemId', autenticadoApi, apiLista.removerItem);

export default router;
