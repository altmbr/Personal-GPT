require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper function to retry requests with exponential backoff
async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      if (error.response?.status === 429 || 
          (error.response?.data && error.response.data.error?.type === 'rate_limit_exceeded')) {
        // This is a rate limit error, retry with exponential backoff
        retries++;
        if (retries >= maxRetries) throw error;
        
        const delay = initialDelay * Math.pow(2, retries - 1);
        console.log(`Rate limit hit, retrying in ${delay}ms (attempt ${retries}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // Not a rate limit error, don't retry
        throw error;
      }
    }
  }
}

// Route to handle OpenAI API requests
app.post('/api/chat', async (req, res) => {
  try {
    const { model, messages, apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'OpenAI API key is required' });
    }
    
    // Use different model names based on user selection
    let modelName;
    if (model === 'gpt4o') {
      modelName = 'gpt-4o';
    } else if (model === 'o3') {
      modelName = 'o3';
    } else {
      modelName = 'gpt-4-turbo';
    }
    
    console.log(`Using model: ${modelName}`);
    
    // Create a function that makes the request to OpenAI
    const makeRequest = () => axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: modelName,
        messages: messages,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Use the retry function to handle the request
    const response = await retryWithBackoff(makeRequest);
    
    res.json(response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    
    // Extract more specific error information to send to the client
    let errorMessage = 'Unknown error';
    let statusCode = 500;
    
    if (error.response) {
      // The request was made and the server responded with a status code outside of 2xx
      statusCode = error.response.status;
      
      if (error.response.data && error.response.data.error) {
        if (error.response.data.error.type === 'rate_limit_exceeded') {
          errorMessage = 'Rate limit exceeded. Please try again in a moment.';
        } else if (error.response.data.error.type === 'insufficient_quota') {
          errorMessage = 'Your OpenAI quota has been exceeded. Please check your billing details.';
        } else if (error.response.data.error.type === 'invalid_api_key') {
          errorMessage = 'Invalid API key. Please check your API key and try again.';
        } else {
          errorMessage = error.response.data.error.message || error.response.data.error.type;
        }
      }
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = 'No response received from OpenAI. Please check your internet connection.';
    } else {
      // Something happened in setting up the request that triggered an Error
      errorMessage = error.message;
    }
    
    res.status(statusCode).json({ 
      error: errorMessage,
      details: error.response?.data || error.message
    });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});
