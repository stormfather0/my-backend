import express from 'express';
import cors from 'cors'; 
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import path from 'path'; 
import { fileURLToPath } from 'url'; 
import { dirname } from 'path'; 
import { MongoClient, ObjectId } from 'mongodb';

const app = express();
const PORT = 3000;

// MongoDB connection URI 
const uri = 'mongodb+srv://Madison:Madison123@cluster0.lbkfd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri);

let db; 
let ordersCache = []; 

async function connectToDatabase() {
    try {
        await client.connect();
        db = client.db('Cluster0'); 
        console.log('Connected to MongoDB');

        ordersCache = await db.collection('orders').find({}).toArray();
        console.log('Loaded orders from database:', ordersCache);
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
}

connectToDatabase();

app.use(cors({
    origin: 'http://127.0.0.1:5500',
    methods: ['POST', 'GET', 'OPTIONS'], 
    allowedHeaders: ['Content-Type'], 
}));

app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename); 
app.use(express.static(path.join(__dirname, 'public')));

// Content Security Policy header middleware
app.use((req, res, next) => {
    res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; img-src 'self' data:; script-src 'self' 'unsafe-inline';"
    );
    next();
});


const users = [
    {
        email: 'user@example.com',
        password: '$2b$10$qz2.ulbwOpPNxoxEPLN8RubrNItlwJ1Tl7Uz5IrW0WLC/TNYwZ.6y' 
    }
];

// Login route
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(user => user.email === email);
    if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ email: user.email }, 'your_jwt_secret_key', { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
});

// Place order route
app.post('/api/place-order', async (req, res) => {
    const { items, total, deliveryOptions } = req.body;

    console.log('Received order:', { items, total, deliveryOptions });

    const newOrder = {
        items,
        total,
        deliveryOptions,
        createdAt: new Date()
    };

    try {
        const ordersCollection = db.collection('orders');
        const result = await ordersCollection.insertOne(newOrder);

        ordersCache.push({ _id: result.insertedId, ...newOrder });

        res.status(201).json({
            message: 'Order placed successfully',
            order: { _id: result.insertedId, ...newOrder },
        });
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ message: 'Error placing order' });
    }
});

// Fetch orders route
app.get('/api/orders', async (req, res) => {
    try {
        const ordersCollection = db.collection('orders');
        const orders = await ordersCollection.find({}).toArray();

        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

// Delete order route
app.delete('/api/orders/:id', async (req, res) => {
    const orderId = req.params.id;

    try {
        const ordersCollection = db.collection('orders');
        const result = await ordersCollection.deleteOne({ _id: new ObjectId(orderId) });

        if (result.deletedCount === 1) {
            res.status(200).json({ message: 'Order deleted successfully' });
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ message: 'Error deleting order' });
    }
});

// Serve external images from a specific directory
// app.use('/images', express.static('/Users/ivanyatskovyna/Desktop/runningbuild/images/'));

// app.use('/images', (req, res, next) => {
//     console.log(`Request for ${req.url}`);
//     next();
// }, express.static('/Users/ivanyatskovyna/Desktop/runningbuild/images/'));


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

const path = require('path');

// Serve static images from the external 'images' directory
app.use('/images', express.static(path.join(__dirname, '..', 'images')));

// Log requests for images (optional)
app.use('/images', (req, res, next) => {
    console.log(`Request for ${req.url}`);
    next();
});