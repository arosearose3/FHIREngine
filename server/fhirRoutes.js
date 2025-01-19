import express from 'express';
import { fetchCapabilityStatement } from './fhirService.js';

const router = express.Router();

// FHIR Capability Statement Endpoint
router.post('/getCapacity', async (req, res) => {
  try {
    // Extract server URL from request body
    const { serverUrl } = req.body;

    // Validate input
    if (!serverUrl) {
      return res.status(400).json({ 
        error: 'Server URL is required' 
      });
    }

    // Fetch capability statement using the service
    const capabilityStatement = await fetchCapabilityStatement(serverUrl);

    // Return the capability statement
    res.status(200).json(capabilityStatement);
  } catch (error) {
    console.error('FHIR Route error:', error);

    // Return a detailed error response
    res.status(500).json({ 
      error: 'Failed to fetch capability statement',
      details: error.message 
    });
  }
});

export default router;