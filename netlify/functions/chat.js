const axios = require('axios');

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      body: JSON.stringify({ error: 'Method Not Allowed' }) 
    };
  }

  try {
    // Parse the request body
    const data = JSON.parse(event.body);
    const { model, messages, apiKey } = data;
    
    if (!apiKey) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: 'OpenAI API key is required' }) 
      };
    }
    
    // Use different model names based on user selection
    const modelName = model === 'gpt4o' ? 'gpt-4o' : 'gpt-4-turbo';
    
    console.log(`Using model: ${modelName}`);
    
    // Call the OpenAI API
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
    
    // Return the response
    return {
      statusCode: 200,
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    
    return { 
      statusCode: 500, 
      body: JSON.stringify({ 
        error: 'An error occurred while processing your request',
        details: error.response?.data || error.message
      }) 
    };
  }
};
