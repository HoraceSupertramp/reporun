import { Router } from 'express';
import repositories from './repositories';

const router = Router();

router.use('/repositories', repositories);

export default router;