import express from 'express';
import * as ctrl from '../controllers/controllerBusca.js';
import { autenticado } from '../middlewares/auth.js';

const router = express.Router();

router.use(autenticado);

router.get('/', ctrl.buscar);

export default router;
