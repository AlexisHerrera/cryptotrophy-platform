import { Request, Response } from 'express';
import User from '../models/User';

export class UserController {

    async getAllUsers(req: Request, res: Response): Promise<Response> {
        try {
            const users = await User.findAll();
            return res.status(200).json(users);
        } catch (error: any) {
            console.error("Error fetching users:", error);
            return res.status(500).json({ error: 'Internal Server Error', message: error.message });
        }
    }

    async getUserById(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        try {
            const user = await User.findByPk(id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            return res.status(200).json(user);
        } catch (error: any) {
            console.error(`Error fetching user with id ${id}:`, error);
            return res.status(500).json({ error: 'Internal Server Error', message: error.message });
        }
    }

    async createUser(req: Request, res: Response): Promise<Response> {
        const { name, email } = req.body;
        if (!name || !email) {
            return res.status(400).json({ error: 'Missing required fields: name and email' });
        }
        try {
            const newUser = await User.create({ name, email });
            return res.status(201).json(newUser);
        } catch (error: any) {
            console.error("Error creating user:", error);
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(409).json({ error: 'Email already exists', message: error.message });
            }
            return res.status(500).json({ error: 'Internal Server Error', message: error.message });
        }
    }

    async updateUser(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        const { name, email } = req.body;
        try {
            const user = await User.findByPk(id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            if (name !== undefined) user.name = name;
            if (email !== undefined) user.email = email;

            await user.save();

            return res.status(200).json(user);
        } catch (error: any) {
            console.error(`Error updating user with id ${id}:`, error);
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(409).json({ error: 'Email already exists for another user', message: error.message });
            }
            return res.status(500).json({ error: 'Internal Server Error', message: error.message });
        }
    }

    async deleteUser(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        try {
            const user = await User.findByPk(id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            await user.destroy();
            return res.status(204).send();
        } catch (error: any) {
            console.error(`Error deleting user with id ${id}:`, error);
            return res.status(500).json({ error: 'Internal Server Error', message: error.message });
        }
    }
}

export default new UserController();