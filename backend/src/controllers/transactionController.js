import prisma from "../prisma/prisma.js";

export const getTransactions = async (req, res) => {
    try {
        const accountId = Number(req.params.accountId);
        if (isNaN(accountId)) {
            return res.status(400).json({ message: 'Invalid account ID' });
        }

        const transactions = await prisma.transaction.findMany({
            where: { accountId, account: { userId: req.user.id } },
            orderBy: { date: 'desc' }
        });
        res.json(transactions);
    } catch (err) {
        if (process.env.NODE_ENV === 'development') {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'Something went wrong' });
        }
    }
};

export const createTransaction = async (req, res) => {
    try {
        const { type, amount, description, date, categoryId, accountId } = req.body;

        if (!type || amount === undefined || !description || !date || !categoryId || !accountId) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        if (typeof amount !== 'number' || isNaN(amount)) {
            return res.status(400).json({ message: 'Amount must be a number' });
        }
        if (!['INCOME', 'EXPENSE'].includes(type)) {
            return res.status(400).json({ message: 'Invalid transaction type' });
        }
        const parsedAccountId = Number(accountId);
        const parsedCategoryId = Number(categoryId);
        if (isNaN(parsedAccountId) || isNaN(parsedCategoryId)) {
            return res.status(400).json({ message: 'Invalid account or category ID' });
        }

        const account = await prisma.account.findFirst({
            where: { id: parsedAccountId, userId: req.user.id }
        });
        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        const transaction = await prisma.$transaction(async (tx) => {
            const newTransaction = await tx.transaction.create({
                data: {
                    type,
                    amount,
                    description,
                    date: new Date(date),
                    category: { connect: { id: parsedCategoryId } },
                    account: { connect: { id: parsedAccountId } }
                }
            });
            await tx.account.update({
                where: { id: parsedAccountId },
                data: { balance: type === 'INCOME' ? account.balance + amount : account.balance - amount }
            });
            return newTransaction;
        });

        res.status(201).json(transaction);
    } catch (err) {
        if (process.env.NODE_ENV === 'development') {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'Something went wrong' });
        }
    }
};

export const updateTransaction = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { type, amount, description, date, categoryId, accountId } = req.body;

        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid transaction ID' });
        }
        if (!type || amount === undefined || !description || !date || !categoryId || !accountId) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        if (typeof amount !== 'number' || isNaN(amount)) {
            return res.status(400).json({ message: 'Amount must be a number' });
        }
        if (!['INCOME', 'EXPENSE'].includes(type)) {
            return res.status(400).json({ message: 'Invalid transaction type' });
        }
        const parsedAccountId = Number(accountId);
        const parsedCategoryId = Number(categoryId);
        if (isNaN(parsedAccountId) || isNaN(parsedCategoryId)) {
            return res.status(400).json({ message: 'Invalid account or category ID' });
        }

        const account = await prisma.account.findFirst({
            where: { id: parsedAccountId, userId: req.user.id }
        });
        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        const transaction = await prisma.transaction.findFirst({
            where: { id, account: { userId: req.user.id } }
        });
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        const updatedTransaction = await prisma.$transaction(async (tx) => {
            const oldAmount = transaction.amount;
            const oldType = transaction.type;
            const newTransaction = await tx.transaction.update({
                where: { id },
                data: {
                    type,
                    amount,
                    description,
                    date: new Date(date),
                    category: { connect: { id: parsedCategoryId } }
                }
            });
            const balanceDelta = (oldType === 'INCOME' ? -oldAmount : oldAmount) +
                (type === 'INCOME' ? amount : -amount);
            await tx.account.update({
                where: { id: parsedAccountId },
                data: { balance: account.balance + balanceDelta }
            });
            return newTransaction;
        });

        res.status(200).json(updatedTransaction);
    } catch (err) {
        if (process.env.NODE_ENV === 'development') {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'Something went wrong' });
        }
    }
};

export const deleteTransaction = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid transaction ID' });
        }

        const transaction = await prisma.transaction.findFirst({
            where: { id, account: { userId: req.user.id } }
        });
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        await prisma.$transaction([
            prisma.transaction.delete({
                where: { id }
            }),
            prisma.account.update({
                where: { id: transaction.accountId },
                data: {
                    balance: transaction.type === 'INCOME'
                        ? transaction.account.balance - transaction.amount
                        : transaction.account.balance + transaction.amount
                }
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