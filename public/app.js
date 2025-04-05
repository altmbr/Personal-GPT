// DOM Elements
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const modelSelect = document.getElementById('model-select');
const apiKeyInput = document.getElementById('api-key-input');
const saveApiKeyButton = document.getElementById('save-api-key');

// App state
let conversationHistory = [];
let apiKey = localStorage.getItem('openai_api_key') || '';

// Set API key from localStorage if available
if (apiKey) {
  apiKeyInput.value = '********'; // Show asterisks instead of the actual key for security
}

// Save API key to localStorage
saveApiKeyButton.addEventListener('click', () => {
  const newKey = apiKeyInput.value;
  if (newKey && newKey !== '********') {
    localStorage.setItem('openai_api_key', newKey);
    apiKey = newKey;
    apiKeyInput.value = '********';
    alert('API key saved successfully!');
  } else if (newKey === '') {
    localStorage.removeItem('openai_api_key');
    apiKey = '';
    alert('API key removed.');
  }
});

// Helper to create message elements
function createMessageElement(content, sender) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', `${sender}-message`);
  
  const contentDiv = document.createElement('div');
  contentDiv.classList.add('message-content');
  contentDiv.innerHTML = formatContent(content);
  
  messageDiv.appendChild(contentDiv);
  return messageDiv;
}

// Format content with markdown-like syntax
function formatContent(content) {
  // Convert code blocks
  content = content.replace(/```([\s\S]*?)```/g, (match, code) => {
    return `<pre><code>${code.trim()}</code></pre>`;
  });
  
  // Convert inline code
  content = content.replace(/`(.*?)`/g, '<code>$1</code>');
  
  // Convert line breaks
  content = content.replace(/\n/g, '<br>');
  
  return content;
}

// Add message to the UI
function addMessageToUI(content, sender) {
  const messageElement = createMessageElement(content, sender);
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Add a loading indicator
function addLoadingIndicator() {
  const loadingDiv = document.createElement('div');
  loadingDiv.classList.add('loading');
  loadingDiv.textContent = 'Thinking...';
  loadingDiv.id = 'loading-indicator';
  chatMessages.appendChild(loadingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Remove loading indicator
function removeLoadingIndicator() {
  const loadingDiv = document.getElementById('loading-indicator');
  if (loadingDiv) {
    loadingDiv.remove();
  }
}

// Send message to the server
async function sendMessageToServer(userMessage) {
  const model = modelSelect.value;
  
  // Check if API key is available
  if (!apiKey) {
    addMessageToUI('Please enter your OpenAI API key below and click "Save API Key" before sending messages.', 'error-message');
    return;
  }
  
  // Add user message to conversation history
  conversationHistory.push({ role: 'user', content: userMessage });
  
  try {
    addLoadingIndicator();
    
    // Make request to the API endpoint (will be redirected to Netlify function)
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: conversationHistory,
        apiKey: apiKey
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Unknown error');
    }
    
    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;
    
    // Add assistant message to conversation history
    conversationHistory.push({ role: 'assistant', content: assistantMessage });
    
    // Add assistant message to UI
    removeLoadingIndicator();
    addMessageToUI(assistantMessage, 'assistant');
  } catch (error) {
    removeLoadingIndicator();
    addMessageToUI(`Error: ${error.message}. Please check your API key and try again.`, 'error-message');
    console.error('Error:', error);
  }
}

// Event listener for send button
sendButton.addEventListener('click', () => {
  const message = userInput.value.trim();
  if (message) {
    addMessageToUI(message, 'user');
    userInput.value = '';
    sendMessageToServer(message);
  }
});

// Event listener for enter key
userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendButton.click();
  }
});

// Add welcome message
window.addEventListener('DOMContentLoaded', () => {
  addMessageToUI('Welcome to My Personal GPT! Enter your OpenAI API key below and choose a model to start chatting.', 'assistant');
});
