import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { Campaign } from './Campaign';

export interface CampaignUserAttributes {
    id: number;
    id_campaign: number;
    wallet_address: string;
}
export type CampaignUserCreation = Optional<CampaignUserAttributes, 'id'>;

export class CampaignUser
    extends Model<CampaignUserAttributes, CampaignUserCreation>
    implements CampaignUserAttributes
{
    public id!: number;
    public id_campaign!: number;
    public wallet_address!: string;
}

CampaignUser.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        id_campaign: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: Campaign,
                key: 'id_campaign',
            },
        },
        wallet_address: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
    },
    {
        tableName: 'campaign_users',
        sequelize,
        timestamps: false,
    }
);

CampaignUser.belongsTo(Campaign, { foreignKey: 'id_campaign' });
Campaign.hasMany(CampaignUser, { foreignKey: 'id_campaign' });
