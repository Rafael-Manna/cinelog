import express from 'express';
import * as ctrl from '../controllers/controllerAuth.js';
import * as postCtrl from '../controllers/controllerPost.js';
import { autenticado } from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

router.get('/', autenticado, postCtrl.listar);

router.get('/login', ctrl.formLogin);
router.post('/login', ctrl.login);

router.get('/registro', ctrl.formRegistro);
router.post('/registro', ctrl.registrar);

router.post('/logout', autenticado, ctrl.logout);

router.get('/perfil', autenticado, ctrl.perfil);
router.post('/perfil', autenticado, ctrl.atualizarPerfil);

router.post('/perfil/avatar', autenticado, upload.single('avatar'), ctrl.uploadAvatar);

export default router;
