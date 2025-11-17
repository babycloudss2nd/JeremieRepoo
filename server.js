require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.CONNECTION_STRING;
const client = new MongoClient(uri);

async function startServer() {
  try {
    await client.connect();
    const db = client.db('Security'); 
    const userCollection = db.collection('Users'); 
    const productCollection = db.collection('Products');
    console.log('✅ Connected to MongoDB Atlas');

    app.post('/api/signup', async (req, res) => {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
      }
      try {
        const existingUser = await userCollection.findOne({ email });
        if (existingUser) {
          return res.status(409).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await userCollection.insertOne({
          name,
          email,
          password: hashedPassword,
        });
        res.status(201).json({ message: 'User created', userId: result.insertedId });
      } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ message: 'Server error during signup' });
      }
    });

    app.post('/api/login', async (req, res) => {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }
      try {
        const user = await userCollection.findOne({ email });
        if (!user) {
          return res.status(401).json({ message: 'Invalid email or password' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(401).json({ message: 'Invalid email or password' });
        }
        res.status(200).json({ message: 'Login successful', userId: user._id });
      } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error during login' });
      }
    });

    app.get('/api/products', async (req, res) => {
      try {
        const products = await productCollection.find({}).toArray();
        res.status(200).json(products);
      } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ message: 'Failed to fetch products' });
      }
    });

    app.post('/api/products', async (req, res) => {
      try {
        const result = await productCollection.insertOne(req.body);
        res.status(201).json({ message: 'Product added', productId: result.insertedId });
      } catch (err) {
        console.error('Error adding product:', err);
        res.status(500).json({ message: 'Failed to add product' });
      }
    });

app.listen(5000, 'localhost', () => console.log("✅ Connected to MongoDB and Server running locally on http://localhost:5000"));
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  }
}

startServer();
