import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface ClientAttributes {
    id_client: number;
    wallet_address: string;
    name: string;
}
export type ClientCreation = Optional<ClientAttributes, 'id_client'>;

export class Client
    extends Model<ClientAttributes, ClientCreation>
    implements ClientAttributes
{
    public id_client!: number;
    public wallet_address!: string;
    public name!: string;
}

Client.init(
    {
        id_client: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        wallet_address: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        tableName: 'clients',
        sequelize,
        timestamps: false,
    },
);
