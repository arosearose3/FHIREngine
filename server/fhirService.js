import axios from 'axios';

/**
 * Fetch capability statement for a given FHIR server
 * @param {string} serverUrl - The base URL of the FHIR server
 * @returns {Promise<Object>} Capability statement
 */
export async function fetchCapabilityStatement(serverUrl) {
  // Validate input
  if (!serverUrl) {
    throw new Error('Server URL is required');
  }

  try {
    // Ensure the URL ends with a trailing slash
    const normalizedUrl = serverUrl.endsWith('/') ? serverUrl : `${serverUrl}/`;

    // Fetch the capability statement
    const response = await axios.get(`${normalizedUrl}metadata`, {
      headers: {
        'Accept': 'application/fhir+json'
      }
    });

    // Return the capability statement
    return response.data;
  } catch (error) {
    console.error('Error fetching capability statement:', error);

    // Provide more detailed error information
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw new Error(`Failed to fetch capability statement. Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error(`No response received when fetching capability statement. URL: ${serverUrl}`);
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error(`Error setting up capability statement request: ${error.message}`);
    }
  }
}