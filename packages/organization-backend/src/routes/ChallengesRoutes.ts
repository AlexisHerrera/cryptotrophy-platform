import { Router, Request, Response } from 'express';
const router = Router();

/**
 * GET validation usando params en la URL
 * Ejemplo: GET /api/challenges/42/validate/0xAbC123...
 */
router.get(
    '/:idChallenge/validate/:userAddress',
    async (req: Request, res: Response) => {
        const { idChallenge, userAddress } = req.params;
        res.status(200).json({
            challenge: idChallenge,
            user: userAddress,
            valid: true,
        });
    }
);

/**
 * POST validation enviando el userAddress en el body
 * Ejemplo: POST /api/challenges/42/validate
 * Body: { "user_address": "0xAbC123..." }
 */
router.post(
    '/:idChallenge/validate',
    async (req: Request, res: Response) => {
        const { idChallenge } = req.params;
        const { user_address } = req.body;
        if (!user_address) {
            return res.status(400).json({ error: 'Missing user address' });
        }
        res.status(200).json({
            challenge: idChallenge,
            user: user_address,
            valid: true,
        });
    }
);

export default router;
