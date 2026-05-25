// Rota da busca (proxy do OMDb). Prefixo /api/buscar.

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/controllerBusca');
const { autenticado } = require('../middlewares/auth');

// Exige login pra usar a busca (evita que bot scanee usando nossa chave).
router.use(autenticado);

// GET /api/buscar?q=matrix
router.get('/', ctrl.buscar);

module.exports = router;
