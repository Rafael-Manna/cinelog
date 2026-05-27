// Rota da busca (proxy do OMDb). Prefixo /api/buscar.

import express from 'express';
import * as ctrl from '../controllers/controllerBusca.js';
import { autenticado } from '../middlewares/auth.js';

const router = express.Router();

// Exige login pra usar a busca (evita que bot scanee usando nossa chave).
router.use(autenticado);

// GET /api/buscar?q=matrix
router.get('/', ctrl.buscar);

export default router;
