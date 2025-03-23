import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { register, login, getUsers, deleteUser } from './src/controllers/userController.js';
import { authMiddleware } from './src/middleware/authMiddleware.js';
import { createAccount, deleteAccount, getAccounts, updateAccount } from './src/controllers/accountController.js';
import { createTransaction, deleteTransaction, getTransactions, updateTransaction } from './src/controllers/transactionController.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
    res.send('inance management API is running....');
})

app.get('/accounts', authMiddleware, getAccounts);
app.post('/accounts', authMiddleware, createAccount);
app.put('/accounts/:id', authMiddleware, updateAccount);
app.delete('/accounts/:id', authMiddleware, deleteAccount);

app.get('/transactions', authMiddleware, getTransactions);
app.post('/transactions', authMiddleware, createTransaction);
app.put('/transactions/:id', authMiddleware, updateTransaction);
app.delete('/transactions/:id', authMiddleware, deleteTransaction);

app.get('/users', getUsers);
app.post('/register', register);
app.post('/login', login);
app.delete('/users/:id', deleteUser);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})