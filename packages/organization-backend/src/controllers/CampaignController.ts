import { Request, Response } from 'express';
import { Campaign } from '../models/Campaign';

export const createCampaign = async (req: Request, res: Response) => {
    try {
        const { campaign_name, start_date, end_date } = req.body;
        const newCampaign = await Campaign.create({
            campaign_name,
            start_date,
            end_date,
        });
        return res.status(201).json(newCampaign);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error creating Campaign' });
    }
};

export const getAllCampaigns = async (_req: Request, res: Response) => {
    try {
        const campaigns = await Campaign.findAll();
        return res.status(200).json(campaigns);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error getting All Campaigns' });
    }
};

export const getCampaignById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const campaign = await Campaign.findByPk(id);
        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found'})
        }
        return res.status(200).json(campaign);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error getting Campaign by id' });
    }
};

export const updateCampaign = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { campaign_name, start_date, end_date } = req.body;
        const [updated] = await Campaign.update(
            { campaign_name, start_date, end_date },
            { where: { id_campaign: id } }
        );
        if (!updated) {
            return res.status(404).json({ error: 'Campaign not found' });
        }
        const updatedCampaign = await Campaign.findByPk(id);
        return res.status(200).json(updatedCampaign);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error updating Campaign'})
    }
};

export const deleteCampaign = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deleted = await Campaign.destroy({ where: { id_campaign: id } });
        if (!deleted) {
            return res.status(404).json({ error: 'Campaign not found'})
        }
        return res.status(204).send();
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error deleteing Campaign'})
    }
};
