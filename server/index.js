import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/apiRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

// Middleware to capture raw body for HMAC verification
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

app.use('/api', apiRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'Revive AI Engine (RECOVEROPS)', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  RECOVEROPS Server running on http://localhost:${PORT}`);
  console.log(`  Razorpay Webhook endpoint: http://localhost:${PORT}/api/webhooks/razorpay`);
  console.log(`=======================================================`);
});
