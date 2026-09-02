import express from 'express';
import cors from 'cors';
import apiRoutes from '../server/routes/apiRoutes.js';

const app = express();
app.use(cors());

// Capture raw body for HMAC webhook verification
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

app.use('/api', apiRoutes);

app.get('/health', (req, res) => {
  res.json({ 
    status: 'UP', 
    service: 'Revive AI Engine', 
    environment: 'Vercel Serverless',
    timestamp: new Date().toISOString() 
  });
});

export default app;
