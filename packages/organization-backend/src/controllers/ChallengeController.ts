import { Request, Response } from 'express';
import { Client } from '../models/Client';
import { Campaign } from '../models/Campaign';
import { CampaignUser } from '../models/CampaignUser';

export enum ValidationReason {
    CLIENT_NOT_FOUND = 'client_not_found',
    CAMPAIGN_NOT_FOUND = 'campaign_not_found',
    CAMPAIGN_INACTIVE = 'campaign_inactive',
    CLAIM_LIMIT_REACHED = 'claim_limit_reached',
}

interface ValidationResponse {
    challenge: string;
    user: string;
    valid: boolean;
    reason?: ValidationReason;
}

export const validateChallenge = async (req: Request, res: Response) => {
    const { idChallenge, userAddress } = req.params;

    const client = await Client.findOne({
        where: { wallet_address: userAddress },
    });
    if (!client) {
        return res.status(200).json({
            challenge: idChallenge,
            user: userAddress,
            valid: false,
            reason: ValidationReason.CLIENT_NOT_FOUND,
        } as ValidationResponse);
    }

    const campaign = await Campaign.findByPk(Number(idChallenge));
    if (!campaign) {
        return res.status(200).json({
            challenge: idChallenge,
            user: userAddress,
            valid: false,
            reason: ValidationReason.CAMPAIGN_NOT_FOUND,
        } as ValidationResponse);
    }

    const now = new Date();
    if (now < campaign.start_date || now > campaign.end_date) {
        return res.status(200).json({
            challenge: idChallenge,
            user: userAddress,
            valid: false,
            reason: ValidationReason.CAMPAIGN_INACTIVE,
        } as ValidationResponse);
    }

    if (
        campaign.claims_limit !== null &&
        campaign.claims_limit !== undefined
    ) {
        const used = await CampaignUser.count({
            where: {
                id_campaign: campaign.id_campaign,
                wallet_address: userAddress,
            },
        });
        if (used >= campaign.claims_limit) {
            return res.status(200).json({
                challenge: idChallenge,
                user: userAddress,
                valid: false,
                reason: ValidationReason.CLAIM_LIMIT_REACHED,
            } as ValidationResponse);
        }
    }

    await CampaignUser.create({
        id_campaign: campaign.id_campaign,
        wallet_address: userAddress,
    });

    return res.status(200).json({
        challenge: idChallenge,
        user: userAddress,
        valid: true,
    } as ValidationResponse);
};
