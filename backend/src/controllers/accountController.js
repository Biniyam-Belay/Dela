import prisma from "../prisma/prisma.js";

export const createAccount = async (req, res) => {
    try {
        const { name, type, balance } = req.body;

        if (!name || !type || balance === undefined) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        if (typeof balance !== 'number' || isNaN(balance)) {
            return res.status(400).json({ message: 'Balance must be a number' });
        }
        if (type !== 'SAVINGS' && type !== 'CHECKING' && type !== 'CREDIT' && type !== 'CASH') {
            return res.status(400).json({ message: 'Invalid account type' });
        }

        const account = await prisma.account.create({
            data: {
                name,
                type,
                balance,
                userId: req.user.id
            }
        });
        res.status(201).json(account);
    } catch (err) {
        if (process.env.NODE_ENV === 'development') {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'Something went wrong' });
        }
    }
};

export const updateAccount = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { name, type, balance } = req.body;

        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid account id' });
        }
        if (!name || !type || balance === undefined) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        if (typeof balance !== 'number' || isNaN(balance)) {
            return res.status(400).json({ message: 'Balance must be a number' });
        }
        if (type !== 'SAVINGS' && type !== 'CHECKING' && type !== 'CREDIT' && type !== 'CASH') {
            return res.status(400).json({ message: 'Invalid account type' });
        }

        const account = await prisma.account.findFirst({
            where: { id, userId: req.user.id }
        });
        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        const updatedAccount = await prisma.account.update({
            where: { id },
            data: { name, type, balance },
        });

        res.json(updatedAccount);
    } catch (err) {
        if (process.env.NODE_ENV === 'development') {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'Something went wrong' });
        }
    }
};

export const getAccounts = async (req, res) => {
    try {
        const accounts = await prisma.account.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' }
        });

        res.json(accounts);
    } catch (err) {
        if (process.env.NODE_ENV === 'development') {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'Something went wrong' });
        }
    }
};

export const deleteAccount = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid account id' });
        }

        const account = await prisma.account.findFirst({
            where: { id, userId: req.user.id }
        });
        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        await prisma.$transaction([
            prisma.transaction.deleteMany({
                where: { accountId: id }
            }),
            prisma.account.delete({
                where: { id }
            })
        ]);

        res.status(204).send();
    } catch (err) {
        if (process.env.NODE_ENV === 'development') {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'Something went wrong' });
        }
    }
};