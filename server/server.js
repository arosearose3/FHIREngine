import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import fhirRoutes from './fhirRoutes.js';

// ES Module path handling
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure environment
dotenv.config();
const PORT = process.env.PORT || 3001;

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/dist')));

// Route registration
app.use('/api/server', fhirRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Catch-all route to serve the SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});