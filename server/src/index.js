const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load .env from server root regardless of cwd
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
app.use(cors());
// capture raw body for webhook verification while still parsing JSON elsewhere
app.use(express.json({ verify: (req, res, buf) => { req.rawBody = buf; } }));

const authRoutes = require('./routes/auth');
const jobsRoutes = require('./routes/jobs');
const bidsRoutes = require('./routes/bids');
const contractsRoutes = require('./routes/contracts');
const messagesRoutes = require('./routes/messages');
const paymentsRoutes = require('./routes/payments');
const errorHandler = require('./middleware/errorHandler');

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/bids', bidsRoutes);
app.use('/api/contracts', contractsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/payments', paymentsRoutes);

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/freelance-platform';

async function startMemoryMongo() {
  const { MongoMemoryServer } = require('mongodb-memory-server');
  const mongod = await MongoMemoryServer.create();
  console.log('Using in-memory MongoDB (dev fallback)');
  return mongod.getUri('freelance-platform');
}

async function connectMongo() {
  const preferred = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/freelance-platform';
  try {
    await mongoose.connect(preferred, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected to MongoDB at', preferred.replace(/\/\/.*@/, '//***@'));
    return;
  } catch (err) {
    console.warn('Primary MongoDB unavailable:', err.message);
    console.warn('Falling back to in-memory MongoDB...');
    const uri = await startMemoryMongo();
    await mongoose.connect(uri);
    console.log('Connected to in-memory MongoDB');
  }
}

connectMongo().then(() => {
  app.listen(PORT, () => console.log('Server running on port', PORT));
}).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

