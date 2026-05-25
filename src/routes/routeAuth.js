// Rotas relacionadas a autenticacao e ao "/" raiz.

const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/controllerAuth');
const postCtrl = require('../controllers/controllerPost');

const { autenticado } = require('../middlewares/auth');

// upload = middleware do multer. .single('avatar') significa que esperamos
// um unico arquivo vindo do campo do formulario chamado "avatar".
const upload = require('../middlewares/upload');

// GET / -> home (feed). Antes, exige login.
router.get('/', autenticado, postCtrl.listar);

// Login: GET mostra o formulario, POST processa.
router.get('/login', ctrl.formLogin);
router.post('/login', ctrl.login);

// Registro de novo usuario.
router.get('/registro', ctrl.formRegistro);
router.post('/registro', ctrl.registrar);

// Logout. Aceita POST (botao) e GET (caso queira link).
router.post('/logout', autenticado, ctrl.logout);
router.get('/logout', autenticado, ctrl.logout);

// Perfil do usuario logado.
router.get('/perfil', autenticado, ctrl.perfil);
router.post('/perfil', autenticado, ctrl.atualizarPerfil);

// Upload da foto de perfil. O middleware upload.single('avatar') roda ANTES
// do controller e poe o arquivo em req.file.
router.post('/perfil/avatar', autenticado, upload.single('avatar'), ctrl.uploadAvatar);

// Remover a foto atual.
router.post('/perfil/avatar/remover', autenticado, ctrl.removerAvatar);

module.exports = router;
