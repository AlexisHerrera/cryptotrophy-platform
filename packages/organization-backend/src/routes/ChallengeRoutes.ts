import { Router } from 'express';
import { validateChallenge } from '../controllers/ChallengeController';

const router = Router();

/**
 * Validación (GET y POST comparten la misma lógica)
 */
router.get(
    '/validate/:idChallenge/:userAddress',
    validateChallenge
);
router.post(
    '/validate/:idChallenge/:userAddress',
    validateChallenge
);

export default router;
