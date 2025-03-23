import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prisma/prisma.js';

const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            }
        });

        await prisma.account.create({
            data: {
                name: 'Cash',
                type: 'SAVINGS',
                balance: 0.0,
                userId: user.id
            }
        });

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: '30d',
        });

        const sanitizedUser = {
            id: user.id,
            name: user.name,
            email: user.email
        };

        return res.status(201).json({
            message: "User created successfully",
            user: sanitizedUser,
            token
        });
    } catch (err) {
        if (process.env.NODE_ENV === 'development') {
            return res.status(500).json({ message: err.message });
        } else {
            return res.status(500).json({ message: 'Something went wrong' });
        }
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: '30d',
        });

        const sanitizedUser = {
            id: user.id,
            name: user.name,
            email: user.email
        };

        return res.status(200).json({
            user: sanitizedUser,
            token
        });
    } catch (err) {
        if (process.env.NODE_ENV === 'development') {
            return res.status(500).json({ message: err.message });
        } else {
            return res.status(500).json({ message: 'Something went wrong' });
        }
    }
};


const getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
            }
        });
        res.json(users);
    } catch (err) {
        if (process.env.NODE_ENV === 'development') {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'Something went wrong' });
        }
    }
};

const deleteUser = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        await prisma.account.deleteMany({
            where: { userId: id }
        });

        await prisma.user.delete({
            where: { id }
        });

        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        if (process.env.NODE_ENV === 'development') {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'Something went wrong' });
        }
    }
}

export { register, login, getUsers, deleteUser };