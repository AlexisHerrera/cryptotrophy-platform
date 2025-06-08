import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface CampaignAttributes {
    id_campaign: number;
    campaign_name: string;
    start_date: Date;
    end_date: Date;
    claims_limit: number | null;
}
export type CampaignCreation = Optional<CampaignAttributes, 'claims_limit'>;

export class Campaign
    extends Model<CampaignAttributes, CampaignCreation>
    implements CampaignAttributes
{
    public id_campaign!: number;
    public campaign_name!: string;
    public start_date!: Date;
    public end_date!: Date;
    public claims_limit!: number | null;
}

Campaign.init(
    {
        id_campaign: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            allowNull: false,
        },
        campaign_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        start_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        end_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        claims_limit: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
            defaultValue: null,
        },
    },
    {
        tableName: 'campaigns',
        sequelize,
        timestamps: false,
    }
);
