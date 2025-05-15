import { Request, Response } from 'express';
import { Client } from '../models/Client';

export const createClient = async (req: Request, res: Response) => {
    try {
        const { wallet_address, name } = req.body;
        const newClient = await Client.create({ wallet_address, name });
        return res.status(201).json(newClient);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error creating Client'})
    }
};

export const getAllClients = async (_req: Request, res: Response) => {
    try {
        const clients = await Client.findAll();
        return res.status(200).json(clients);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error getting All Clients' });
    }
};

export const getClientById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const client = await Client.findByPk(id);
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }
        return res.status(200).json(client);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error getting Client' });
    }
};

export const updateClient = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { wallet_address, name } = req.body;
        const [updated] = await Client.update(
            { wallet_address, name },
            { where: { id_client: id } }
        );
        if (!updated) {
            return res.status(404).json({ error: 'Client not found'})
        }
        const updatedClient = await Client.findByPk(id);
        return res.status(200).json(updatedClient);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error updating Client' });
    }
};

export const deleteClient = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deleted = await Client.destroy({ where: { id_client: id } });
        if (!deleted) {
            return res.status(404).json({ error: 'Client not found'})
        }
        return res.status(204).send();
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error deleting Client' });
    }
};
