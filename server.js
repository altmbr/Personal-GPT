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

// Route to handle OpenAI API requests
app.post('/api/chat', async (req, res) => {
  try {
    const { model, messages, apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'OpenAI API key is required' });
    }
    
    // Use different model names based on user selection
    const modelName = model === 'gpt4o' ? 'gpt-4o' : 'gpt-4-turbo';
    
    console.log(`Using model: ${modelName}`);
    
    const response = await axios.post(
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
    
    res.json(response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'An error occurred while processing your request',
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
