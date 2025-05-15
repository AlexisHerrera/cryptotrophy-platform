import { Router } from 'express';
import {
    createCampaign,
    getAllCampaigns,
    getCampaignById,
    updateCampaign,
    deleteCampaign,
} from '../controllers/CampaignController';

const router = Router();

router.post('/', createCampaign);
router.get('/', getAllCampaigns);

router.get('/:id', getCampaignById);
router.put('/:id', updateCampaign);
router.delete('/:id', deleteCampaign);

export default router;
